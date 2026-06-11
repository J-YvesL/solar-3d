import * as THREE from "three";

/** City-lights brightness on the night side (doc 05). Lower toward 0.7 if it blooms. */
const NIGHT_INTENSITY = 1.0;

/**
 * Adds the Earth city-lights effect (doc 05, "Earth night lights"): the
 * `earth-night.jpg` map is sampled in the shader, masked to the night
 * hemisphere, and ADDED to the emissive radiance — fading across the terminator.
 *
 * Deliberately does NOT touch `material.emissive` / `material.emissiveMap`: the
 * Picker (doc 06) drives `material.emissive` for hover/focus highlighting, so the
 * night lights must be independent or they vanish the moment Earth is focused.
 * The night map is passed as its own `uNightMap` sampler and composes on top of
 * whatever emissive highlight the Picker sets.
 *
 * Returns a per-frame updater that refreshes the sun-direction uniform; call it
 * once per frame from the animation loop after the Earth anchor is positioned.
 * Requires the material's base color `map` (Earth's day texture) for `vMapUv`.
 */
export function applyEarthNightLights(
  material: THREE.MeshStandardMaterial,
  nightTexture: THREE.Texture,
): (earthMesh: THREE.Object3D) => void {
  const uSunDirection = { value: new THREE.Vector3(1, 0, 0) }; // body → sun, world space
  const uNightMap = { value: nightTexture };

  material.onBeforeCompile = (shader) => {
    shader.uniforms["uSunDirection"] = uSunDirection;
    shader.uniforms["uNightMap"] = uNightMap;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldNormal;")
      .replace(
        "#include <defaultnormal_vertex>",
        "#include <defaultnormal_vertex>\nvWorldNormal = normalize(mat3(modelMatrix) * objectNormal);",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vWorldNormal;\nuniform vec3 uSunDirection;\nuniform sampler2D uNightMap;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float cosSun = dot(normalize(vWorldNormal), uSunDirection);
        float nightMask = 1.0 - smoothstep(-0.10, 0.10, cosSun);
        totalEmissiveRadiance += texture2D(uNightMap, vMapUv).rgb * nightMask * ${NIGHT_INTENSITY.toFixed(1)};`,
      );
  };

  const tmp = new THREE.Vector3();
  return (earthMesh) => {
    // Sun is at the world origin, so body → sun direction = −worldPos.
    earthMesh.getWorldPosition(tmp);
    uSunDirection.value.copy(tmp).multiplyScalar(-1).normalize();
  };
}
