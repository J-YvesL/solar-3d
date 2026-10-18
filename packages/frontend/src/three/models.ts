import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ISS_MODEL_PATH = "/models/iss.glb";

/**
 * Preloads the ISS GLB at boot, alongside the textures (doc 05, S24).
 * A missing or corrupt GLB logs a warning and returns an empty map;
 * the ISS then falls back to the S23 flat-color sphere.
 *
 * The GLB uses EXT_meshopt_compression (required) so we must configure
 * the MeshoptDecoder bundled with three.js — not a new dependency.
 */
export async function preloadModels(): Promise<Map<string, THREE.Group>> {
  const loader = new GLTFLoader();

  try {
    const { MeshoptDecoder } = await import(
      "three/examples/jsm/libs/meshopt_decoder.module.js"
    );
    await (MeshoptDecoder as { ready: Promise<void> }).ready;
    loader.setMeshoptDecoder(MeshoptDecoder);
  } catch {
    console.warn("MeshoptDecoder unavailable; meshopt-compressed GLBs will not load");
  }

  const loadGlb = async (
    key: string,
    path: string,
  ): Promise<[string, THREE.Group] | null> => {
    try {
      const gltf = await loader.loadAsync(path);
      return [key, gltf.scene];
    } catch {
      console.warn(`model missing or failed to load: ${path}`);
      return null;
    }
  };

  const entries = await Promise.all([loadGlb("iss", ISS_MODEL_PATH)]);
  return new Map(entries.filter((e): e is [string, THREE.Group] => e !== null));
}
