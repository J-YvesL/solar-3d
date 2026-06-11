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
│   └── state.ts         # computeBodyStates(date): assembles BodyDto[]
└── data/
    ├── keplerianElements.ts   # Table 1 of doc 03
    ├── bodies.ts              # Tables 2+3 of doc 03 (29 records)
    └── bodyInfo.ts            # Table 4 of doc 03
```

`app.ts` / `server.ts` are split so tests can import `createApp()` without opening a port (use `supertest`).

Also expose `GET /api/health` → `{ "status": "ok" }` (used by S1 acceptance).

## API contract

### `GET /api/bodies?date=<ISO8601>`

- `date` optional. Default: server time at the moment of the request.
- Invalid `date` (NaN after `new Date(date).getTime()`) → `400 { "error": "Invalid date" }`.
- Success → `200`, `Content-Type: application/json`:

```jsonc
{
  "epochIso": "2026-06-11T08:00:00.000Z",  // the instant actually used
  "bodies": [ /* 29 × BodyDto, order: sun, planets by distance, then moons grouped by parent */ ]
}
```

### DTO types (defined ONCE in `packages/shared/src/bodies.ts`)

```ts
export type BodyType = "star" | "planet" | "moon";

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
12. Exactly 29 bodies; ids unique; 1 star, 8 planets, 20 moons.
13. Every non-null `parentId` refers to an existing body; moon counts per planet: earth 1, mars 2, jupiter 4, saturn 7, uranus 5, neptune 1.
14. Every body id has an entry in `bodyInfo`; every color matches `/^#[0-9A-F]{6}$/i`.
14b. Every body has `rotationAtJ2000Deg` in `[0, 360)` (added by S13).
14c. Every body has `poleEclipticLonDeg` in `[0, 360)`; spot checks vs doc 03 Table 6: earth exactly 90, venus 210.19, uranus 77.65, every moon 0.

`routes/bodies.test.ts` (supertest against `createApp()`)
15. `GET /api/bodies` → 200, `bodies.length === 29`, `epochIso` parses to a valid date, every planet/moon has `orbitalAngleDeg` in `[0, 360)`.
16. `GET /api/bodies?date=2000-01-01T12:00:00Z` → Earth's `orbitalAngleDeg` ≈ 100.380.
17. `GET /api/bodies?date=banana` → 400.

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
