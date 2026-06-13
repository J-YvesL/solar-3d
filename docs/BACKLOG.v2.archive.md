# BACKLOG — v2 Archive (S17–S29, completed)

All stories in this file are **done**. This archive covers v2.0 (S17–S22), v2-extra (S23–S27, ISS), and v2.2 (S28–S29, Pluto + clouds). The active backlog is [BACKLOG.md](BACKLOG.md).

Rules of engagement:

- Implement stories **strictly in order**. Do not start a story before the previous one meets its acceptance criteria **and** the definition of done (doc 07).
- One git commit per story: `feat: s<n> <summary>` (all lowercase, no dashes — CLAUDE.md).
- Each story lists the docs to (re)read first. When a detail is missing, the answer is in a doc — search the docs before improvising.
- Every story leaves the repo in a runnable state (`pnpm dev` works).

---

## S17 — Moon display size halved

**Read first:** doc 05 (scaling formulas + expected values), doc 04 (api mapper).

**Goal:** The Moon renders at **half** its previous size: the generic power-law made it visually too big next to Earth (display ratio 0.60 vs real 0.27). A per-body display-size factor fixes it without touching any other body.

**Tasks**
1. `domain/scaling.ts`: add `DISPLAY_SIZE_FACTOR: Record<string, number> = { moon: 0.5 }` and an optional `id` parameter — `displayRadius(radiusKm, type, id?)` multiplies the existing result (clamp included) by `DISPLAY_SIZE_FACTOR[id] ?? 1` (doc 05).
2. `api/client.ts`: pass `dto.id` to `displayRadius` in the mapper.
3. `domain/scaling.test.ts`: moon → **0.74 ± 0.05**; all other expected values of doc 05 unchanged (earth 2.50, phobos/deimos still clamped at 0.45); without `id`, the factor does not apply.

**Acceptance**
- [x] Scaling tests green, moon ≈ 0.74 (= 1.49 × 0.5).
- [x] Focused Earth view: the Moon's diameter is visually ~half of before, clearly smaller than Earth (~0.30 of Earth's display radius).
- [x] Moon orbit radius unchanged (`moonOrbitDisplayRadius` untouched — ~5.5 units); other moons (Io, Titan…) unchanged.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S18 — Earth terminator dark-band bugfix

**Read first:** doc 05 ("Earth night lights"), doc 02 (step D + test 11b — the terminator anchoring must not move).

**Goal:** Remove the dark band along Earth's day/night terminator. Other planets are unaffected (they have no night-side emissive layer).

**Context:** The S14 mask `1.0 − smoothstep(−0.10, 0.10, cosSun)` centers the twilight fade **on** the terminator: right where the Lambert sunlight term reaches zero, the city lights are still at ~50 % — a band where *neither* the day lighting *nor* the night emissive contributes, visible as a darker stripe. The fix moves the entire fade onto the **day side**: the night layer is at 100 % everywhere the sun does not light, and fades out only where sunlight takes over.

**Tasks**
1. `three/earthNightLights.ts`: replace the mask with `float nightMask = 1.0 - smoothstep(0.0, 0.20, cosSun);` (doc 05). Nothing else changes — same uniforms, same `totalEmissiveRadiance` composition, same per-frame updater.
2. Visual tuning allowed on the upper edge only, within `[0.15, 0.30]` (lower edge stays `0.0` — that is the fix). If the final value differs from `0.20`, update doc 05 in the same commit.

**Acceptance**
- [x] Focused Earth: no darker stripe along the terminator — brightness transitions monotonically from lit day to city-lit night (verify visually + headless chromium screenshot).
- [x] City lights at full intensity over the entire night hemisphere; they fade out across the day-side twilight, no hard cut.
- [x] Day side unchanged; other planets' terminators unchanged; no shader compile warnings.
- [x] No backend change: test 11b untouched and green (the mask is display-only).
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S19 — Backend i18n: `GET /api/bodies?lang=`

**Read first:** doc 09 (entire), doc 02 (API contract + tests 18–21), doc 03 (Table 4 — canonical English texts).

**Goal:** The API serves body `name` and `info` (description, composition, funFact) in en/fr/es/it/de. DTO shape unchanged.

**Tasks**
1. `apps/backend/src/data/localized/fr.ts`, `es.ts`, `it.ts`, `de.ts`: each exports `localizedBodies: Record<string, { name: string; info: BodyInfo }>` for all 29 ids — names **verbatim from the doc 09 table**, info texts translated from doc 03 Table 4 following the doc 09 translation policy.
2. `routes/bodies.ts`: parse `lang` — omitted → `en`; `en|fr|es|it|de` accepted; anything else → `400 { "error": "Invalid lang" }` (doc 02).
3. `ephemeris/state.ts` (or a small merge step in the route): for `lang ≠ en`, override each DTO's `name` and `info` from `localizedBodies`; `en` keeps the canonical data files.
4. Tests 18–21 of doc 02 (supertest + data completeness).

**Acceptance**
- [x] `curl "localhost:3001/api/bodies?lang=fr" | jq '.bodies[] | select(.id=="earth") | .name'` → `"Terre"`, and its `info.description` is French.
- [x] `curl "localhost:3001/api/bodies"` → English (default); `?lang=pt` → 400.
- [x] Tests 18–21 green: fr content, invalid lang 400, default en, all 4 languages cover 29 ids with non-empty fields.
- [x] `?date=` and `?lang=` combine; angular state identical across languages.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S20 — Frontend i18n: localized UI

**Read first:** doc 09 (entire), doc 04 (layering + new modules), doc 06 (which labels exist).

**Goal:** Every visible string follows the browser language; unsupported languages fall back to English. With S19, the whole app — chrome and content — is localized.

**Tasks**
1. `domain/i18n/locale.ts`: `Locale`, `SUPPORTED_LOCALES`, `resolveLocale()` per doc 09 + unit tests (`"fr-FR"` → `fr`, `"es-419"` → `es`, `"pt-BR"` → `en`, `undefined` → `en`).
2. `domain/i18n/strings.ts`: the doc 09 UI-string dictionaries **verbatim** + `t(locale, key, params?)` with `{placeholder}` interpolation + tests (interpolation, every locale × every key non-empty).
3. `api/client.ts`: `fetchBodies(lang: Locale)` appends `?lang=`.
4. React layer: resolve the locale once at boot; replace every hardcoded string in `App.tsx`, `Hud.tsx`, `InfoPanel.tsx` with `t()` — loading/error/retry, back, hint, panel labels, humanized units (hours/days/years), type badges (star/planet/moon), "Your local time", "Distance from …" (sun vs parent interpolation per doc 09).
5. Texture attribution stays untranslated (license line, docs 08/09).

**Acceptance**
- [x] Browser in French (devtools language override or `LANGUAGE=fr chromium`): all UI labels **and** all panel content in French; badge shows `planète`.
- [x] Browser in an unsupported language (e.g. `pt`): everything in English, no 400 from the API.
- [x] `domain/i18n` tests green; no hardcoded user-visible string left in `react/` (grep).
- [x] `pnpm lint && pnpm typecheck && pnpm test` green (i18n stays pure — no `navigator` access in `domain/`).

---

## S21 — Top navigation bar + per-body URLs

**Read first:** doc 06 ("Top navigation bar" + "URL routing"), doc 04 (new modules + layering), doc 00 (F17).

**Goal:** A top bar navigates straight to the Sun or any planet; the URL always mirrors the focused body (`/earth`, `/mars`, `/sun`, … — all 29 bodies, moons included), with working deep links and browser back/forward. No routing library (deps are frozen — CLAUDE.md rule 7): History API only.

**Tasks**
1. `domain/routes.ts` (pure) + tests: `pathForBody(id: string | null): string` (`null` → `/`), `bodyIdFromPath(path: string, validIds: ReadonlySet<string>): string | null` (unknown/`/` → `null`).
2. `react/useRoute.ts`: after the model is ready, read the initial path — known id → focus it (deep link), unknown non-`/` path → `history.replaceState` to `/`; on each selection change, `history.pushState` (skip redundant pushes, and don't push for changes caused by `popstate`); on `popstate`, focus the body from the path or reset to system view. Wire into `useSolarSystemScene`/`App` — `SceneManager` API unchanged.
3. `react/NavMenu.tsx` + CSS per doc 06: fixed top bar, items **Sun + the 8 planets in system order** (API order), labels = localized `name` from the API, each item colored with its body's `color` (same as the InfoPanel badge), active item highlighted, click → same `focus(bodyId)` path as a canvas click; mobile: horizontally scrollable row.
4. Edge cases per doc 06: focusing a moon updates the URL (`/moon`, `/titan`) and highlights no menu item (or its parent planet — see doc 06); Back/Escape still walks moon → planet → system with the URL following.

**Acceptance**
- [x] Clicking "Mars" in the bar focuses Mars (camera flight + panel) and the URL becomes `/mars`; menu colors match the panel badge colors; order: Sun, Mercury → Neptune.
- [x] Opening `http://localhost:5173/saturn` directly deep-links into Saturn focused view after load; `/pluto` lands on `/` (system view).
- [x] Browser back/forward replays the focus history (system ↔ planet ↔ moon), no page reload.
- [x] Clicking the Moon in the scene → URL `/moon`; Back → `/earth`; second Back → `/`.
- [x] Bar usable on mobile (scrollable, doesn't cover the back button or panel) in both orientations.
- [x] `domain/routes` tests green; `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S22 — v2.0: version in the footer + credit

**Read first:** doc 06 (HUD/footer), doc 09 (`madeBy` string), doc 08 (attribution requirement).

**Goal:** The project is stamped **v2.0**; the footer shows the version and the credit `Made by Jynfra with ❤️` (localized), Jynfra linking to `https://jynfra.com`. The texture attribution stays (license requirement).

**Tasks**
1. Set `"version": "2.0.0"` in all four `package.json` files (root, `packages/shared`, `apps/backend`, `apps/frontend`).
2. `apps/frontend/vite.config.ts`: `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` reading the frontend package.json; declare `declare const __APP_VERSION__: string;` in `src/vite-env.d.ts`. Display string = `v` + major.minor (`"2.0.0"` → `v2.0`).
3. `react/Hud.tsx` footer (doc 06): `v2.0 · Made by Jynfra with ❤️ · Textures: Solar System Scope (CC BY 4.0)` — `madeBy` via `t()` with `{author}` = the `Jynfra` link (`https://jynfra.com`, `target="_blank" rel="noopener noreferrer"`), attribution link unchanged.

**Acceptance**
- [x] Footer shows `v2.0` and the localized credit; clicking `Jynfra` opens https://jynfra.com in a new tab; attribution link still present and working.
- [x] Version is single-sourced: bumping the frontend package.json changes the footer with no other edit.
- [x] Still zero non-localhost requests at runtime (the link is user-initiated navigation, not an app fetch).
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S23 — ISS: 30th body, real orbit from TLE (sphere rendering)

**Read first:** doc 02 ("Step E" + tests 22–25), doc 03 (Table 7 — ISS static data + info texts), doc 05 ("Satellites" sections), doc 06 (NavMenu filter + edge cases), doc 09 (names table + `typeSatellite`).

**Goal:** The ISS orbits Earth at its **real position**, computed from a live TLE (CelesTrak, cached 24 h, committed fallback). It is a first-class body: clickable, info panel, `/iss` URL, localized. Rendered as a plain sphere (the 3D model is S24). Position is anchored at page load — no polling; a page refresh re-syncs.

**Context:** Unlike planets (250-year Keplerian tables) the ISS orbit changes daily (atmospheric drag + reboosts), so its elements must be fetched at runtime. A TLE is a 2-line fixed-width text format containing everything the existing circular-orbit pipeline needs (inclination, node, mean anomaly, mean motion) — parsed by hand, **no new dependency**. The backend converts TLE → moon-style circular elements; the frontend animates the ISS exactly like a moon of Earth. Tidally-locked rotation = the real LVLH attitude for free.

**Tasks**
1. `packages/shared`: add `"satellite"` to `BodyType`; add `nodeLonDeg: number | null` to `BodyDto` (TLE node for satellites, `null` for every other body) (doc 02).
2. Backend data: `data/issTle.ts` (committed TLE snapshot + its retrieval date), ISS static record in `data/bodies.ts` and `data/bodyInfo.ts` (doc 03 Table 7), ISS entry in the four `data/localized/*.ts` (doc 09 policy, name `ISS` in all languages).
3. `ephemeris/tle.ts`: `parseTle(line1, line2)` (fixed-column parsing, doc 02 step E), `deriveCircularElements(tle)` (period, semi-major axis via Kepler's third law, argument of latitude), `getIssTle()` (lazy in-memory cache, TTL 24 h, native `fetch` to the CelesTrak URL of doc 02, committed snapshot as fallback on any failure — fetch failure is never a 500).
4. `ephemeris/state.ts`: append the ISS `BodyDto` to `computeBodyStates(date)` — angles propagated from the TLE epoch to the requested date with the existing circular formula; `rotationAngleDeg = orbitalAngleDeg` (LVLH); `?lang=` applies (entry exists in `localizedBodies`).
5. Frontend: `typeSatellite` UI key ×5 locales (doc 09); `domain/scaling.ts` `satelliteOrbitDisplayRadius()` (doc 05) + mapper uses it for `type === "satellite"` and **excludes satellites from the moon index ranking** (the Moon stays index 0); `NavMenu` filter becomes `star | planet`.
6. `three/buildScene.ts`: wrap satellite orbits in a node group (`rotation.y = degToRad(nodeLonDeg)`) around the inclined orbit group (doc 05, "Satellite orbit node"). Sphere rendering — no other scene change. InfoPanel: distance row uses the parent label path (already generic).
7. Tests: doc 02 tests 22–25 (TLE parsing, derived elements, route, offline fallback); amend tests 12/13/21 (30 bodies, 1 satellite, ISS parent earth, 30 localized ids); frontend scaling + i18n completeness tests.

**Acceptance**
- [x] Focused Earth view: the ISS orbits between the surface and the Moon (display orbit 3.5 units), completing one revolution in ~92 real minutes; its orbital plane is tilted ~51.6°.
- [x] Clicking the ISS (or opening `/iss`) focuses it: badge `satellite` (localized), real period (~1.5 h), distance from Earth; Back → Earth → system.
- [x] `curl localhost:3001/api/bodies | jq '.bodies[] | select(.id=="iss")'` → plausible live values (`orbitalAngleDeg` ∈ [0,360), `inclinationDeg` ≈ 51.6, `semiMajorAxisKm` ≈ 6 800); two calls a few minutes apart show the angle advancing at ~3.9°/min.
- [x] Backend started **without network**: ISS served from the committed TLE snapshot, no error, no 500.
- [x] CelesTrak is hit at most once per 24 h per backend process (verify via log/mock), and never by the frontend.
- [x] NavMenu unchanged (Sun + 8 planets); the Moon's display orbit is **unchanged** (~5.5 units).
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S24 — ISS: low-poly 3D model

**Read first:** doc 08 ("ISS model"), doc 05 ("Satellite mesh — S24"), doc 06 (picking).

**Goal:** The S23 sphere is replaced by a real low-poly 3D model of the ISS, committed to the repo, loaded with the bundled `GLTFLoader` (no new dependency), with graceful fallback to the sphere.

**Tasks**
1. Asset: pick a free-license low-poly ISS model (NASA 3D Resources / CC0 / CC BY — budget **≤ 15 000 triangles, ≤ 2 MB** as GLB), download it manually, commit it as `apps/frontend/public/models/iss.glb`, and record the exact source URL + license in doc 08 **in the same commit** (license text in the README if the license requires attribution).
2. `three/textures.ts` (or a small `three/models.ts`): preload the GLB alongside the textures via `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader` — same `Promise.all` boot path, same graceful-fallback policy: missing/failed GLB → `console.warn`, S23 sphere unchanged, no crash (doc 08).
3. `three/buildScene.ts`: for the ISS, insert `gltf.scene` instead of the sphere — normalized so its bounding box fits the sphere's footprint (~0.9 units across, doc 05); set `userData.bodyId = "iss"` on **every descendant mesh** (the Picker raycasts children).
4. Orientation: the tidally-locked spin from S23 already provides the LVLH attitude; apply at most one fixed corrective rotation on the model root so the solar arrays/truss read correctly, verified visually once (same "flip once" rule as doc 05 view offsets).
5. Perf check: no visible fps drop in focused Earth view on mobile (and on the Pi headless-chromium setup).

**Acceptance**
- [x] Focused Earth view: the recognizable ISS (truss + solar arrays) orbits Earth; hover highlight and click-to-focus work on every part of the model.
- [x] Delete/rename the GLB → app still boots, ISS renders as the S23 sphere, one console.warn, nothing else changes.
- [x] GLB committed, ≤ 15 k triangles / ≤ 2 MB; source + license documented in doc 08 (+ README if attribution required); still zero non-localhost requests from the frontend.
- [x] No fps regression in focused Earth view.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S25 — Deep-link camera focus lost on scene remount (bugfix)

**Read first:** doc 04 ("The React ↔ Three bridge" — scene recreation note), doc 06 ("URL routing" — deep link).

**Goal:** Opening a body URL directly (e.g. `/mars`) focuses the body — panel **and** camera — even when the `SceneManager` is recreated after the deep link fired.

**Context:** In dev, React StrictMode mounts/unmounts/remounts `CanvasHost` within the same commit, *after* the parent's deep-link effect ran: the first `SceneManager` received `focusBody`, was destroyed, and its replacement started un-focused while `selectedBodyId` still held the body — panel visible, camera stuck in system view. The same loss occurs whenever the scene is remounted (`model`/`textures` change) while a body is selected.

**Tasks**
1. `react/useSolarSystemScene.ts`: mirror the selection in a ref updated **synchronously** in `focus`/`reset` (the StrictMode remount fires before the next render); expose `onSceneReady()` that re-applies the current selection to the fresh scene.
2. `react/CanvasHost.tsx`: call `onSceneReady()` right after constructing the `SceneManager`.
3. `react/useRoute.ts`: unchanged (the deep-link effect fires once; scene-side re-application is the fix).
4. Document the pattern in docs 04 and 06.

**Acceptance**
- [x] `pnpm dev` (StrictMode): opening `/mars` directly lands on Mars focused — camera flight, panel, MARS active in the nav bar; `/titan` focuses Titan with SATURNE highlighted; `/` stays in system view.
- [x] Verified headless (chromium screenshots) for `/mars`, `/titan`, `/`.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S26 — Spherical hitboxes for easier body picking

**Read first:** doc 05 ("Hitboxes — S26"), doc 06 ("Picking"), doc 04 (layer rules — the radius formula is domain, the meshes are three).

**Goal:** Every body gets an **invisible spherical hitbox** that the raycaster also tests, so a near-miss still selects the body. Motivated by the ISS (~0.9 units of mostly thin trusses — nearly unclickable) and by mobile, where tapping small planets is too hard; the mechanism is generic and covers all bodies.

**Tasks**
1. `domain/scaling.ts`: `HITBOX_FACTOR = 1.5`, `HITBOX_MIN_RADIUS = 1.2`, and `hitboxRadius(displayRadius) = max(displayRadius × HITBOX_FACTOR, HITBOX_MIN_RADIUS)`. Tests in `scaling.test.ts`: Earth 3.75, Sun 18, ISS 1.2 (floor), Moon 1.2 (floor).
2. `three/buildScene.ts`: `createHitbox(bodyId, displayRadius)` — `SphereGeometry(hitboxRadius(displayRadius), 12, 12)`, `MeshBasicMaterial({ visible: false })` (invisible but still raycastable), `userData.bodyId` + `userData.isHitbox = true`. The caller sets `userData.pickTarget` to the body's visual `Object3D`.
3. `three/SceneManager.ts`: `SceneBodyEntry` gains `hitbox`; add a hitbox on each planet `anchor` and each moon/satellite `moonAnchor` (anchors, not tilt groups — GLB scaling/spin must never affect the hitbox); Sun hitbox at the scene root. `updatePickables()` pushes `entry.hitbox` next to the body's meshes, same visibility subset as today.
4. `three/Picker.ts`: hit resolution prefers **the first hit on real geometry; only if no real mesh was hit does the nearest hitbox win** (hitboxes never occlude real bodies). Hover resolves a hitbox to its `pickTarget` and applies/clears the emissive highlight by traversing the target's `MeshStandardMaterial` meshes (the whole ISS model now highlights, not just one child mesh); pointer cursor over hitboxes too; focused-body exclusion unchanged.
5. Document in docs 05 and 06.

**Acceptance**
- [x] Focused Earth view: clicking slightly **off** the ISS model focuses the ISS; clicking on Earth's face through the ISS hitbox still focuses Earth.
- [x] System view: clicking slightly off a small planet focuses it; clicking far empty space while focused still clears the selection.
- [x] Hover near the ISS highlights the whole model and shows the pointer cursor; the focused body still gets no highlight.
- [x] Hitboxes are invisible; no fps regression.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S27 — ISS geolocation fix (equatorial→ecliptic frame, J2 precession, TLE fallback source)

**Read first:** doc 02 step E (rewritten), doc 03 Table 7 + ISS constants, doc 05 "Satellites in the scene graph".

**Goal:** The ISS rendered over the wrong place (e.g. India instead of Malaysia) — a longitude offset, "as if a Y-axis rotation were missing". Two stacked causes, both fixed here:
1. **Frame error (≤ 23.44°).** TLE inclination/RAAN are equatorial (vs Earth's equator + vernal point); the scene renders in the ecliptic plane. Feeding raw equatorial elements tilts the orbit plane by the obliquity, shifting the sub-satellite point up to ~23° (mostly longitude). The old "documented approximation" accepted this — no longer acceptable.
2. **Stale orbit plane.** CelesTrak 403s the host IP, so `getIssTle()` silently fell back to a 2024 snapshot; the plane regresses ~5°/day, so a months-old node is far off.

**Tasks**
1. `ephemeris/frames.ts` (new): `equatorialToEcliptic(i, Ω, u, ε)` → `{ inclinationDeg, nodeLonDeg, argLatDeg }` via `R = Rx(−ε)·Rz(Ω)·Rx(i)` z–x–z decomposition (doc 02 step E).
2. `ephemeris/tle.ts`: `raanRateDegPerDay(tle, a)` = J2 nodal regression (`J2 = 1.08263e-3`, `Re = 6378.137`); fetch chain CelesTrak → `wheretheiss.at/v1/satellites/25544/tles` (JSON) → cache → snapshot; disk cache at `apps/backend/.cache/iss-tle.json` (gitignored, disabled under vitest).
3. `ephemeris/state.ts`: propagate `uEq` and the precessing `ΩEq` from the TLE epoch, then `equatorialToEcliptic` → ISS DTO `inclinationDeg`/`nodeLonDeg`/`orbitalAngleDeg`.
4. `data/issTle.ts`: refresh the committed snapshot.
5. Tests: `frames.test.ts` (analytic conversion cases), J2 rate, fetch-chain fallback, updated state expectations.

**Acceptance**
- [x] ISS sub-satellite point matches a live tracker within ~2° (numeric check against `api.wheretheiss.at`, and visual headless render).
- [x] CelesTrak 403 → wheretheiss.at TLE used; both down → committed snapshot; API never 500s.
- [x] Disk cache written on success and honored across a backend restart (no re-fetch within 24 h).
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S28 — Pluto: dwarf planet (30→32 bodies) + Charon, v2.2

**Read first:** doc 03 (new Table 2b + Charon in Table 3 + texts/poles), doc 02 (`BodyType` + tests 12/13/21), doc 05 (scaling + expected values), doc 06 (NavMenu + URL routing), doc 08 (Pluto/Charon textures), doc 09 (names + `typeDwarfPlanet`), doc 00 (non-goal lifted).

**Goal:** Add **Pluto** as a new body type **dwarf planet** (`dwarfPlanet`) orbiting the Sun beyond Neptune, with its largest moon **Charon**. Pluto is a first-class body: clickable, info panel with a localized "dwarf planet" badge, `/pluto` URL, a nav-bar entry after Neptune, dedicated textures. Charon is a normal moon of Pluto. The release is stamped **v2.2**. This lifts the "no dwarf planets" non-goal for exactly this one system (the ISS precedent).

**Context:** Pluto's orbit is too eccentric (e ≈ 0.244) for the Kepler solver (valid `e < 0.21`, doc 02), so its heliocentric angle uses the **circular Formula C** (mean longitude), like moons — the scene draws a circular, sun-anchored orbit anyway, placing Pluto just outside Neptune. Charon orbits Pluto via the existing moon path. Pluto behaves like a planet at almost every frontend site; a single domain predicate `isPlanetLike(type)` threads the new type cleanly.

**Tasks**
1. `packages/shared`: add `"dwarfPlanet"` to `BodyType` (doc 02).
2. Backend data: Pluto + Charon static records in `data/bodies.ts` (doc 03 Table 2b + Table 3), `data/bodyInfo.ts` (doc 03 Table 4), the four `data/localized/*.ts` (doc 09 names + translated info). `ephemeris/state.ts`: Pluto uses Formula C (`else if (type === "moon" || type === "dwarfPlanet")`); update the body-count comments.
3. Frontend domain: `isPlanetLike(type) = planet || dwarfPlanet` (in `domain/types.ts`); `typeDwarfPlanet` UI key ×5 locales in `domain/i18n/strings.ts` (doc 09).
4. Frontend wiring via `isPlanetLike`: `api/client.ts` (orbit radius), `react/NavMenu.tsx` (Pluto after Neptune), `react/InfoPanel.tsx` (Moons row + new badge case), `three/SceneManager.ts` (planets filter, pickables, ownerPlanetId), `three/CameraDirector.ts` (planet-style framing). Charon needs no new branch (plain moon).
5. Textures: add `"pluto"`/`"charon"` to `TEXTURED_BODY_IDS`; download-script manifest entries from a public-domain NASA New Horizons source committed under `public/textures/`; record source + license in doc 08.
6. Version: `"version": "2.2.0"` in all four `package.json`; footer auto-shows `v2.2`.
7. Tests: backend 12 (32 bodies: 1 star/8 planet/1 dwarfPlanet/21 moon/1 satellite), 13 (Pluto→sun, Charon→pluto), 14c (Pluto real pole, Charon 0), 21 (32 localized ids); `state.test.ts` (Pluto angle); frontend `scaling.test.ts` (Pluto/Charon radii), `strings.test.ts` (`typeDwarfPlanet`), `routes.test.ts` (`/pluto` now valid).

**Acceptance**
- [x] `curl "localhost:3001/api/bodies" | jq '.bodies[] | select(.id=="pluto")'` → `type: "dwarfPlanet"`, `parentId: "sun"`, plausible `orbitalAngleDeg`; `?lang=fr` → name `Pluton`. Charon present with `parentId: "pluto"`.
- [x] System view: Pluto appears in the nav bar after Neptune (tan), its orbit just outside Neptune's; clicking it focuses it with the localized `dwarf planet` badge and Charon in the Moons row.
- [x] Focused Pluto: Charon orbits close beside it; Back → Charon → Pluto → system; `/pluto` and `/charon` deep-link correctly.
- [x] Pluto and Charon render textured (delete a texture → flat-color fallback, one warn).
- [x] Footer shows `v2.2`.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S29 — Earth cloud layer (geostationary)

**Read first:** doc 08 (texture manifest + frontend loading), doc 05 ("Earth cloud layer", scene graph, "Earth night lights" for the sibling pattern), doc 06 (S26 hitbox/picking).

**Goal:** Add a translucent **cloud layer** above Earth — and only Earth — for realism: a second, slightly larger sphere textured with `earth-clouds.jpg`, lit so it follows the day/night terminator. **No new body, no API change, no version bump** (stays v2.2).

**Context:** `2k_earth_clouds.jpg` is a JPG (no alpha): white clouds on black. It is used as an **`alphaMap`** (luminance → alpha: black = clear sky, white = opaque cloud), not as a `map` with low opacity (which would grey out the whole globe). Because the clouds texture is shaped like the continents, the layer must be **geostationary** — same spin + tilt as the surface — or it would drift off the landmasses. This is achieved by parenting the cloud sphere to Earth's spinning `bodyMesh` (under the `tiltGroup`), so it inherits both for free; the animation loop is untouched.

**Tasks**
1. `scripts/download-textures.mjs`: add `{ file: "earth-clouds.jpg", url: ".../2k_earth_clouds.jpg" }` to the manifest; run `pnpm download-textures` (idempotent) and commit the file.
2. `three/textures.ts`: add `CLOUD_TEXTURE = "earth-clouds"`; extend the `load` helper with an optional `colorSpace` (default sRGB) and load the clouds with `THREE.NoColorSpace` (alphaMap is data).
3. `three/buildScene.ts`: `createEarthClouds(earthDisplayRadius, texture)` → lit `MeshStandardMaterial` sphere (×`CLOUD_RADIUS_FACTOR` 1.01) with `alphaMap`, `transparent`, `opacity` `CLOUD_OPACITY` 0.8, `depthWrite:false`; `clouds.raycast = () => {}` to keep picking clean.
4. `three/SceneManager.ts`: in the existing `if (planet.id === "earth")` block, `mesh.add(createEarthClouds(...))` when `earth-clouds` is present (graceful fallback otherwise).
5. Docs: doc 05 ("Earth cloud layer" subsection + scene-graph diagram), doc 08 (manifest row, budget 13+2=15, NoColorSpace note).

**Acceptance**
- [ ] Focused Earth: white clouds visible above the surface, continents seen through the gaps (clear sky = transparent), not a uniform grey veil.
- [ ] Clouds stay locked to the continents as sim time advances (geostationary — no drift between cloud layer and surface).
- [ ] Night side: clouds darken with the terminator, consistent with the S14 city lights.
- [ ] Clicking Earth still selects/zooms it (the no-op raycast did not break picking).
- [ ] Delete `earth-clouds.jpg` → one `console.warn`, Earth renders without clouds, no crash.
- [ ] No stray bloom halo on the clouds (else lower `CLOUD_OPACITY`).
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
