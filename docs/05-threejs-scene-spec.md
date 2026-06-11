# 05 — Three.js Scene Specification

Every visual/numeric decision is fixed here. Implement the formulas exactly; the "expected result" tables let you sanity-check your output.

## Renderer & global setup

```ts
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 5000);
camera.position.set(0, 160, 320);   // initial system view, looking at origin
```

`OrbitControls` (from `three/examples/jsm/controls/OrbitControls`): `enableDamping: true`, `dampingFactor: 0.08`, `minDistance: 15`, `maxDistance: 900`. Call `controls.update()` every frame.

## Coordinate conventions

- The ecliptic is the **XZ plane** (`y = 0`). "Above" = +Y.
- A body with `orbitalAngleDeg = θ` on an orbit of display radius `R` sits at (within its orbit group):
  ```
  x = R · cos(θ·π/180)
  z = −R · sin(θ·π/180)        // minus ⇒ increasing θ is counter-clockwise seen from +Y
  y = 0
  ```
- Orbital inclination: rotate the **orbit group** `group.rotation.x = degToRad(inclinationDeg)`. (We ignore the node longitude Ω — documented simplification. Triton's 157° automatically yields a retrograde-looking orbit.)
- Axial tilt: `tiltGroup.rotation.z = degToRad(axialTiltDeg)`; spin: `mesh.rotation.y = degToRad(rotationAngleDeg)` on the mesh *inside* the tilt group. (Real pole azimuth ignored — simplification.)

## Scaling formulas (`domain/scaling.ts`) — the "not to scale but proportional" core

```ts
export const EARTH_RADIUS_KM = 6371;
export const MERCURY_SMA_AU = 0.38709927;

// Body size: power law compresses the range, proportions stay visible.
export function displayRadius(radiusKm: number, type: BodyType): number {
  if (type === "star") return 12;
  return Math.max(2.5 * Math.pow(radiusKm / EARTH_RADIUS_KM, 0.4), 0.45);
}

// Planet orbit: log scale anchored on Mercury at 35 units.
export function orbitDisplayRadius(semiMajorAxisAu: number): number {
  return 35 + 170 * Math.log10(semiMajorAxisAu / MERCURY_SMA_AU);
}
// (the API gives semiMajorAxisKm — divide by 149_597_870.7 to get au)

// Moon orbit in focused view: linear spread around the parent.
// index = rank of the moon ordered by real semiMajorAxisKm (0 = innermost).
export function moonOrbitDisplayRadius(parentDisplayRadius: number, index: number): number {
  return parentDisplayRadius * (2.2 + index * 1.1);
}
```

### Expected values (assert these in `scaling.test.ts`, tolerance ±0.05)

Body display radii: mercury 1.70, venus 2.45, earth 2.50, mars 1.94, **jupiter 6.52**, saturn 6.06, uranus 4.34, neptune 4.29, sun 12, moon 1.49, ganymede 1.76, titan 1.74, triton 1.35, mimas 0.62, phobos/deimos clamped to 0.45.

Orbit display radii: mercury 35.0, venus 81.2, earth 105.1, mars 136.2, jupiter 226.8, saturn 271.6, uranus 323.2, neptune 356.4.

Moon orbits, e.g. Jupiter (parent 6.52): io 14.3, europa 21.5, ganymede 28.7, callisto 35.9.

## Scene graph

```
scene
├── starfield                                  (THREE.Points)
├── sun
│   ├── mesh: SphereGeometry(12, 64, 64) + MeshBasicMaterial({ map: sunTexture })
│   └── light: PointLight(0xffffff, intensity 3, distance 0, decay 0) at (0,0,0)
├── ambient: AmbientLight(0xffffff, 0.07)
└── per planet: planetSystem (Group)
    ├── orbitGroup (rotation.x = incl)
    │   ├── orbitLine                          (LineLoop, see below)
    │   └── anchor (Object3D) — position set every frame from orbitalAngleDeg
    │       ├── tiltGroup (rotation.z = tilt)
    │       │   └── bodyMesh (rotation.y = spin)   [+ ringsMesh for saturn]
    │       └── moonsGroup (visible = false in system view)
    │           └── per moon: same orbitGroup/orbitLine/anchor/tiltGroup/mesh pattern,
    │                         radii from moonOrbitDisplayRadius()
```

`bodyMesh.userData.bodyId = body.id` on every body mesh — the Picker (doc 06) relies on it.

## Materials & lighting

- Planets/moons: `MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0 })`; if the body has no texture file (doc 08), use `MeshStandardMaterial({ color: body.color, roughness: 1, metalness: 0 })`.
- The single `PointLight` at the sun + low ambient produce the required day/night terminator automatically. **No shadow maps** (`renderer.shadowMap.enabled` stays false).
- Acceptance check: looking at Earth, the Sun-facing side is clearly lit, the opposite side near-black. If the dark side is invisible, raise ambient to max 0.12; if no contrast, lower it — never above 0.15.
- Sphere segments: planets `SphereGeometry(r, 48, 48)`, moons `(r, 32, 32)`.

### Saturn's rings

```ts
const inner = saturnDisplayRadius * 1.25, outer = saturnDisplayRadius * 2.35;
const geo = new THREE.RingGeometry(inner, outer, 128);
// Remap UVs radially, otherwise the ring texture renders as a mess (known gotcha):
const pos = geo.attributes.position; const v = new THREE.Vector3();
for (let i = 0; i < pos.count; i++) {
  v.fromBufferAttribute(pos, i);
  geo.attributes.uv.setXY(i, v.length() < (inner + outer) / 2 ? 0 : 1, 1);
}
const mat = new THREE.MeshBasicMaterial({
  map: saturnRingTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.9,
});
const rings = new THREE.Mesh(geo, mat);
rings.rotation.x = Math.PI / 2;      // ring plane = equator plane, inside tiltGroup
```

Add `rings` inside Saturn's `tiltGroup` (so they tilt with the planet), **not** spinning with `bodyMesh`.

### Sun glow (bloom)

`EffectComposer` + `RenderPass` + `UnrealBloomPass(resolution, strength 1.1, radius 0.5, threshold 0.85)` from `three/examples/jsm/postprocessing/...`. Render via `composer.render()` (not `renderer.render`). The emissive sun (MeshBasicMaterial, bright texture) exceeds the threshold and glows; textured planets stay mostly below it. If planets visibly glow, raise threshold to 0.9.

## Orbit lines

```ts
// circle of radius R in the XZ plane, 128 segments
const pts = [...Array(128)].map((_, i) => {
  const a = (i / 128) * Math.PI * 2;
  return new THREE.Vector3(R * Math.cos(a), 0, -R * Math.sin(a));
});
new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(pts),
  new THREE.LineBasicMaterial({ color: 0x445566, transparent: true, opacity: 0.35 })
);
```

Moon orbit lines: same, `opacity 0.25`, only visible in focused view.

## Starfield

```ts
// 3000 uniformly distributed points on a sphere of radius 1800
const positions = new Float32Array(3000 * 3);
for (let i = 0; i < 3000; i++) {
  const u = Math.random(), vv = Math.random();
  const theta = 2 * Math.PI * u, phi = Math.acos(2 * vv - 1);   // uniform on sphere
  positions.set([1800 * Math.sin(phi) * Math.cos(theta),
                 1800 * Math.cos(phi),
                 1800 * Math.sin(phi) * Math.sin(theta)], i * 3);
}
new THREE.Points(geometry, new THREE.PointsMaterial({
  color: 0xffffff, size: 1.2, sizeAttenuation: false,
  transparent: true, opacity: 0.55, depthWrite: false,
}));
```

Subtle is the goal: stars must never compete with the planets.

## Time & animation loop

```ts
export const SIM_DAYS_PER_REAL_SECOND_SYSTEM = 2;     // system view: Earth year ≈ 3 min
export const SIM_DAYS_PER_REAL_SECOND_FOCUSED = 0.05; // focused view: moons stay watchable
```

The `SimulationClock` (doc 04) integrates `simDays += rate · realDelta`; `SceneManager` switches the rate when entering/leaving focus (the clock keeps its accumulated `simDays` — no jump).

Per frame (`renderer.setAnimationLoop`):

```
delta = threeClock.getDelta()
simClock.tick(delta)
for each planet & visible moon:
  { orbitalAngleDeg, rotationAngleDeg } = model.stateAt(id, simClock.simDaysSinceEpoch)
  anchor.position.set(R·cos, 0, −R·sin)
  bodyMesh.rotation.y = degToRad(rotationAngleDeg)
sun mesh rotation.y likewise
if focused: cameraDirector.trackFocusedBody()   // see below
controls.update()
composer.render()
```

## CameraDirector

### Focus transition (`focusBody(id, layout)`)

1. Compute every frame during the transition (the planet moves!):
   - `targetPos` = focused body's **world position** (`mesh.getWorldPosition`)
   - `dist = max(outermostMoonOrbitRadius * 1.6, bodyDisplayRadius * 8)`; for the sun or a moon: `bodyDisplayRadius * 8`
   - `endCamPos = targetPos + normalize(currentCamPos − targetPos, but y clamped ≥ 0.25·dist) · dist`
2. Animate over **1.2 s** with ease-in-out-cubic (`t<0.5 ? 4t³ : 1−(−2t+2)³/2`): lerp `camera.position → endCamPos` and `controls.target → targetPos`. Controls disabled during the transition, re-enabled after with `minDistance = dist·0.3`, `maxDistance = dist·4`.
3. **Half-screen placement via view offset** (this is the trick — do not move the target sideways):
   - horizontal layout (desktop): `camera.setViewOffset(w, h, 0.25·w, 0, w, h)` → body renders in the **left** half.
   - vertical layout (mobile): `camera.setViewOffset(w, h, 0, 0.25·h, w, h)` → body renders in the **top** half.
   - If the body lands on the wrong side, flip the offset sign — verify visually once.
4. After the transition, every frame (`trackFocusedBody`): `controls.target.copy(bodyWorldPos)` and translate the camera by the body's frame-to-frame world displacement so the view follows the body on its orbit.
5. Show `moonsGroup` (and moon orbit lines) of the focused planet at transition start; clock rate → FOCUSED.

### Reset (`resetView()`)

Animate 1.2 s back to `position (0,160,320)`, `target (0,0,0)`, `camera.clearViewOffset()`, hide all moonsGroups, clock rate → SYSTEM, restore minDistance 15 / maxDistance 900.

### `setFocusLayout(layout)`

Just re-applies step 3's `setViewOffset` with the new layout (called by React on breakpoint change, doc 06).

## Resize

On `window.resize`: update `camera.aspect` + `updateProjectionMatrix()`, `renderer.setSize`, `composer.setSize`, and re-apply the current view offset if focused.

## Disposal

`SceneManager.dispose()`: `renderer.setAnimationLoop(null)`, traverse scene disposing geometries/materials/textures, `renderer.dispose()`, remove the canvas element, remove window listeners.
