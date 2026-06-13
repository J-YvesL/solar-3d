# 08 — Texture Assets

## Policy

The app is **fully standalone**: every texture is downloaded once at development time, committed to git, and served from `apps/frontend/public/textures/`. At runtime the app must make **zero** requests to third-party hosts. Never load a texture from a CDN URL.

## Source & license

[Solar System Scope textures](https://www.solarsystemscope.com/textures/) — **CC BY 4.0**, 2k resolution. Attribution is mandatory: the HUD footer (doc 06) and the README must contain `Textures: Solar System Scope (CC BY 4.0) — https://www.solarsystemscope.com/textures/`.

**Pluto & Charon (S28) come from a second source.** Solar System Scope has no Pluto/Charon map, and the raw NASA New Horizons mosaics only cover the imaged encounter hemisphere (the southern hemisphere was in polar night, leaving a large black no-data region that renders as a black cap on the sphere). So these two use **community texture maps derived from the New Horizons data with the un-imaged areas completed**, hosted on DeviantArt — full-globe, no black no-data. Provenance and authors are recorded in the "Pluto & Charon maps" section below; both follow the same standalone policy (downloaded once, normalised, committed, zero runtime third-party requests).

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

`pluto.jpg` and `charon.jpg` (S28) are **not** in this auto-fetch table — they come from DeviantArt (tokenized URLs that expire), so they are **manual downloads committed to the repo**, documented in "Pluto & Charon maps" below.

**The 18 other moons have no texture file** (the 19 minor moons minus Charon, now textured — S28) — they render with their flat `color` from doc 03 Table 3 (doc 05 materials section). Do not hunt for moon textures elsewhere; this is a deliberate scope decision.

`earth-night.jpg` (added in story S14) is **not** a body color map: it is the emissive night-lights map applied to Earth's material only (doc 05, "Earth night lights"). Run `pnpm download-textures` again in S14 to fetch it (the script is idempotent — the 11 original files are skipped) and commit it like the others.

Budget: 12 auto-fetched files (Solar System Scope) + 2 manual files (Pluto/Charon, S28) = 14 textures, ≈ 7–11 MB total. If a downloaded file is 0 bytes or not an image, the script must fail loudly.

## Download script — `scripts/download-textures.mjs`

Plain Node 24 (built-in `fetch`), no dependencies:

- Hardcode the manifest above as `[{ file, url }]`.
- `mkdir -p apps/frontend/public/textures` (`fs.mkdirSync(..., { recursive: true })`).
- For each entry: skip if the file already exists with size > 10 kB (idempotent); otherwise fetch, check `res.ok` and `content-type` starts with `image/`, write with `fs.writeFileSync(path, Buffer.from(await res.arrayBuffer()))`.
- Print a per-file ✓/✗ summary; `process.exit(1)` if any file failed.
- Run via root script: `pnpm download-textures` (doc 01). Run it **once** during story S6, then commit the files.

## Frontend loading — `three/textures.ts`

```ts
const TEXTURED_BODY_IDS = ["sun","mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","moon","pluto","charon"];
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

## ISS model — `public/models/iss.glb` (S24)

Same standalone policy as the textures: the model is downloaded **once at development time**, committed, and served from `apps/frontend/public/models/`. Zero third-party requests at runtime.

- **Format**: a single self-contained `.glb` (binary glTF, textures embedded if any).
- **Budget**: ≤ **15 000 triangles** and ≤ **2 MB** — it must render smoothly on mobile and on low-end GPUs (the bloom pass already costs a full-screen pass). Prefer a single material; no animations, no skinning.
- **Source & license**: a free-license low-poly ISS (NASA 3D Resources are public domain; CC0/CC BY models from Sketchfab/Poly Pizza also qualify). **At commit time, record here the exact source URL, author and license** — and if the license requires attribution (CC BY), add the credit line to the README (the HUD footer is not required unless the license demands public-facing attribution).
  - Source: *to be filled in S24* — URL, author, license.
- **Source** (filled in S24):
  - URL: `https://solarsystem.nasa.gov/gltf_embed/2378/` (embedded viewer page) — direct asset: `https://solarsystem.nasa.gov/rails/active_storage/blobs/redirect/…/ISS_stationary.glb`
  - Author: NASA (Solar System Exploration)
  - License: **U.S. Government Work — public domain** (17 U.S.C. § 105)
  - File committed: `apps/frontend/public/models/iss.glb` — optimized with `gltf-transform optimize --texture-compress webp --texture-size 128` (original 43 MB → 2.7 MB)
  - No attribution required by the license; the NASA credit is noted here for provenance.
- **Download**: manual (one file, no script change). `.gitignore` must not exclude `public/models/`.
- **Loading**: preloaded at boot alongside the textures via `GLTFLoader` (`three/examples/jsm/loaders/GLTFLoader` — bundled with three, **not a new dependency**), same `Promise.all`, same graceful-fallback policy: a missing/corrupt GLB → `console.warn`, the ISS renders as the S23 flat-color sphere, no crash. Scaling and `userData.bodyId` rules in doc 05 ("Satellites in the scene graph").

## Pluto & Charon maps — `public/textures/{pluto,charon}.jpg` (S28)

Full-globe equirectangular (2:1) texture maps derived from **NASA New Horizons** data with the un-imaged hemisphere completed by the artists (the raw NASA mosaics have a large black no-data region — see the "Source & license" note). Same standalone policy as the other textures (committed, zero runtime third-party requests), but **manual downloads** (not in the auto-fetch manifest) because the DeviantArt CDN URLs are tokenized and expire — the ISS-GLB precedent.

- **Sources** (DeviantArt art pages, retrieved 2026-06-13):
  - Pluto: *Pluto Texture Map (Fixed Blur Unmaped Areas)* by **4stron4omi4** — `https://www.deviantart.com/4stron4omi4/art/Pluto-Texture-Map-Fixed-Blur-Unmaped-Areas-1101489593` (New-Horizons-based, un-imaged areas blurred-in; preview capped at 1264×632, upscaled).
  - Charon: *Charon Texture Map Mixed* by **bob3studios** — `https://www.deviantart.com/bob3studios/art/Charon-Texture-Map-Mixed-766281881` (New-Horizons-based, colorized; downloaded at 2048×1024).
- **License**: DeviantArt fan-made derivatives of public-domain NASA New Horizons imagery; credited to their authors here (and in the README) for attribution/provenance. The footer attribution line stays Solar System Scope, unchanged.
- **Normalisation** (one-off, at download): each fetched via the page's wixmp image URL, then `magick <src> -resize 2048x1024! -colorspace sRGB -interlace none -strip -quality 90 <id>.jpg` to match the other body maps' format (2048×1024 baseline sRGB). Re-fetch the wixmp URL from the art page if it 403s (the token expires); the committed files are the source of truth.
- **Graceful fallback**: identical to every other texture — a missing/invalid file → `console.warn`, Pluto/Charon render with their flat `color` from doc 03 (Pluto `#D9C8A8`, Charon `#9C8E80`), no crash.
