import * as THREE from "three";
import type { Body } from "../domain/types";
import { hitboxRadius } from "../domain/scaling";

/** 3000 uniformly distributed points on a sphere of radius 1800. */
export function createStarfield(): THREE.Points {
  const positions = new Float32Array(3000 * 3);
  for (let i = 0; i < 3000; i++) {
    const u = Math.random();
    const vv = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * vv - 1);
    positions.set(
      [
        1800 * Math.sin(phi) * Math.cos(theta),
        1800 * Math.cos(phi),
        1800 * Math.sin(phi) * Math.sin(theta),
      ],
      i * 3,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  );
}

/** Sun mesh + PointLight + AmbientLight. Falls back to flat color if texture is missing. */
export function createSun(textures: Map<string, THREE.Texture>): {
  sunMesh: THREE.Mesh;
  sunLight: THREE.PointLight;
  ambient: THREE.AmbientLight;
} {
  const sunTex = textures.get("sun");
  const material = sunTex
    ? new THREE.MeshBasicMaterial({ map: sunTex })
    : new THREE.MeshBasicMaterial({ color: "#FDB813" });

  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(12, 64, 64), material);
  sunMesh.userData["bodyId"] = "sun";

  // decay: 0 disables distance attenuation so all planets receive light
  const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0);
  const ambient = new THREE.AmbientLight(0xffffff, 0.07);

  return { sunMesh, sunLight, ambient };
}

/**
 * Planet or moon mesh with texture or flat-color fallback.
 * Sets userData.bodyId for raycasting (Picker, S10).
 */
export function createBodyMesh(body: Body, textures: Map<string, THREE.Texture>): THREE.Mesh {
  const segments = body.type === "moon" ? 32 : 48;
  const geo = new THREE.SphereGeometry(body.displayRadius, segments, segments);
  const tex = textures.get(body.id);
  const mat = tex
    ? new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 })
    : new THREE.MeshStandardMaterial({ color: body.color, roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData["bodyId"] = body.id;
  return mesh;
}

/**
 * Prepare a GLTF scene for use as a satellite mesh (S24, doc 05).
 * Normalizes the bounding box to ~0.9 units and sets userData.bodyId
 * on every descendant mesh so the Picker can identify it.
 */
export function prepareSatelliteGltf(scene: THREE.Group, bodyId: string): THREE.Group {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) scene.scale.setScalar(0.9 / maxDim);

  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.userData["bodyId"] = bodyId;
    }
  });

  return scene;
}

/**
 * Invisible spherical hitbox around a body (S26, doc 06).
 * An invisible material is not rendered but the mesh is still raycastable,
 * so near-misses select the body (tiny ISS, mobile taps).
 * The caller sets userData.pickTarget to the body's visual Object3D.
 */
export function createHitbox(bodyId: string, displayRadius: number): THREE.Mesh {
  const hitbox = new THREE.Mesh(
    new THREE.SphereGeometry(hitboxRadius(displayRadius), 12, 12),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitbox.userData["bodyId"] = bodyId;
  hitbox.userData["isHitbox"] = true;
  return hitbox;
}

/** Circular orbit line in the XZ plane (128 segments). */
export function createOrbitLine(radius: number, opacity = 0.35): THREE.LineLoop {
  const pts = Array.from({ length: 128 }, (_, i) => {
    const a = (i / 128) * Math.PI * 2;
    return new THREE.Vector3(radius * Math.cos(a), 0, -radius * Math.sin(a));
  });
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x445566, transparent: true, opacity }),
  );
}

/**
 * Saturn's rings with radial UV remap so the ring texture renders correctly.
 * Must be added inside tiltGroup (tilts with planet, does not spin with bodyMesh).
 */
export function createSaturnRings(
  saturnDisplayRadius: number,
  textures: Map<string, THREE.Texture>,
): THREE.Mesh {
  const inner = saturnDisplayRadius * 1.25;
  const outer = saturnDisplayRadius * 2.35;
  const geo = new THREE.RingGeometry(inner, outer, 128);

  // Remap UVs radially — without this, the ring texture renders as a mess (known Three.js gotcha)
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const mid = (inner + outer) / 2;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    uv.setXY(i, v.length() < mid ? 0 : 1, 1);
  }

  const ringTex = textures.get("saturn-ring");
  const mat = new THREE.MeshBasicMaterial({
    map: ringTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const rings = new THREE.Mesh(geo, mat);
  rings.rotation.x = Math.PI / 2;
  return rings;
}
