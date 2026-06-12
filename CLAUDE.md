# CLAUDE.md — solar-3d

Interactive 3D solar system POC: Three.js frontend (React shell), Express API computing real body positions from Keplerian elements, pnpm monorepo.

**This project is implemented from a complete written specification.** The `docs/` folder is the source of truth — not your general knowledge. When you are about to make a decision (a constant, a formula, a file name, a color, an API field), the answer already exists in a doc. Find it.

## Commands

```bash
pnpm install
pnpm dev                 # backend :3001 + frontend :5173 (proxy /api → 3001)
pnpm test                # vitest, all packages
pnpm lint                # eslint, all packages
pnpm typecheck           # tsc --noEmit, all packages
pnpm download-textures   # one-shot asset download
```

## Package map

| Path | Package | Contents |
|---|---|---|
| `packages/shared` | `@solar/shared` | API DTO **types only** (doc 02) — never add runtime code |
| `apps/backend` | `@solar/backend` | Express, `/api/bodies`, Kepler math, data tables (docs 02–03) |
| `apps/frontend` | `@solar/frontend` | Vite + React + Three.js, layers `domain / three / api / react` (doc 04) |

## Which doc answers which question

| Question | Doc |
|---|---|
| What are we building? Feature list? Non-goals? | `docs/00-overview.md` |
| Monorepo layout, scripts, ports, versions, data flow | `docs/01-architecture.md` |
| API contract, DTO fields, Kepler algorithm, backend tests | `docs/02-backend-spec.md` |
| **Any number** (orbital elements, radii, periods, colors) or info text | `docs/03-astronomical-data.md` |
| Frontend folders, layer rules, SceneManager API, React↔Three bridge | `docs/04-frontend-architecture.md` |
| Scaling formulas, lighting, materials, rings, starfield, camera, animation | `docs/05-threejs-scene-spec.md` |
| Clicks, focus/zoom, info panel content, nav bar, URL routing, CSS, responsive, edge cases | `docs/06-interactions-ui-spec.md` |
| TS/ESLint/Prettier/test/git conventions, definition of done | `docs/07-coding-standards.md` |
| Texture URLs, download script, attribution, loading | `docs/08-assets-textures.md` |
| Locales, language detection, UI strings (5 languages), localized body names, `?lang=` | `docs/09-i18n.md` |

The **active backlog** is `docs/BACKLOG.md` (v2 stories, s17 onward) — implement its stories strictly in order. The initial v1 backlog is **archived** at `docs/BACKLOG.v1.archive.md`: no longer maintained, do **not** read it by default. Consult the archive only on explicit request, or as a last resort when diagnosing a hard bug to see how a feature was originally built.

## Hard rules

1. **Never run `git commit`** — the user commits himself. When a unit of work is done (definition of done, doc 07), just provide the one-line commit message: `feat: s<n> <summary>` — all lowercase, no dashes.
2. **Never invent values.** Every astronomical number comes from doc 03, every formula from docs 02/05, every UI text from docs 03/06/09 (translations follow the doc 09 policy). If a value seems missing, re-read the doc; if it is genuinely missing, stop and ask — do not guess.
3. **Frontend layering is law** (doc 04): `domain/` imports neither `three` nor `react`; `three/` never imports React; only `react/` may import React. ESLint enforces it — never weaken those rules.
4. **No Three.js object in React state/props/context, ever.** React ↔ Three communication only via the `SceneManager` public API (doc 04).
5. **Textures**: only from the URLs in doc 08, downloaded by the script, **committed** to the repo. The running app makes zero non-localhost requests.
6. TypeScript `strict` everywhere; no `any`, no `@ts-ignore` (doc 07).
7. Do not add dependencies beyond those listed in docs 01/07 (express, cors, react, react-dom, three, concurrently, tsx, vitest, supertest, eslint/prettier toolchain). No state managers, no CSS frameworks, no animation libs, no test DOM libs.
8. Do not implement non-goals (doc 00): no shadow maps, no date picker UI, no extra bodies, no language picker UI.

## Definition of done

`pnpm lint` + `pnpm typecheck` + `pnpm test` all green, behavior verified (manual checks in a real browser), no leftover TODOs or `console.log`.
