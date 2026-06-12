# BACKLOG v2 — Ordered Implementation Stories

The v1 backlog (S1–S16, initial implementation) is archived at [BACKLOG.v1.archive.md](BACKLOG.v1.archive.md). This file is the **active** backlog.

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
- [ ] Focused Earth: no darker stripe along the terminator — brightness transitions monotonically from lit day to city-lit night (verify visually + headless chromium screenshot).
- [ ] City lights at full intensity over the entire night hemisphere; they fade out across the day-side twilight, no hard cut.
- [ ] Day side unchanged; other planets' terminators unchanged; no shader compile warnings.
- [ ] No backend change: test 11b untouched and green (the mask is display-only).
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.

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
- [ ] `curl "localhost:3001/api/bodies?lang=fr" | jq '.bodies[] | select(.id=="earth") | .name'` → `"Terre"`, and its `info.description` is French.
- [ ] `curl "localhost:3001/api/bodies"` → English (default); `?lang=pt` → 400.
- [ ] Tests 18–21 green: fr content, invalid lang 400, default en, all 4 languages cover 29 ids with non-empty fields.
- [ ] `?date=` and `?lang=` combine; angular state identical across languages.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.

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
- [ ] Browser in French (devtools language override or `LANGUAGE=fr chromium`): all UI labels **and** all panel content in French; badge shows `planète`.
- [ ] Browser in an unsupported language (e.g. `pt`): everything in English, no 400 from the API.
- [ ] `domain/i18n` tests green; no hardcoded user-visible string left in `react/` (grep).
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green (i18n stays pure — no `navigator` access in `domain/`).

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
- [ ] Clicking "Mars" in the bar focuses Mars (camera flight + panel) and the URL becomes `/mars`; menu colors match the panel badge colors; order: Sun, Mercury → Neptune.
- [ ] Opening `http://localhost:5173/saturn` directly deep-links into Saturn focused view after load; `/pluto` lands on `/` (system view).
- [ ] Browser back/forward replays the focus history (system ↔ planet ↔ moon), no page reload.
- [ ] Clicking the Moon in the scene → URL `/moon`; Back → `/earth`; second Back → `/`.
- [ ] Bar usable on mobile (scrollable, doesn't cover the back button or panel) in both orientations.
- [ ] `domain/routes` tests green; `pnpm lint && pnpm typecheck && pnpm test` green.

---

## S22 — v2.0: version in the footer + credit

**Read first:** doc 06 (HUD/footer), doc 09 (`madeBy` string), doc 08 (attribution requirement).

**Goal:** The project is stamped **v2.0**; the footer shows the version and the credit `Made by Jynfra with ❤️` (localized), Jynfra linking to `https://jynfra.com`. The texture attribution stays (license requirement).

**Tasks**
1. Set `"version": "2.0.0"` in all four `package.json` files (root, `packages/shared`, `apps/backend`, `apps/frontend`).
2. `apps/frontend/vite.config.ts`: `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` reading the frontend package.json; declare `declare const __APP_VERSION__: string;` in `src/vite-env.d.ts`. Display string = `v` + major.minor (`"2.0.0"` → `v2.0`).
3. `react/Hud.tsx` footer (doc 06): `v2.0 · Made by Jynfra with ❤️ · Textures: Solar System Scope (CC BY 4.0)` — `madeBy` via `t()` with `{author}` = the `Jynfra` link (`https://jynfra.com`, `target="_blank" rel="noopener noreferrer"`), attribution link unchanged.

**Acceptance**
- [ ] Footer shows `v2.0` and the localized credit; clicking `Jynfra` opens https://jynfra.com in a new tab; attribution link still present and working.
- [ ] Version is single-sourced: bumping the frontend package.json changes the footer with no other edit.
- [ ] Still zero non-localhost requests at runtime (the link is user-initiated navigation, not an app fetch).
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
