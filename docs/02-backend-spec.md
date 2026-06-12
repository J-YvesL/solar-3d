# 02 — Backend Specification

The backend is a tiny Express app with **one** business endpoint. Its only job: return all 29 bodies with their static data and their **angular state** (position on orbit + spin orientation) at a given instant, computed from Keplerian elements.

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
    ├── bodies.ts              # Tables 2+3+7 of doc 03 (30 records)
    ├── bodyInfo.ts            # Table 4 of doc 03 (canonical English)
    ├── issTle.ts              # S23 — committed TLE snapshot (offline fallback, step E)
    └── localized/             # S19 — one file per non-English language (doc 09)
        ├── fr.ts              # localizedBodies: Record<id, { name; info }> (30 ids)
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
  "bodies": [ /* 30 × BodyDto, order: sun, planets by distance, then moons grouped by parent, then the iss (S23) */ ]
}
```

### DTO types (defined ONCE in `packages/shared/src/bodies.ts`)

```ts
export type BodyType = "star" | "planet" | "moon" | "satellite"; // "satellite" added in S23 (the ISS)

export interface BodyInfo {
  description: string;
  composition: string;
  funFact: string;
}

export interface BodyDto {
  id: string;                  // lowercase, e.g. "earth", "io" — see doc 03 tables
  name: string;                // display name, e.g. "Earth"
  type: BodyType;
  parentId: string | null;     // null for sun; "sun" for planets; planet id for moons
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
   (5 iterations converge to machine precision for e < 0.21 — Mercury is the max.)

4. True anomaly:              ν = 2·atan2( √(1+e)·sin(E/2), √(1−e)·cos(E/2) )

5. Result:                    orbitalAngleDeg = (ϖ + ν·180/π) mod 360   (normalize to [0, 360))
```

**Documented approximation:** `ϖ + ν` is the heliocentric ecliptic longitude only for zero inclination; since planet inclinations are ≤ 7°, we accept this. The frontend draws circular orbits anyway (doc 05). Do not add node/inclination projection math.

### C. Moon orbital angle (circular, uniform)

```
orbitalAngleDeg = ( L₀ + 360 · ΔdaysJ2000 / orbitalPeriodDays ) mod 360
```

with `L₀ = meanLongitudeAtJ2000Deg` from Table 3 (doc 03).

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

**Source:** `https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE` (native Node `fetch`).

**Caching (`getIssTle()`):** lazy in-memory cache (module-level variable), TTL **24 h** (the TLE is published 2–3×/day; fetching more often is pointless). On any failure (network, non-200, malformed body) serve the previous cached TLE, or the committed snapshot in `data/issTle.ts` — a TLE fetch failure must **never** produce a 500 or block `/api/bodies`. Retry no sooner than 30 min after a failure. The committed snapshot keeps the app fully functional offline (orbit shape exact, phase stale — accepted).

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

**State at the requested date** (same circular formula as the moons, anchored on the TLE epoch instead of J2000):

```
ΔdaysSinceTleEpoch = (date − tleEpoch) / 86 400 000
orbitalAngleDeg    = (u₀ + 360 · n · ΔdaysSinceTleEpoch) mod 360
rotationAngleDeg   = orbitalAngleDeg        // LVLH attitude: the ISS keeps the same face toward Earth (tidally-locked equivalent)
```

DTO mapping: `inclinationDeg` and `nodeLonDeg` straight from the TLE, `eccentricity: 0`, `rotationPeriodHours = orbitalPeriodDays × 24`. **Documented approximation:** TLE inclination/RAAN are equatorial (vs Earth's equator and the vernal point) but the scene applies them in the ecliptic frame like every moon orbit — plane-orientation error ≤ the 23.44° obliquity, accepted for this POC (same class as the ignored Ω of the moons). The position *along* the orbit and the period are unaffected.

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
12. Exactly 30 bodies; ids unique; 1 star, 8 planets, 20 moons, 1 satellite (S23).
13. Every non-null `parentId` refers to an existing body; moon counts per planet: earth 1, mars 2, jupiter 4, saturn 7, uranus 5, neptune 1; the iss has `parentId === "earth"` and `type === "satellite"` (S23).
14. Every body id has an entry in `bodyInfo`; every color matches `/^#[0-9A-F]{6}$/i`.
14b. Every body has `rotationAtJ2000Deg` in `[0, 360)` (added by S13).
14c. Every body has `poleEclipticLonDeg` in `[0, 360)`; spot checks vs doc 03 Table 6: earth exactly 90, venus 210.19, uranus 77.65, every moon 0.

`routes/bodies.test.ts` (supertest against `createApp()`)
15. `GET /api/bodies` → 200, `bodies.length === 29`, `epochIso` parses to a valid date, every planet/moon has `orbitalAngleDeg` in `[0, 360)`.
16. `GET /api/bodies?date=2000-01-01T12:00:00Z` → Earth's `orbitalAngleDeg` ≈ 100.380.
17. `GET /api/bodies?date=banana` → 400.
18. `GET /api/bodies?lang=fr` → 200; Earth's `name` = `"Terre"` (doc 09 names table) and its `info.description` differs from the English one; `orbitalAngleDeg` identical to the no-`lang` call at the same `date`. (S19)
19. `GET /api/bodies?lang=pt` → `400 { "error": "Invalid lang" }`; `?lang=` handling combines with `?date=` (invalid date still wins its own 400). (S19)
20. `GET /api/bodies` and `GET /api/bodies?lang=en` → byte-identical `bodies` for the same `date` (default is `en`). (S19)
21. Data completeness (unit test on `data/localized/*`): each of fr/es/it/de covers exactly the 30 ids with non-empty `name`, `info.description`, `info.composition`, `info.funFact`; every `name` matches the doc 09 names table. (S19; 29 → 30 in S23)

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
