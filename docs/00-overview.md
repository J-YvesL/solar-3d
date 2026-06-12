# 00 — Project Overview

## What we are building

**Solar System 3D** is a technical POC: an interactive 3D model of the solar system rendered in the browser with Three.js. Body positions are **real**: a small backend API computes where each planet and moon actually is on its orbit today (or at any requested date), and the frontend animates everything forward from there.

One screen, with lightweight path routing (v2):

- A full-window black canvas with a subtle starfield.
- The Sun glowing at the center, 8 planets on their visible orbit lines.
- Click a planet → the camera flies to it, its major moons appear orbiting around it, and an information panel shows facts about the body.
- A top navigation bar jumps straight to the Sun or any planet; the URL mirrors the focused body (`/earth`, `/mars`, …) with working deep links and browser back/forward (History API only — no router library, doc 06).

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
| F12 | Standalone frontend: all assets (textures, models) are committed in the repo, the **frontend** never fetches anything from third-party servers at runtime. The backend's single external call is the 24 h-cached ISS TLE with a committed fallback (F19, doc 02) — the app stays fully functional offline |
| F13 | City lights: Earth's night hemisphere shows the real lights of major cities, fading out across the day/night terminator (best seen in the focused view) |
| F14 | Clicking Earth aims the camera at the visitor's own timezone meridian, so their region faces the camera (derived from the local time already shown in the panel) |
| F15 | Real seasons: each planet's spin axis leans toward its true ecliptic direction, so solstices and equinoxes happen at the right dates (near a June solstice, Earth's north pole leans toward the Sun and the arctic stays lit) |
| F16 | i18n: the whole app — UI labels and body content — follows the browser language in en/fr/es/it/de, falling back to English (doc 09) |
| F17 | Top navigation bar (Sun + 8 planets, system order, panel-badge colors) and per-body URLs (`/earth`, `/mars`, `/sun`, … for all 30 bodies) with deep links and browser back/forward |
| F18 | Footer shows the app version (`v2.0`) and the credit "Made by Jynfra with ❤️" linking to jynfra.com, alongside the texture attribution |
| F19 | The ISS as a 30th body (v3): real orbit computed from a live TLE (fetched by the backend, cached 24 h, committed fallback), clickable with info panel and `/iss` URL, rendered with a committed low-poly 3D model (docs 02/03/05/08) |

## Explicit non-goals

Do **not** implement any of these, even if they seem like natural improvements:

- No eclipse / cast shadows (no shadow maps). The day/night terminator from the point light is enough.
- No asteroid belt, comets, dwarf planets, or spacecraft. *(The v1/v2 "no artificial satellites" non-goal was lifted in v3 for exactly one object: the ISS — F19, stories S23–S24. No other satellite.)*
- No elliptical orbit *rendering* — orbits are drawn as circles (the *position* on the orbit is real, the drawn path is a circle; this is a documented simplification).
- No time-travel UI (date picker, speed slider) — simulated time runs at a fixed rate. (The API supports a `?date=` param for testing, but the UI does not expose it.)
- No server-side rendering, no database, no authentication.
- No language picker UI and no language persistence — the locale follows the browser language only (doc 09). *(The v1 "no i18n" non-goal was lifted in v2: F16.)*

## The two view modes

*(v2: a slim navigation bar overlays the top edge in **both** views — omitted from the diagrams below; spec in doc 06.)*

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
| **Body** | Any rendered celestial object: the Sun, a planet, a moon, or a satellite. 30 in total (1 + 8 + 20 + 1, the ISS). |
| **Ecliptic** | The plane of Earth's orbit. Our 3D world's XZ plane (`y = 0`) represents the ecliptic; orbital inclinations are small tilts relative to it. |
| **Epoch / J2000** | The reference instant for orbital data: 2000-01-01 12:00 TT, Julian Date 2451545.0. Orbital elements are given at J2000 plus per-century drift rates. |
| **Keplerian elements** | The 6 numbers describing an orbit: semi-major axis `a`, eccentricity `e`, inclination `I`, mean longitude `L`, longitude of perihelion `ϖ`, longitude of ascending node `Ω`. |
| **Mean anomaly (M)** | A fictitious angle that grows uniformly with time: `M = L − ϖ`. Input to Kepler's equation. |
| **Eccentric anomaly (E)** | Intermediate angle, solution of Kepler's equation `E − e·sin(E) = M`. |
| **True anomaly (ν)** | The real angle between perihelion and the body, seen from the Sun. Derived from `E`. |
| **Orbital angle** | *This project's* output value: the body's angular position on its orbit, `0–360°`, measured counter-clockwise (seen from "above"/+Y) from the reference direction +X. Computed as `(ϖ + ν) mod 360`. |
| **Rotation angle** | The body's spin orientation around its own axis, `0–360°`. Anchored to the real orientation at J2000 (doc 03 Table 5) so the day/night terminator is physically correct; the 19 minor moons use phase 0 (arbitrary but deterministic). |
| **Axial tilt** | Angle between the body's spin axis and the perpendicular to the ecliptic. Earth ≈ 23.4°, Uranus ≈ 98° (it rolls on its side). The *direction* the axis leans toward is the spin-pole azimuth (doc 03 Table 6) — it sets when solstices and equinoxes happen. |
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
| [09-i18n.md](09-i18n.md) | Locales, detection rule, UI strings (5 languages), localized body names, translation policy |
| [BACKLOG.md](BACKLOG.md) | The ordered list of stories to implement, one by one |
