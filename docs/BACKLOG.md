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
- [ ] `pnpm install` then `pnpm dev` starts backend (3001) and frontend (5173) concurrently.
- [ ] `curl http://localhost:3001/api/health` → `{"status":"ok"}`.
- [ ] `curl http://localhost:5173/api/health` → same (proxy works).
- [ ] Browser at 5173 shows a black page with "solar-3d".
- [ ] `pnpm lint && pnpm typecheck && pnpm test` all pass.

---

## S2 — Shared DTO types

**Read first:** doc 02 (DTO section).

**Goal:** `packages/shared/src/bodies.ts` with `BodyType`, `BodyInfo`, `BodyDto`, `BodiesResponse` exactly as specified; re-exported from `index.ts`.

**Tasks:** Write the types verbatim from doc 02. Import `BodyDto` in a backend file and a frontend file (a typed placeholder) to prove resolution works in both directions.

**Acceptance**
- [ ] `pnpm typecheck` passes with `@solar/shared` imported by both apps.
- [ ] No runtime code in the shared package (types/interfaces only).

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
- [ ] Tests 12–14 pass (29 bodies, unique ids, parent links, moon counts per planet, info for all, color format).
- [ ] Spot-check vs doc 03: Earth radius 6371, Triton inclination 157.0, Venus tilt 177.36.

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
- [ ] All 17 backend tests green.
- [ ] `curl "http://localhost:3001/api/bodies?date=2000-01-01T12:00:00Z"` → Earth `orbitalAngleDeg` ≈ 100.38.
- [ ] `curl http://localhost:3001/api/bodies | jq '.bodies | length'` → 29.

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
- [ ] Domain tests green (incl. scaling table: jupiter displayRadius ≈ 6.52, neptune orbit ≈ 356.4).
- [ ] Browser shows loading screen, then the 29 names; with backend stopped, shows error screen and Retry works.

---

## S6 — Texture assets (one-shot)

**Read first:** doc 08 (entire).

**Goal:** All 11 texture files committed; app standalone.

**Tasks:** Write `scripts/download-textures.mjs` per doc 08; run `pnpm download-textures`; verify files; write `three/textures.ts` (`preloadTextures()`); wire texture preload into the boot sequence in parallel with the fetch; add the attribution line to the README.

**Acceptance**
- [ ] `ls apps/frontend/public/textures` → exactly the 11 files of doc 08, each > 10 kB.
- [ ] Script is idempotent (second run: all "skip").
- [ ] Files are committed to git.
- [ ] DevTools Network tab: zero requests to non-localhost hosts at runtime.

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
- [ ] Full-window black canvas; ~subtle stars; textured sun glowing at center.
- [ ] OrbitControls: drag rotates, wheel zooms (15–900 limits).
- [ ] Window resize keeps aspect correct.
- [ ] No WebGL errors/warnings in console; React StrictMode double-mount does not leak (dispose works, only one canvas).

---

## S8 — Planets & orbits

**Read first:** doc 05 (coordinates, scene graph, materials, orbit lines, Saturn rings).

**Goal:** The 8 textured planets, positioned by real API angles, on visible orbit circles.

**Tasks**
1. `createBodyMesh()` (texture or flat-color material, userData.bodyId), `createOrbitLine()`, `createSaturnRings()` (UV remap snippet from doc 05).
2. Build the per-planet group hierarchy (orbitGroup → anchor → tiltGroup → mesh) with inclination and axial tilt.
3. Position each planet once from its API `orbitalAngleDeg` (no animation yet). Moons: build the groups too but `moonsGroup.visible = false`.

**Manual acceptance**
- [ ] 8 planets visible on 8 orbit circles; spacing matches doc 05 table (mercury ~35 → neptune ~356).
- [ ] Jupiter visibly ~2.6× Earth's diameter; Saturn has tilted rings with transparency.
- [ ] Earth shows recognizable continents; Jupiter shows bands/red spot.
- [ ] Day/night: each planet lit on the sun side, dark opposite.
- [ ] Compare on-screen positions with an online "solar system now" map (e.g. theskylive.com/planetarium): angular layout of planets matches reality for today's date (rough check, ±10°).

---

## S9 — Animation (orbits + spin)

**Read first:** doc 05 (time & animation loop), doc 04 (`SolarSystemModel.stateAt`, `SimulationClock`).

**Goal:** Everything moves.

**Tasks:** Wire the frame loop: tick the clock (rate `SIM_DAYS_PER_REAL_SECOND_SYSTEM = 2`), recompute every visible body's anchor position and `rotation.y` from `model.stateAt(...)`, spin the sun too.

**Manual acceptance**
- [ ] Mercury completes an orbit in ~44 s; Earth in ~3 min; Neptune barely moves.
- [ ] Planets spin on their axes; Uranus's spin axis is visibly sideways.
- [ ] Motion is smooth (~60 fps, no per-frame allocations in the loop — reuse Vector3s).

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
- [ ] Click Earth: camera flies to it in ~1.2 s and keeps following it on its orbit; clock slows to focused rate.
- [ ] Earth sits in the **left half** of the screen (view offset), not center.
- [ ] Escape or clicking empty space animates back to the system view; clock rate restored.
- [ ] Dragging the view then releasing over a planet does NOT select it.
- [ ] Hover over a planet shows pointer cursor + slight highlight (desktop).

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
- [ ] Desktop: Jupiter focused → Jupiter + 4 animated moons on the left, info card on the right (name, badge, description, composition, radius, periods humanized, distance, moon list, fun fact).
- [ ] Mobile (devtools, 390×844): planet in top half, scrollable card in bottom half; rotating the viewport flips the layout live.
- [ ] Clicking Io focuses it (panel updates); Back returns to system view.
- [ ] Clicking the sun: panel only, no moons.
- [ ] Attribution footer always visible.

---

## S12 — Polish & final QA

**Read first:** doc 06 (edge cases), doc 07 (definition of done), doc 00 (feature list).

**Tasks**
1. Sweep the doc 06 edge-case table once more; fix anything broken.
2. Performance pass: no allocations in the frame loop, pixelRatio cap, geometry segment counts per doc 05; verify ~60 fps in system view on a mid-range laptop.
3. README.md at repo root: what it is, screenshot placeholder, `pnpm install && pnpm download-textures && pnpm dev`, texture attribution.
4. Optional (only if everything above is done): CSS2D name labels on hover.

**Final acceptance — full feature checklist**
- [ ] Every feature F1–F12 of doc 00 demonstrably works.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green from a clean clone.
- [ ] Fresh-clone test: `pnpm install && pnpm dev` works offline except localhost (textures committed).
