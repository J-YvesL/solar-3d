# 02 — Backend Specification

The backend is a tiny Express app with **one** business endpoint. Its only job: return all 32 bodies with their static data and their **angular state** (position on orbit + spin orientation) at a given instant, computed from Keplerian elements.

## File layout

```
apps/backend/src/
├── server.ts            # createApp() + app.listen(3001) — nothing else
├── app.ts               # createApp(): express(), cors(), json, mounts routes
├── routes/
│   └── bodies.ts        # GET /api/bodies handler
├── ephemeris/
│   ├── julian.ts        # date → Julian Date / centuries since J2000
│   ├── kepler.ts        # solveKepler(), trueAnomaly(), planetOrbitalAngle()
│   ├── tle.ts           # S23 — parseTle(), deriveCircularElements(), getIssTle() (step E)
│   └── state.ts         # computeBodyStates(date): assembles BodyDto[]
└── data/
    ├── keplerianElements.ts   # Table 1 of doc 03
    ├── bodies.ts              # Tables 2+2b+3+7 of doc 03 (32 records)
    ├── bodyInfo.ts            # Table 4 of doc 03 (canonical English)
    ├── issTle.ts              # S23 — committed TLE snapshot (offline fallback, step E)
    └── localized/             # S19 — one file per non-English language (doc 09)
        ├── fr.ts              # localizedBodies: Record<id, { name; info }> (32 ids)
        ├── es.ts
        ├── it.ts
        └── de.ts
```

`app.ts` / `server.ts` are split so tests can import `createApp()` without opening a port (use `supertest`).

Also expose `GET /api/health` → `{ "status": "ok" }` (used by S1 acceptance).

## API contract

### `GET /api/bodies?date=<ISO8601>&lang=<code>`

- `date` optional. Default: server time at the moment of the request.
- Invalid `date` (NaN after `new Date(date).getTime()`) → `400 { "error": "Invalid date" }`.
- `lang` optional (S19). Allowed values: `en`, `fr`, `es`, `it`, `de` (doc 09). Default: `en`. Any other value → `400 { "error": "Invalid lang" }`.
- `lang` localizes **only** `name` and the three `info` fields of each body (`en` = the canonical data files; other languages = `data/localized/<lang>.ts`, doc 09). The DTO shape and all numeric/angular fields are identical across languages.
- Success → `200`, `Content-Type: application/json`:

```jsonc
{
  "epochIso": "2026-06-11T08:00:00.000Z",  // the instant actually used
  "bodies": [ /* 32 × BodyDto, order: sun, planets by distance, Pluto (dwarf planet, S28), then moons grouped by parent, then the iss (S23) */ ]
}
```

### DTO types (defined ONCE in `packages/shared/src/bodies.ts`)

```ts
export type BodyType = "star" | "planet" | "dwarfPlanet" | "moon" | "satellite"; // "satellite" added in S23 (ISS); "dwarfPlanet" added in S28 (Pluto)

export interface BodyInfo {
  description: string;
  composition: string;
  funFact: string;
}

export interface BodyDto {
  id: string;                  // lowercase, e.g. "earth", "io" — see doc 03 tables
  name: string;                // display name, e.g. "Earth"
  type: BodyType;
  parentId: string | null;     // null for sun; "sun" for planets and Pluto (dwarf planet); planet/dwarf-planet id for moons
  // physical
  radiusKm: number;
  rotationPeriodHours: number; // always > 0 (see doc 03 conventions)
  axialTiltDeg: number;        // 0–180; > 90 means retrograde-looking spin
  poleEclipticLonDeg: number;  // ecliptic longitude the spin pole leans toward (doc 03 Table 6); 0 for moons
  color: string;               // "#RRGGBB"
  // orbit (null for the sun)
  semiMajorAxisKm: number | null;
  eccentricity: number | null; // 0 for moons (circular approximation)
  inclinationDeg: number | null; // vs ecliptic (planets) or parent orbit plane (moons); > 90 = retrograde orbit
  nodeLonDeg: number | null;   // S23 — ascending-node longitude, satellites only (from the TLE); null for every other body (their node is ignored, doc 05)
  orbitalPeriodDays: number | null; // always > 0
  // state at epochIso
  orbitalAngleDeg: number | null; // [0, 360): position on the orbit, CCW from +X reference
  rotationAngleDeg: number;       // [0, 360): spin phase, 0 at J2000 by convention
  // panel content
  info: BodyInfo;
}

export interface BodiesResponse {
  epochIso: string;
  bodies: BodyDto[];
}
```

The sun: `parentId: null`, all orbit fields `null`, but it **does** have `rotationAngleDeg` (it spins).

## Algorithms — implement exactly as written

### A. Time → Julian centuries since J2000 (`ephemeris/julian.ts`)

```
JD(date)  = date.getTime() / 86_400_000 + 2_440_587.5
T(date)   = (JD(date) − 2_451_545.0) / 36_525        // Julian centuries since J2000
ΔdaysJ2000(date) = JD(date) − 2_451_545.0            // days since J2000 (fractional)
```

(We ignore the ~69 s difference between UTC and Terrestrial Time — irrelevant at this precision. Note it in a code comment.)

### B. Planet orbital angle (`ephemeris/kepler.ts`)

Inputs: the planet's row of Table 1 (doc 03), and `T` from step A. All angle math in **radians** internally; convert at the boundaries.

```
1. Propagate elements:        e = e₀ + ė·T
                              L = L₀ + L̇·T          (degrees)
                              ϖ = ϖ₀ + ϖ̇·T          (degrees)

2. Mean anomaly (deg):        M = (L − ϖ) mod 360    (normalize to [0, 360))

3. Solve Kepler's equation E − e·sin(E) = M for the eccentric anomaly E.
   Work in radians: Mr = M·π/180. Newton–Raphson, exactly 5 iterations:
       E ← Mr
       repeat 5×:  E ← E − (E − e·sin(E) − Mr) / (1 − e·cos(E))
   (5 iterations converge to machine precision for e < 0.21 — Mercury is the max among planets.
    Pluto's e ≈ 0.244 exceeds this, so Pluto is **not** positioned here — it uses Formula C below, doc 03 Table 2b.)

4. True anomaly:              ν = 2·atan2( √(1+e)·sin(E/2), √(1−e)·cos(E/2) )

5. Result:                    orbitalAngleDeg = (ϖ + ν·180/π) mod 360   (normalize to [0, 360))
```

**Documented approximation:** `ϖ + ν` is the heliocentric ecliptic longitude only for zero inclination; since planet inclinations are ≤ 7°, we accept this. The frontend draws circular orbits anyway (doc 05). Do not add node/inclination projection math.

### C. Moon orbital angle (circular, uniform) — and Pluto (dwarf planet, S28)

```
orbitalAngleDeg = ( L₀ + 360 · ΔdaysJ2000 / orbitalPeriodDays ) mod 360
```

with `L₀ = meanLongitudeAtJ2000Deg` from Table 3 (doc 03). The branch is taken for `type === "moon"` **and** `type === "dwarfPlanet"`: Pluto's eccentricity exceeds the Kepler solver's validity (step B), so it uses this same circular formula — heliocentric rather than around a planet — with `L₀ = 238.93` and `orbitalPeriodDays = 90560` from Table 2b. The scene draws a circular sun-anchored orbit regardless (doc 05), so the simplification is invisible.

### D. Rotation angle (every body, including the sun)

```
rotationAngleDeg = ( W₀ + 360 · (ΔdaysJ2000 · 24) / rotationPeriodHours ) mod 360
```

with `W₀ = rotationAtJ2000Deg` from Table 5 of doc 03 (0 for the 19 moons not listed there).

The anchor `W₀` ties the rotation phase to the **real orientation** of each body at J2000 (Earth: GMST; others: IAU/Horizons-derived — see doc 03 Table 5). The resulting invariant, used by the tests below:

```
subSolarLongitudeDeg = ( orbitalAngleDeg + 180 − rotationAngleDeg ) mod 360
```

matches the real sub-solar longitude at any date — i.e. the day/night terminator is correct (within a few degrees; for Earth, sub-solar longitude ≈ `(180 − 15 · UTC hours) mod 360`). This requires the 6-decimal `rotationPeriodHours` of doc 03 Table 2 — do not round them.

### E. ISS from a TLE (`ephemeris/tle.ts`) — S23

The ISS's orbit changes daily (atmospheric drag + monthly reboosts), so its elements come from a **TLE** (Two-Line Element set) instead of a static table. A TLE is fixed-width text; parse it by hand — **no dependency** (no SGP4: with `e ≈ 0.0005` the project's existing circular approximation applies, same as the moons).

**Sources (tried in order, first success wins):**
1. CelesTrak — `https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE` (plain text).
2. wheretheiss.at — `https://api.wheretheiss.at/v1/satellites/25544/tles` (JSON `{ line1, line2 }`), fallback when CelesTrak is unreachable or blocks the host (it 403s some server IPs).

Both via native Node `fetch`.

**Offline mode (`ISS_TLE_OFFLINE=1`):** when set, `getIssTle()` never touches the network — it serves the disk cache (even if stale) or the committed snapshot. The `dev` script sets it so local development never queries these services (repeated dev-server restarts otherwise get the host IP blocked). Production (`build` + run) leaves it unset and fetches normally; `dev:online` is the opt-in for a deliberate local refresh. The J2 propagation keeps the snapshot-based position accurate for weeks, so offline dev still renders the ISS correctly.

**Caching (`getIssTle()`):** lazy in-memory cache (module-level variable) **backed by a disk cache** at `apps/backend/.cache/iss-tle.json` (gitignored) so the once-per-24 h budget survives dev-server restarts — the in-memory cache alone re-fetches on every restart, which is what gets the host IP throttled. The disk cache is loaded lazily on first call and written (with its `fetchedAt`) after every successful fetch; disabled under vitest to keep unit tests hermetic, and all disk I/O is best-effort (a read-only or corrupt cache never throws). TTL **24 h** (the TLE is published 2–3×/day; fetching more often is pointless). On any failure of **both** sources (network, non-200, malformed body) serve the previous cached TLE, or the committed snapshot in `data/issTle.ts` — a TLE fetch failure must **never** produce a 500 or block `/api/bodies`. Retry no sooner than 30 min after a failure. The committed snapshot keeps the app fully functional offline (orbit shape exact, phase stale — accepted).

**Parsing (`parseTle(line1, line2)`)** — 1-indexed fixed columns:

| Field | Line | Columns | Example value (TLE below) |
|---|---|---|---|
| epoch (YYDDD.DDDDDDDD) | 1 | 19–32 | `24001.50000000` → 2024-01-01T12:00:00Z |
| inclination (deg) | 2 | 9–16 | `51.6416` |
| RAAN Ω (deg) | 2 | 18–25 | `247.4627` |
| eccentricity (implied `0.`) | 2 | 27–33 | `0006703` → 0.0006703 |
| argument of perigee ω (deg) | 2 | 35–42 | `130.5360` |
| mean anomaly M (deg) | 2 | 44–51 | `325.0288` |
| mean motion n (rev/day) | 2 | 53–63 | `15.49512571` |

Epoch year: `YY ≤ 56 → 2000+YY`, else `1900+YY`; day-of-year is 1-based fractional UTC (`Date.UTC(year, 0, 1) + (ddd − 1) × 86 400 000`). No checksum validation (out of scope). Reference TLE for the parser unit tests:

```
1 25544U 98067A   24001.50000000  .00016717  00000-0  30571-3 0  9991
2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49512571429723
```

**Derived circular elements (`deriveCircularElements(tle)`):**

```
orbitalPeriodDays = 1 / n                                   // ≈ 0.06454 (~92.9 min)
semiMajorAxisKm   = (μ · (86400/n)² / 4π²)^(1/3)            // μ = 398 600.4418 km³/s² → ≈ 6 796 km
u₀                = (ω + M) mod 360                         // argument of latitude at the TLE epoch — ≈ 95.565 for the TLE above
```

**State at the requested date** (same circular formula as the moons, anchored on the TLE epoch instead of J2000), in the **equatorial** TLE frame:

```
ΔdaysSinceTleEpoch = (date − tleEpoch) / 86 400 000
uEq                = u₀ + 360 · n · ΔdaysSinceTleEpoch        // argument of latitude (equatorial)
Ω̇                  = −(3/2) · J2 · (Re / a)² · (360 · n) · cos i   // J2 nodal regression, deg/day, ≈ −4.96 for the ISS (e ≈ 0 ⇒ p ≈ a)
ΩEq                = Ω₀ + Ω̇ · ΔdaysSinceTleEpoch             // precessed RAAN (equatorial)
```

with `J2 = 1.08263e-3` and `Re = 6378.137 km` (doc 03). The ISS orbit plane regresses ~5°/day, so the RAAN **must** be propagated from the TLE epoch or the rendered position drifts up to ~5° between TLE refreshes.

**Equatorial → ecliptic conversion (`ephemeris/frames.ts`).** TLE inclination/RAAN are measured against Earth's **equator** and the vernal point, but the frontend renders every orbit in the **ecliptic** plane (doc 05). Using the raw equatorial elements tilts the orbit plane by the obliquity and shifts the rendered sub-satellite point by up to ~23° (mostly in longitude — the "missing Y rotation" symptom). Convert with `equatorialToEcliptic(i, ΩEq, uEq, ε)`, ε = Earth's obliquity 23.44° (doc 03):

```
R    = Rx(−ε) · Rz(Ω) · Rx(i)         // orbit orientation, equatorial→ecliptic (z-up)
i′   = acos(R·ẑ · ẑ)                   // tilt from orbit normal (3rd column of R)
Ω′   = atan2(nₓ, −n_y)                 // ascending-node longitude, n = orbit normal
δ    = atan2(n · (N × c₁), N · c₁)     // shift of u: N = node dir, c₁ = R's 1st column (equatorial u = 0)
u′   = (uEq + δ) mod 360
```

```
orbitalAngleDeg  = u′                  // ecliptic argument of latitude
rotationAngleDeg = orbitalAngleDeg     // LVLH attitude: the ISS keeps the same face toward Earth
```

DTO mapping: `inclinationDeg = i′`, `nodeLonDeg = Ω′`, `orbitalAngleDeg = u′`, `eccentricity: 0`, `rotationPeriodHours = orbitalPeriodDays × 24`. Residual error vs real trackers is < ~1° (TLE freshness + circular approximation). This replaces the earlier POC simplification that fed raw equatorial elements into the ecliptic scene.

All `mod 360` operations must return values in `[0, 360)` **including for negative inputs**: use `((x % 360) + 360) % 360`.

## Required unit tests (Vitest)

These expected values were produced by a reference implementation of the exact algorithms above. Tolerances are generous on purpose.

`ephemeris/julian.test.ts`
1. `JD(2000-01-01T12:00:00Z)` = 2451545.0 exactly; `T` = 0.
2. `JD(2026-01-03T18:00:00Z)` = 2461044.25.

`ephemeris/kepler.test.ts` (call the full pipeline with Table 1 data)
3. Earth @ `2000-01-01T12:00:00Z` → `orbitalAngleDeg` = **100.380 ± 0.01**.
4. Earth @ `2026-01-03T18:00:00Z` (perihelion) → mean anomaly ≈ 0 (±0.05°) and `orbitalAngleDeg` = **103.012 ± 0.01** (≈ ϖ, as expected at perihelion — this validates the whole chain).
5. Mercury @ `2000-01-01T12:00:00Z` → **253.951 ± 0.01**.
6. Jupiter @ `2030-01-01T00:00:00Z` → **222.187 ± 0.01**.
7. Kepler solver edge: `M = 0` → `E = 0`, `ν = 0` for any `e`.
8. Output always in `[0, 360)` (test a date far in the past, e.g. 1900-01-01).

`ephemeris/state.test.ts`
9. Moon @ J2000 → `orbitalAngleDeg` = 218.32; @ J2000 + exactly one period (27.3217 d) → 218.32 ± 0.001.
10. Moon @ J2000 + 7 d → **310.554 ± 0.01**.
11. Earth rotation @ J2000 → **280.461 ± 0.01** (= GMST anchor); @ J2000 + 48 h → **282.432 ± 0.01**.
11b. Sub-solar longitude (terminator anchoring): for Earth, compute `(orbitalAngleDeg + 180 − rotationAngleDeg) mod 360` → @ `2026-06-11T12:00:00Z` = **0.74 ± 0.5** (sun over ~Greenwich at noon UTC); @ `2026-06-11T00:00:00Z` = **180.75 ± 0.5** (sun over the antimeridian at midnight UTC).

`data/bodies.test.ts`
12. Exactly 32 bodies; ids unique; 1 star, 8 planets, 1 dwarf planet, 21 moons, 1 satellite (S28).
13. Every non-null `parentId` refers to an existing body; moon counts per parent: earth 1, mars 2, jupiter 4, saturn 7, uranus 5, neptune 1, pluto 1 (Charon, S28); pluto has `parentId === "sun"` and `type === "dwarfPlanet"`; the iss has `parentId === "earth"` and `type === "satellite"` (S23).
14. Every body id has an entry in `bodyInfo`; every color matches `/^#[0-9A-F]{6}$/i`.
14b. Every body has `rotationAtJ2000Deg` in `[0, 360)` (added by S13).
14c. Every body has `poleEclipticLonDeg` in `[0, 360)`; spot checks vs doc 03 Table 6: earth exactly 90, venus 210.19, uranus 77.65, pluto 317.35, every moon 0 (S28: pluto, a dwarf planet, has a real non-zero pole).

`routes/bodies.test.ts` (supertest against `createApp()`)
15. `GET /api/bodies` → 200, `bodies.length === 32`, `epochIso` parses to a valid date, every planet/dwarf-planet/moon has `orbitalAngleDeg` in `[0, 360)`.
16. `GET /api/bodies?date=2000-01-01T12:00:00Z` → Earth's `orbitalAngleDeg` ≈ 100.380.
17. `GET /api/bodies?date=banana` → 400.
18. `GET /api/bodies?lang=fr` → 200; Earth's `name` = `"Terre"` (doc 09 names table) and its `info.description` differs from the English one; `orbitalAngleDeg` identical to the no-`lang` call at the same `date`. (S19)
19. `GET /api/bodies?lang=pt` → `400 { "error": "Invalid lang" }`; `?lang=` handling combines with `?date=` (invalid date still wins its own 400). (S19)
20. `GET /api/bodies` and `GET /api/bodies?lang=en` → byte-identical `bodies` for the same `date` (default is `en`). (S19)
21. Data completeness (unit test on `data/localized/*`): each of fr/es/it/de covers exactly the 32 ids with non-empty `name`, `info.description`, `info.composition`, `info.funFact`; every `name` matches the doc 09 names table. (S19; 29 → 30 in S23; 30 → 32 in S28)

`ephemeris/tle.test.ts` (S23 — all offline, no network in tests)
22. `parseTle` on the reference TLE of step E → epoch `2024-01-01T12:00:00.000Z`, inclination 51.6416, RAAN 247.4627, e 0.0006703, ω 130.5360, M 325.0288, n 15.49512571 (exact field values).
23. `deriveCircularElements` on the same TLE → `orbitalPeriodDays` = **0.06454 ± 0.0001**, `semiMajorAxisKm` = **6 796 ± 5**, `u₀` = **95.565 ± 0.01**.
24. `GET /api/bodies` (supertest) → contains the `iss`: `type === "satellite"`, `parentId === "earth"`, `orbitalAngleDeg` ∈ [0, 360), `inclinationDeg` ∈ [51, 52.5], `nodeLonDeg` ∈ [0, 360), `semiMajorAxisKm` ∈ [6 600, 6 900], `rotationAngleDeg === orbitalAngleDeg`; every **non-satellite** body has `nodeLonDeg === null`. (S23)
25. Offline fallback: with the CelesTrak fetch failing (injected/mocked — the fetch function must be injectable for this), `getIssTle()` returns the committed snapshot and `/api/bodies` still answers 200 with a valid iss entry. (S23)

## package.json scripts (backend)

```jsonc
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  }
}
```
