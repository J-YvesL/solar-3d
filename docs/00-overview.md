# 00 — Project Overview

## What we are building

**Solar System 3D** is a technical POC: an interactive 3D model of the solar system rendered in the browser with Three.js. Body positions are **real**: a small backend API computes where each planet and moon actually is on its orbit today (or at any requested date), and the frontend animates everything forward from there.

One screen, no routing:

- A full-window black canvas with a subtle starfield.
- The Sun glowing at the center, 8 planets on their visible orbit lines.
- Click a planet → the camera flies to it, its major moons appear orbiting around it, and an information panel shows facts about the body.

## Feature list

| # | Feature |
|---|---------|
| F1 | Full-window Three.js canvas, black background, subtle starfield |
| F2 | Sun at center, emissive and glowing (bloom) |
| F3 | 8 planets placed at their **real current position** on their orbit (angle from API) |
| F4 | Orbit lines drawn for every planet |
| F5 | Sizes and distances **not to scale**, but relative proportions remain visible (Jupiter clearly bigger than Earth, Neptune clearly farther than Mars) |
| F6 | Day/night shading: the side of each body facing the Sun is lit, the far side is dark (real-time point light, no shadow maps) |
| F7 | Real textures: Earth shows its actual continents, Jupiter its bands and Great Red Spot, Saturn its rings |
| F8 | Continuous animation: bodies advance on their orbits and spin on their axes (accelerated simulated time) |
| F9 | Click a planet → animated camera zoom; focused view shows the planet and its major moons on one half of the screen, an info panel (composition, orbital period, etc.) on the other half |
| F10 | Responsive: on desktop the focused view splits left (3D) / right (panel); on mobile/portrait it splits top (3D) / bottom (panel) |
| F11 | Exit focus with Escape, a Back button, or by clicking empty space |
| F12 | Fully standalone: all assets (textures) are committed in the repo, the app never fetches anything from third-party servers at runtime |

## Explicit non-goals

Do **not** implement any of these, even if they seem like natural improvements:

- No eclipse / cast shadows (no shadow maps). The day/night terminator from the point light is enough.
- No asteroid belt, comets, dwarf planets, spacecraft, or artificial satellites.
- No elliptical orbit *rendering* — orbits are drawn as circles (the *position* on the orbit is real, the drawn path is a circle; this is a documented simplification).
- No time-travel UI (date picker, speed slider) — simulated time runs at a fixed rate. (The API supports a `?date=` param for testing, but the UI does not expose it.)
- No server-side rendering, no database, no authentication.
- No i18n — everything is in English.

## The two view modes

### System view (initial)

```
┌────────────────────────────────────────────────────────────┐
│ ·    ·       ·          ·        ·      ·          ·     · │
│   ·      ╭───────────────────────────────╮    ·           │
│      ╭───┤        (orbit circles)        ├───╮      ·     │
│  ·  ╱    ╰───────────────────────────────╯    ╲           │
│    │   ○ mercury  ◍ venus    ☀ SUN   ◍ earth   │  ·       │
│  · ╲          ◍ mars      (glowing)           ╱        ·  │
│     ╰───╮   ◯ jupiter   ◯ saturn(rings)  ╭───╯            │
│  ·      ╰────────────────────────────────╯   ·        ·   │
│ ·     ·        ·     ◌ uranus   ◌ neptune       ·         │
└────────────────────────────────────────────────────────────┘
  OrbitControls: drag to rotate, wheel/pinch to zoom
```

### Focused view — desktop (≥ 769 px wide, landscape)

```
┌──────────────────────────────┬─────────────────────────────┐
│ ·        ·         ·         │  ┌───────────────────────┐  │
│       io ○                   │  │  JUPITER               │  │
│   ╭────────╮    ○ europa     │  │  Gas giant             │  │
│   │        │                 │  │  ─────────────────     │  │
│   │ JUPITER│  ○ ganymede     │  │  Composition: H, He…   │  │
│   │  (lit  │                 │  │  Year: 4 333 days      │  │
│   │  side) │     ○ callisto  │  │  Day: 9.9 hours        │  │
│   ╰────────╯                 │  │  Moons: Io, Europa…    │  │
│ ·       ·          ·         │  │  Fun fact: …           │  │
│  [← Back]                    │  └───────────────────────┘  │
└──────────────────────────────┴─────────────────────────────┘
        left half: 3D                right half: React panel
```

### Focused view — mobile (≤ 768 px wide, or portrait)

```
┌─────────────────────────┐
│ ·     ○ io        ·     │
│   ╭────────╮            │
│   │JUPITER │ ○ europa   │   top half: 3D
│   ╰────────╯            │
│ · ○ ganymede  ·         │
│  [← Back]               │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ JUPITER             │ │
│ │ Gas giant           │ │   bottom half: React panel
│ │ Composition: H, He… │ │   (scrollable)
│ │ Year: 4 333 days    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Glossary

| Term | Meaning in this project |
|------|------------------------|
| **Body** | Any rendered celestial object: the Sun, a planet, or a moon. 29 in total (1 + 8 + 20). |
| **Ecliptic** | The plane of Earth's orbit. Our 3D world's XZ plane (`y = 0`) represents the ecliptic; orbital inclinations are small tilts relative to it. |
| **Epoch / J2000** | The reference instant for orbital data: 2000-01-01 12:00 TT, Julian Date 2451545.0. Orbital elements are given at J2000 plus per-century drift rates. |
| **Keplerian elements** | The 6 numbers describing an orbit: semi-major axis `a`, eccentricity `e`, inclination `I`, mean longitude `L`, longitude of perihelion `ϖ`, longitude of ascending node `Ω`. |
| **Mean anomaly (M)** | A fictitious angle that grows uniformly with time: `M = L − ϖ`. Input to Kepler's equation. |
| **Eccentric anomaly (E)** | Intermediate angle, solution of Kepler's equation `E − e·sin(E) = M`. |
| **True anomaly (ν)** | The real angle between perihelion and the body, seen from the Sun. Derived from `E`. |
| **Orbital angle** | *This project's* output value: the body's angular position on its orbit, `0–360°`, measured counter-clockwise (seen from "above"/+Y) from the reference direction +X. Computed as `(ϖ + ν) mod 360`. |
| **Rotation angle** | The body's spin orientation around its own axis, `0–360°`. Phase 0 at J2000 (arbitrary but deterministic). |
| **Axial tilt** | Angle between the body's spin axis and the perpendicular to the ecliptic. Earth ≈ 23.4°, Uranus ≈ 98° (it rolls on its side). |
| **Display units** | Three.js world units after applying the scaling formulas of doc 05. Not kilometers. |
| **System view / Focused view** | The two UI modes described above. |

## Document map

| Doc | Read it when you need… |
|-----|------------------------|
| [01-architecture.md](01-architecture.md) | Monorepo layout, packages, tooling, ports, data flow |
| [02-backend-spec.md](02-backend-spec.md) | API contract, DTO schema, Kepler algorithm, backend tests |
| [03-astronomical-data.md](03-astronomical-data.md) | **All numeric data** (orbital elements, radii, colors) and all info-panel texts |
| [04-frontend-architecture.md](04-frontend-architecture.md) | Frontend layering (react / three / domain / api), bridge pattern |
| [05-threejs-scene-spec.md](05-threejs-scene-spec.md) | Scaling formulas, lighting, materials, starfield, camera, animation |
| [06-interactions-ui-spec.md](06-interactions-ui-spec.md) | Picking, focus transitions, info panel content, responsive layout, edge cases |
| [07-coding-standards.md](07-coding-standards.md) | TypeScript/ESLint rules, naming, tests, definition of done |
| [08-assets-textures.md](08-assets-textures.md) | Texture download URLs, file naming, attribution, loading |
| [BACKLOG.md](BACKLOG.md) | The ordered list of stories to implement, one by one |
