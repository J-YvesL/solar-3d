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
];
const RING_TEXTURE = "saturn-ring";
const NIGHT_TEXTURE = "earth-night"; // S14 — Earth emissive night map

/** Preloads all body textures in parallel. Missing textures are non-fatal (console.warn). */
export async function preloadTextures(): Promise<Map<string, THREE.Texture>> {
  const loader = new THREE.TextureLoader();

  const load = (name: string, ext: string) =>
    loader
      .loadAsync(`/textures/${name}.${ext}`)
      .then((t) => {
        t.colorSpace = THREE.SRGBColorSpace;
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
  ]);

  return new Map(
    entries.filter((e): e is readonly [string, THREE.Texture] => e !== null),
  );
}
