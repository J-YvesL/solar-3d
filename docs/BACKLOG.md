# BACKLOG — Ordered Implementation Stories

Rules of engagement:

- Implement stories **strictly in order**. Do not start a story before the previous one meets its acceptance criteria **and** the definition of done (doc 07).
- One git commit per story: `S<n>: <summary>`.
- Each story lists the docs to (re)read first. When a detail is missing, the answer is in a doc — search the docs before improvising.
- Every story leaves the repo in a runnable state (`pnpm dev` works).

---

## S1 — Monorepo scaffolding

**Read first:** doc 01, doc 07.

**Goal:** Empty but wired workspace: three packages, shared tooling, both dev servers start.

**Tasks**
1. Root: `package.json` (scripts from doc 01), `pnpm-workspace.yaml`, `tsconfig.base.json` (doc 07), `.prettierrc`, `.gitignore` (node_modules, dist; NOT public/textures), `git init` + initial commit setup.
2. `packages/shared`: package.json (`@solar/shared`, `"main": "src/index.ts"`), tsconfig, empty `src/index.ts`.
3. `apps/backend`: Express app skeleton with `app.ts`/`server.ts` split (doc 02), only `GET /api/health` → `{ status: "ok" }`, scripts from doc 02, `cors()` enabled.
4. `apps/frontend`: Vite + React + TS app (manual setup, not create-vite leftovers), black page rendering `<App />` with text "solar-3d", proxy config from doc 01, scripts from doc 04. Add `public/textures/.gitkeep`.
5. ESLint flat config per app + root prettier; wire `lint`/`typecheck`/`test` scripts everywhere (empty test suites pass with `--passWithNoTests` or one placeholder test).

**Acceptance**
- [x] `pnpm install` then `pnpm dev` starts backend (3001) and frontend (5173) concurrently.
- [x] `curl http://localhost:3001/api/health` → `{"status":"ok"}`.
- [x] `curl http://localhost:5173/api/health` → same (proxy works).
- [x] Browser at 5173 shows a black page with "solar-3d".
- [x] `pnpm lint && pnpm typecheck && pnpm test` all pass.

---

## S2 — Shared DTO types

**Read first:** doc 02 (DTO section).

**Goal:** `packages/shared/src/bodies.ts` with `BodyType`, `BodyInfo`, `BodyDto`, `BodiesResponse` exactly as specified; re-exported from `index.ts`.

**Tasks:** Write the types verbatim from doc 02. Import `BodyDto` in a backend file and a frontend file (a typed placeholder) to prove resolution works in both directions.

**Acceptance**
- [x] `pnpm typecheck` passes with `@solar/shared` imported by both apps.
- [x] No runtime code in the shared package (types/interfaces only).

---

## S3 — Backend data layer

**Read first:** doc 03 (all tables), doc 02 (file layout, tests 12–14).

**Goal:** All 29 bodies' static data in `apps/backend/src/data/`, fully tested.

**Tasks**
1. `data/keplerianElements.ts`: Table 1 → `Record<PlanetId, { a0; aDot; e0; eDot; i0; iDot; L0; LDot; w0; wDot; o0; oDot }>` (au / degrees, per-century rates).
2. `data/bodies.ts`: Tables 2 + 3 → one array of 29 static records (id, name, type, parentId, radiusKm, rotationPeriodHours, axialTiltDeg, color, semiMajorAxisKm, eccentricity, inclinationDeg, orbitalPeriodDays, meanLongitudeAtJ2000Deg for moons). Copy values **verbatim** from doc 03; planets' eccentricity/inclinationDeg come from Table 1 J2000 values (see Table 2 notes).
3. `data/bodyInfo.ts`: Table 4 → `Record<string, BodyInfo>`.
4. `data/bodies.test.ts`: tests 12–14 from doc 02.

**Acceptance**
- [x] Tests 12–14 pass (29 bodies, unique ids, parent links, moon counts per planet, info for all, color format).
- [x] Spot-check vs doc 03: Earth radius 6371, Triton inclination 157.0, Venus tilt 177.36.

---

## S4 — Kepler ephemeris + `/api/bodies`

**Read first:** doc 02 (entire), doc 03 conventions.

**Goal:** The complete API: angular state computed for any date.

**Tasks**
1. `ephemeris/julian.ts` (JD, T, ΔdaysJ2000) + tests 1–2.
2. `ephemeris/kepler.ts` (steps B exactly: propagate, mean anomaly, Newton–Raphson ×5, true anomaly, normalize) + tests 3–8.
3. `ephemeris/state.ts`: assemble 29 `BodyDto`s for a date (planets via Kepler, moons via circular formula C, rotations via D, info merged) + tests 9–11.
4. `routes/bodies.ts`: `GET /api/bodies?date=` with default-now and 400-on-invalid + supertest tests 15–17.

**Acceptance**
- [x] All 17 backend tests green.
- [x] `curl "http://localhost:3001/api/bodies?date=2000-01-01T12:00:00Z"` → Earth `orbitalAngleDeg` ≈ 100.38.
- [x] `curl http://localhost:3001/api/bodies | jq '.bodies | length'` → 29.

---

## S5 — Frontend domain layer + API client + boot states

**Read first:** doc 04 (entire), doc 05 (scaling formulas), doc 06 (loading/error screens).

**Goal:** Frontend fetches and models the system; no 3D yet.

**Tasks**
1. `domain/types.ts`, `domain/scaling.ts` (formulas from doc 05) + `scaling.test.ts` asserting the expected-values table (doc 05).
2. `domain/solarSystemModel.ts` (+ tests: `childrenOf` ordering, `stateAt` extrapolation incl. mod-360 wrap).
3. `domain/simulationClock.ts` (+ test: tick accumulation, rate change keeps continuity).
4. `api/client.ts`: `fetchBodies()` + mapper DTO → `Body` (adds displayRadius / orbitDisplayRadius).
5. `react/App.tsx`: loading → ready/error state machine (doc 06 screens); on ready, render a plain `<ul>` of the 29 body names (temporary, replaced in S7).

**Acceptance**
- [x] Domain tests green (incl. scaling table: jupiter displayRadius ≈ 6.52, neptune orbit ≈ 356.4).
- [x] Browser shows loading screen, then the 29 names; with backend stopped, shows error screen and Retry works.

---

## S6 — Texture assets (one-shot)

**Read first:** doc 08 (entire).

**Goal:** All 11 texture files committed; app standalone.

**Tasks:** Write `scripts/download-textures.mjs` per doc 08; run `pnpm download-textures`; verify files; write `three/textures.ts` (`preloadTextures()`); wire texture preload into the boot sequence in parallel with the fetch; add the attribution line to the README.

**Acceptance**
- [x] `ls apps/frontend/public/textures` → exactly the 11 files of doc 08, each > 10 kB.
- [x] Script is idempotent (second run: all "skip").
- [x] Files are committed to git.
- [x] DevTools Network tab: zero requests to non-localhost hosts at runtime.

---

## S7 — Static scene: starfield + sun

**Read first:** doc 05 (renderer, scene graph, starfield, bloom), doc 04 (CanvasHost/SceneManager lifecycle).

**Goal:** First 3D pixels: full-window canvas, stars, glowing textured sun.

**Tasks**
1. `three/SceneManager.ts` skeleton: constructor builds renderer/camera/controls per doc 05, `resize()`, `dispose()`, `setAnimationLoop` rendering via composer.
2. `three/buildScene.ts`: `createStarfield()`, `createSun()` (mesh + PointLight + ambient).
3. `three/postprocessing.ts`: composer + UnrealBloomPass (doc 05 values).
4. `react/CanvasHost.tsx` mounting/disposing the SceneManager (doc 04 snippet); replace the S5 `<ul>` with the canvas.

**Manual acceptance**
- [x] Full-window black canvas; ~subtle stars; textured sun glowing at center.
- [x] OrbitControls: drag rotates, wheel zooms (15–900 limits).
- [x] Window resize keeps aspect correct.
- [x] No WebGL errors/warnings in console; React StrictMode double-mount does not leak (dispose works, only one canvas).


---

## S8 — Planets & orbits

**Read first:** doc 05 (coordinates, scene graph, materials, orbit lines, Saturn rings).

**Goal:** The 8 textured planets, positioned by real API angles, on visible orbit circles.

**Tasks**
1. `createBodyMesh()` (texture or flat-color material, userData.bodyId), `createOrbitLine()`, `createSaturnRings()` (UV remap snippet from doc 05).
2. Build the per-planet group hierarchy (orbitGroup → anchor → tiltGroup → mesh) with inclination and axial tilt.
3. Position each planet once from its API `orbitalAngleDeg` (no animation yet). Moons: build the groups too but `moonsGroup.visible = false`.

**Manual acceptance**
- [x] 8 planets visible on 8 orbit circles; spacing matches doc 05 table (mercury ~35 → neptune ~356).
- [x] Jupiter visibly ~2.6× Earth's diameter; Saturn has tilted rings with transparency.
- [x] Earth shows recognizable continents; Jupiter shows bands/red spot.
- [x] Day/night: each planet lit on the sun side, dark opposite.
- [x] Compare on-screen positions with an online "solar system now" map (e.g. theskylive.com/planetarium): angular layout of planets matches reality for today's date (rough check, ±10°).


---

## S9 — Animation (orbits + spin)

**Read first:** doc 05 (time & animation loop), doc 04 (`SolarSystemModel.stateAt`, `SimulationClock`).

**Goal:** Everything moves.

**Tasks:** Wire the frame loop: tick the clock (rate `SIM_DAYS_PER_REAL_SECOND_SYSTEM = 2`), recompute every visible body's anchor position and `rotation.y` from `model.stateAt(...)`, spin the sun too.

**Manual acceptance**
- [x] Simulation runs at real-time speed (1 real second = 1 simulated second). Verify by checking Earth's orbital angular velocity ≈ 360°/365.256 days ≈ 0.986°/day ≈ 0.0114°/s; easily confirmed by watching a planet move slowly across its orbit.
- [x] Planets spin on their axes; Uranus's spin axis is visibly sideways.
- [x] Motion is smooth (~60 fps, no per-frame allocations in the loop — reuse Vector3s).


---

## S10 — Picking + camera focus

**Read first:** doc 06 (picking, state machine), doc 05 (CameraDirector).

**Goal:** Click a planet → smooth zoom; Escape/empty-click → back.

**Tasks**
1. `three/Picker.ts` (pointerup + 5 px threshold, pickables list, hover cursor/highlight).
2. `three/CameraDirector.ts`: `focusBody` transition (1.2 s ease-in-out-cubic, moving-target tracking, view offset per layout), `trackFocusedBody`, `resetView`, `setFocusLayout`.
3. SceneManager API: `onBodySelected`, `onSelectionCleared`, `focusBody`, `resetView`, `setFocusLayout` (doc 04 signatures).
4. `react/useSolarSystemScene.ts` + App wiring: `selectedBodyId` state, Escape listener, clicks ignored during transition.

**Manual acceptance**
- [x] Click Earth: camera flies to it in ~1.2 s and keeps following it on its orbit; clock slows to focused rate.
- [x] Earth sits in the **left half** of the screen (view offset), not center.
- [x] Escape or clicking empty space animates back to the system view; clock rate restored.
- [x] Dragging the view then releasing over a planet does NOT select it.
- [x] Hover over a planet shows pointer cursor + slight highlight (desktop).


---

## S11 — Focused view: moons + InfoPanel + responsive

**Read first:** doc 06 (entire), doc 04 (childrenOf), doc 05 (moon orbits).

**Goal:** The full focused experience on desktop and mobile.

**Tasks**
1. Show/hide `moonsGroup` + moon orbit lines on focus/reset; moons animated like planets (already built in S8/S9); moons pickable when visible.
2. `react/InfoPanel.tsx` with the exact content/order/formatting of doc 06; `react/Hud.tsx` (Back button, hint line, attribution footer).
3. `react/useLayout.ts` (`(max-width: 768px), (orientation: portrait)`); pass layout to `focusBody`/`setFocusLayout`; panel CSS for both layouts (doc 06).
4. Edge cases table of doc 06: moon click, sun click, re-focus, resize/orientation while focused.

**Manual acceptance**
- [x] Desktop: Jupiter focused → Jupiter + 4 animated moons on the left, info card on the right (name, badge, description, composition, radius, periods humanized, distance, moon list, fun fact).
- [x] Mobile (devtools, 390×844): planet in top half, scrollable card in bottom half; rotating the viewport flips the layout live.
- [x] Clicking Io focuses it (panel updates); Back returns to Jupiter, a second Back to the system view.
- [x] Clicking the sun: panel only, no moons.
- [x] Attribution footer always visible.

---

## S12 — Polish & final QA

**Read first:** doc 06 (edge cases), doc 07 (definition of done), doc 00 (feature list).

**Tasks**
1. Sweep the doc 06 edge-case table once more; fix anything broken.
2. Performance pass: no allocations in the frame loop, pixelRatio cap, geometry segment counts per doc 05; verify ~60 fps in system view on a mid-range laptop.
3. README.md at repo root: what it is, screenshot placeholder, `pnpm install && pnpm download-textures && pnpm dev`, texture attribution.
4. Optional (only if everything above is done): CSS2D name labels on hover.

**Final acceptance — full feature checklist**
- [x] Every feature F1–F12 of doc 00 demonstrably works.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green from a clean clone.
- [x] Fresh-clone test: `pnpm install && pnpm dev` works offline except localhost (textures committed).

---

## S13 — Real rotation phase (correct day/night terminator)

**Read first:** doc 03 (Table 5 + the `rotationPeriodHours` note under Table 2), doc 02 (step D + tests 11/11b).

**Goal:** Anchor each body's rotation to its real J2000 orientation so the lit/dark hemispheres and the texture longitude facing the Sun are correct at the real current time — e.g. when it is noon UTC, Europe/Africa face the Sun on the 3D Earth.

**Context:** Until now `rotationAngleDeg` had phase 0 at J2000 (arbitrary): rotation *speed* was right, absolute orientation meant nothing. Doc 03 now provides Table 5 (`rotationAtJ2000Deg`, one anchor per body: GMST for Earth, IAU/Horizons-derived for the others) and higher-precision `rotationPeriodHours` in Table 2 (6 decimals — mandatory, otherwise the anchor drifts by tens of degrees per decade).

**Tasks**
1. `apps/backend/src/data/bodies.ts`: add `rotationAtJ2000Deg` to every record — Table 5 values for sun, the 8 planets and the Moon; `0` for the 19 other moons. Update `rotationPeriodHours` to the new 6-decimal Table 2 values (mercury, venus, earth, mars, jupiter, saturn, uranus, neptune — copy verbatim).
2. `apps/backend/src/ephemeris/state.ts`: update step D to `rotationAngleDeg = (rotationAtJ2000Deg + 360 · (ΔdaysJ2000 · 24) / rotationPeriodHours) mod 360` (doc 02). Remove the "phase 0 is arbitrary" code comment; reference doc 03 Table 5 instead.
3. `apps/backend/src/ephemeris/state.test.ts`: update test 11 (Earth @ J2000 → 280.461 ± 0.01; @ J2000 + 48 h → 282.432 ± 0.01) and add test 11b (Earth sub-solar longitude `(orbitalAngleDeg + 180 − rotationAngleDeg) mod 360` → 0.74 ± 0.5 @ `2026-06-11T12:00:00Z`, 180.75 ± 0.5 @ `2026-06-11T00:00:00Z`).
4. Check `data/bodies.test.ts` still passes (it should — no schema change beyond the added field); extend test 12–14 set with: every body has `rotationAtJ2000Deg` in `[0, 360)`.

No frontend change: the frontend already extrapolates from the API's `rotationAngleDeg` snapshot.

**Acceptance**
- [x] All backend tests green, including updated 11 and new 11b.
- [x] At load time, Earth's sub-solar longitude matches the current UTC time within **±15°** (= ±1 h): compute expected `(180 − 15 × UTC decimal hours) mod 360`, compare with `(orbitalAngleDeg + 180 − rotationAngleDeg) mod 360` from `curl http://localhost:3001/api/bodies` for Earth.
- [x] Visual check in the browser: at the current real time, the hemisphere of Earth facing the Sun is the one where it is daytime right now (e.g. at 12:00 UTC, Europe/Africa lit; at 00:00 UTC, the Pacific lit).
- [x] Moon terminator roughly matches the current real moon phase as seen in the focused Earth view.
- [x] Known limitation verified as documented (doc 03 Table 5 notes): Venus/Uranus anchors are indicative only — no acceptance check for them.

---

## S14 — Earth city lights on the night side

**Read first:** doc 00 (F13), doc 08 (manifest, `earth-night.jpg`, loading), doc 05 ("Earth night lights" section + animation loop).

**Goal:** The dark half of the 3D Earth shows the real lights of major cities (emissive night map), fading out across the day/night terminator; the day side is untouched.

**Context:** S13 anchored Earth's rotation to its real orientation, so the hemisphere in the dark is the one where it is actually night right now. Lighting up the cities makes that immediately readable: the night map (NASA-derived, Solar System Scope) is applied as an emissive layer masked to the night side in the shader. Frontend-only story — no backend, API or data change.

**Tasks**
1. `scripts/download-textures.mjs`: add the `earth-night.jpg` entry from the doc 08 manifest; run `pnpm download-textures` (the 11 existing files are skipped); commit the new file — 12 files total.
2. `three/textures.ts`: load `NIGHT_TEXTURE = "earth-night"` in `preloadTextures()` (updated doc 08 snippet); missing file stays non-fatal.
3. `three/earthNightLights.ts`: implement `applyEarthNightLights()` exactly per doc 05 — the night map is its **own** `uNightMap` sampler **added** to `totalEmissiveRadiance` (masked by sun direction), and it must **not** touch `material.emissive`/`emissiveMap`. Apply it to Earth's material only, in scene building, and only when both the `"earth-night"` texture and Earth's day `map` are present.
4. Frame loop (`SceneManager`): call the returned sun-direction updater once per frame, after the anchor positions are set (doc 05 loop pseudo-code; no per-frame allocations).
5. **Picker coexistence (regression):** the Picker (S10) writes `material.emissive` for hover/focus highlight (`0x222222`/`0x000000`). The night lights are decoupled from `emissive` (task 3) precisely so focusing Earth — which sets `emissive` to black — does not extinguish them. Do not revert to driving the lights through `material.emissive`.

**Manual acceptance**
- [x] Focused Earth view: the night hemisphere shows city lights — bright clusters recognizable (verified East Asia / SE Asia / Australia, whichever hemisphere is in night at the time); the sunlit hemisphere shows none.
- [x] The lights fade in gradually across the terminator (twilight band), no hard cut.
- [x] Consistency with S13: the lit cities are those where it is night in reality right now (verified ≈13:30 UTC → Asia-Pacific in darkness, Europe/Africa sunlit and unlit).
- [x] Focusing Earth keeps the lights (regression from the Picker emissive highlight): verified with `material.emissive` forced to black, lights still render.
- [x] Delete `apps/frontend/public/textures/earth-night.jpg` locally: the app still boots, Earth renders as before S14 (console warning only) — observed when the file was absent before download. Restore the file afterwards.
- [x] No shader compile errors/warnings in the console (verified via headless render).
- [x] `pnpm download-textures` is idempotent again (12 × "skip"); textures committed, so zero non-localhost requests at runtime.

---

## S15 — Focus Earth on the visitor's timezone

**Read first:** doc 00 (F14), doc 05 ("Earth focus direction" + Focus transition), doc 06 (selection state machine + the "Your local time" panel row), doc 02 (step D / test 11b for the sub-solar longitude relation).

**Goal:** Clicking Earth ends the focus transition with the camera in front of the visitor's own timezone meridian — their region faces them. At the current real time this naturally frames their part of the globe, lit by day or (with S14) sparkling with city lights by night.

**Context:** We already surface the visitor's timezone as the live local-time row in the InfoPanel (doc 06), so the longitude is free: `Lv = −getTimezoneOffset()/60 × 15`. Only the focus *direction* changes, and only for Earth — `dist`, the 1.2 s ease, the half-screen view offset and the moving-target tracking are exactly as today (doc 05). Frontend-only story — no backend, API or data change.

**Tasks**
1. `domain/visitorLongitude.ts`: `visitorLongitudeDeg()` (pure, `Date`-based, degrees east) + unit test (mock `getTimezoneOffset`: −120 → +30, +300 → −75, 0 → 0).
2. `three/CameraDirector.ts`: `focusBody` accepts optional `focusDirection?: THREE.Vector3 | null`; when present, replaces `normalize(currentCamPos − targetPos)`. The `y ≥ 0.25·dist` clamp is **skipped** for explicit directions (applying it pushes the camera toward the pole when the direction is near-horizontal — see doc 05).
3. `three/SceneManager.ts`: in `focusBody`, when `bodyId === "earth"`, compute the visitor-meridian direction (`Lss` from `model.stateAt`, `dSun = normalize(−P)`, `dV = rotateY(Lv − Lss)·dSun`) and pass it to `CameraDirector.focusBody`. Pre-allocated class vectors; public `focusBody(bodyId, layout)` signature unchanged.
4. Sign of `Δ` verified correct (Europe/Paris UTC+2 → Atlantic/Europe/Africa facing camera).

**Manual acceptance**
- [x] Click Earth: camera settles with the visitor's own region facing it (UTC+2 → Europe–Africa front-and-centre), not a random hemisphere — verified visually.
- [x] Equatorial framing: camera faces the equator, not the north pole (y-clamp removed for explicit directions).
- [x] Time-correct: if it is night for the visitor, their region arrives dark with S14 city lights; if day, sunlit.
- [x] Focus mechanics unchanged: ~1.2 s ease, Earth in the left (desktop) half, smooth orbit tracking, Back/Escape reset.
- [x] `visitorLongitudeDeg()` unit test green (3 cases, 40 frontend tests total).
- [x] No regression for other bodies — focusing the Sun, a planet or a moon still flies in from the current camera direction.
