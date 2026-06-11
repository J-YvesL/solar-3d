# 08 — Texture Assets

## Policy

The app is **fully standalone**: every texture is downloaded once at development time, committed to git, and served from `apps/frontend/public/textures/`. At runtime the app must make **zero** requests to third-party hosts. Never load a texture from a CDN URL.

## Source & license

[Solar System Scope textures](https://www.solarsystemscope.com/textures/) — **CC BY 4.0**, 2k resolution. Attribution is mandatory: the HUD footer (doc 06) and the README must contain `Textures: Solar System Scope (CC BY 4.0) — https://www.solarsystemscope.com/textures/`.

## File manifest

All URLs verified responding (HTTP 200) on 2026-06-11. Local file name = body `id` (doc 03); the two non-body files are `saturn-ring.png` and `earth-night.jpg`.

| Local file (`public/textures/`) | Download URL |
|---|---|
| `sun.jpg` | `https://www.solarsystemscope.com/textures/download/2k_sun.jpg` |
| `mercury.jpg` | `https://www.solarsystemscope.com/textures/download/2k_mercury.jpg` |
| `venus.jpg` | `https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg` |
| `earth.jpg` | `https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg` |
| `earth-night.jpg` | `https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg` |
| `mars.jpg` | `https://www.solarsystemscope.com/textures/download/2k_mars.jpg` |
| `jupiter.jpg` | `https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg` |
| `saturn.jpg` | `https://www.solarsystemscope.com/textures/download/2k_saturn.jpg` |
| `saturn-ring.png` | `https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png` |
| `uranus.jpg` | `https://www.solarsystemscope.com/textures/download/2k_uranus.jpg` |
| `neptune.jpg` | `https://www.solarsystemscope.com/textures/download/2k_neptune.jpg` |
| `moon.jpg` | `https://www.solarsystemscope.com/textures/download/2k_moon.jpg` |

**The 19 other moons have no texture file** — they render with their flat `color` from doc 03 Table 3 (doc 05 materials section). Do not hunt for moon textures elsewhere; this is a deliberate scope decision.

`earth-night.jpg` (added in story S14) is **not** a body color map: it is the emissive night-lights map applied to Earth's material only (doc 05, "Earth night lights"). Run `pnpm download-textures` again in S14 to fetch it (the script is idempotent — the 11 original files are skipped) and commit it like the others.

Budget: 12 files, ≈ 6–10 MB total. If a downloaded file is 0 bytes or not an image, the script must fail loudly.

## Download script — `scripts/download-textures.mjs`

Plain Node 24 (built-in `fetch`), no dependencies:

- Hardcode the manifest above as `[{ file, url }]`.
- `mkdir -p apps/frontend/public/textures` (`fs.mkdirSync(..., { recursive: true })`).
- For each entry: skip if the file already exists with size > 10 kB (idempotent); otherwise fetch, check `res.ok` and `content-type` starts with `image/`, write with `fs.writeFileSync(path, Buffer.from(await res.arrayBuffer()))`.
- Print a per-file ✓/✗ summary; `process.exit(1)` if any file failed.
- Run via root script: `pnpm download-textures` (doc 01). Run it **once** during story S6, then commit the files.

## Frontend loading — `three/textures.ts`

```ts
const TEXTURED_BODY_IDS = ["sun","mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","moon"];
const RING_TEXTURE = "saturn-ring";
const NIGHT_TEXTURE = "earth-night";   // S14 — Earth emissive night map

export async function preloadTextures(): Promise<Map<string, THREE.Texture>> {
  const loader = new THREE.TextureLoader();
  const load = (name: string, ext: string) =>
    loader.loadAsync(`/textures/${name}.${ext}`)
      .then((t) => { t.colorSpace = THREE.SRGBColorSpace; return [name, t] as const; })
      .catch(() => { console.warn(`texture missing: ${name}`); return null; });
  const entries = await Promise.all([
    ...TEXTURED_BODY_IDS.map((id) => load(id, "jpg")),
    load(RING_TEXTURE, "png"),
    load(NIGHT_TEXTURE, "jpg"),
  ]);
  return new Map(entries.filter((e) => e !== null));
}
```

- Called during app boot **in parallel** with the API fetch (doc 04 boot sequence); the scene is only built once both resolve.
- A missing texture is non-fatal: the body falls back to flat color (`map` absent ⇒ use `color` — doc 05). A missing `earth-night` entry is also non-fatal: Earth simply renders without city lights (doc 05, "Earth night lights").
- `.gitignore` must **not** exclude `public/textures`. Add a `apps/frontend/public/textures/.gitkeep` in S1 so the folder exists before S6.
