# 07 — Coding Standards

## TypeScript

`tsconfig.base.json` at the repo root; every package's `tsconfig.json` extends it.

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

(Backend overrides `module: "CommonJS", moduleResolution: "Node"` if tsx requires it — keep whatever makes `pnpm dev` work, but `strict` is non-negotiable.)

- **No `any`**, no `as unknown as`, no `@ts-ignore`/`@ts-expect-error`. If you need one, the design is wrong — re-read the relevant doc.
- No `null` assertions (`!`) except the documented `ref.current!` in `CanvasHost` right after mount.
- All public functions/classes of `domain/` and `ephemeris/` get JSDoc with units in the description (`/** Orbital angle in degrees, [0, 360). */`).

## Naming

- Files: `camelCase.ts` for modules, `PascalCase.ts(x)` for a file exporting a single class/component.
- Body ids: lowercase ASCII (`"earth"`, `"io"`) — exactly the ids of doc 03; never display them raw (use `name`).
- Constants: `SCREAMING_SNAKE_CASE`, defined next to their domain (`SIM_DAYS_PER_REAL_SECOND_SYSTEM` lives in `domain/simulationClock.ts`).
- No abbreviations in identifiers except `deg`, `rad`, `km`, `au`, `pos`.

## Layer-boundary enforcement (frontend ESLint)

Flat config `eslint.config.js`, with `no-restricted-imports` overrides per directory:

| Files | Forbidden imports |
|---|---|
| `src/domain/**` | `three`, `react`, `react-dom`, `../three/*`, `../react/*`, `../api/*` |
| `src/three/**` | `react`, `react-dom`, `../react/*` |
| `src/api/**` | `three`, `react`, `react-dom`, `../three/*`, `../react/*` |

Base config for both apps: `eslint:recommended` + `typescript-eslint` recommended + `eslint-config-prettier`. Frontend adds `eslint-plugin-react-hooks` (rules-of-hooks: error).

## Prettier

Root `.prettierrc`: `{ "printWidth": 100, "singleQuote": false, "trailingComma": "all" }`. No per-package overrides.

## Tests (Vitest)

- Test files: `*.test.ts` colocated next to the source file.
- What must be tested: everything in `apps/backend/src/ephemeris` and `src/data` and `src/routes` (doc 02 lists the cases), everything in `apps/frontend/src/domain` (scaling, model, clock).
- What must NOT be tested: anything in `frontend/src/three` or `src/react` (WebGL/DOM out of scope — manual checks in the BACKLOG cover them). Do not install jsdom, testing-library, or playwright.
- Numeric assertions use explicit tolerances: `expect(x).toBeCloseTo(100.380, 2)`.

## Logging (backend)

Use `createLogger(component)` from `apps/backend/src/logger.ts` (Winston 3). One logger per module, created at module scope.

```ts
const logger = createLogger("my-component");
logger.info("something happened");
logger.warn("degraded path taken");
logger.debug("verbose detail");   // hidden at default level
```

Output format: `YYYY-MM-DD HH:mm:ss [component] level: message`.

Default level is `info`; set `LOG_LEVEL=debug` in the environment to see `debug` lines. Keep `debug` for per-request cache hits or other high-frequency events. Keep `warn` for degraded-but-safe paths (fallbacks, retries). Use `error` only when the request will fail.

## Git

- Commit after each backlog story, message: `S<n>: <imperative summary>` (e.g. `S4: kepler ephemeris + /api/bodies endpoint`).
- Never commit `node_modules`, `dist`. **Do commit** `apps/frontend/public/textures/` (doc 08).

## Definition of done (every story)

1. `pnpm lint` — zero errors/warnings.
2. `pnpm typecheck` — clean.
3. `pnpm test` — all green, including previous stories' tests.
4. The story's own acceptance criteria (BACKLOG) verified — manual ones included.
5. No TODO/FIXME left in code; no dead code; no `console.log` or `console.warn` in backend code — use the Winston logger (see Logging section below). A single `console.warn` for missing textures in the frontend is still allowed (doc 06).
