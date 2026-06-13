import * as THREE from "three";

const TEXTURED_BODY_IDS = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "moon",
  "pluto", // S28
  "charon", // S28
];
const RING_TEXTURE = "saturn-ring";
const NIGHT_TEXTURE = "earth-night"; // S14 — Earth emissive night map
const CLOUD_TEXTURE = "earth-clouds"; // S29 — Earth cloud layer (used as alphaMap)

/** Preloads all body textures in parallel. Missing textures are non-fatal (console.warn). */
export async function preloadTextures(): Promise<Map<string, THREE.Texture>> {
  const loader = new THREE.TextureLoader();

  // colorSpace defaults to sRGB (color maps); data maps (e.g. the clouds alphaMap, S29)
  // pass NoColorSpace so their values are read linearly and the alpha isn't skewed.
  const load = (name: string, ext: string, colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace) =>
    loader
      .loadAsync(`/textures/${name}.${ext}`)
      .then((t) => {
        t.colorSpace = colorSpace;
        return [name, t] as const;
      })
      .catch(() => {
        console.warn(`texture missing: ${name}`);
        return null;
      });

  const entries = await Promise.all([
    ...TEXTURED_BODY_IDS.map((id) => load(id, "jpg")),
    load(RING_TEXTURE, "png"),
    load(NIGHT_TEXTURE, "jpg"),
    load(CLOUD_TEXTURE, "jpg", THREE.NoColorSpace),
  ]);

  return new Map(
    entries.filter((e): e is readonly [string, THREE.Texture] => e !== null),
  );
}
