import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import {
  SimulationClock,
  SIM_DAYS_PER_REAL_SECOND_FOCUSED,
  SIM_DAYS_PER_REAL_SECOND_SYSTEM,
} from "../domain/simulationClock";
import type { SolarSystemModel } from "../domain/solarSystemModel";
import {
  createBodyMesh,
  createOrbitLine,
  createSaturnRings,
  createStarfield,
  createSun,
  prepareSatelliteGltf,
} from "./buildScene";
import { CameraDirector } from "./CameraDirector";
import { visitorLongitudeDeg } from "../domain/visitorLongitude";
import { applyEarthNightLights } from "./earthNightLights";
import { createComposer } from "./postprocessing";
import { Picker } from "./Picker";

const DEG = Math.PI / 180;
const degToRad = (d: number) => d * DEG;

export interface SceneBodyEntry {
  anchor: THREE.Object3D;
  mesh: THREE.Object3D;  // THREE.Mesh for spheres, THREE.Group for GLTF models (S24)
  orbitRadius: number;
}

export class SceneManager {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly composer: EffectComposer;
  private readonly model: SolarSystemModel;
  private readonly textures: Map<string, THREE.Texture>;
  private readonly gltfs: Map<string, THREE.Group>;
  private readonly picker: Picker;
  private readonly cameraDirector: CameraDirector;

  private readonly threeClock = new THREE.Clock();
  private readonly simClock = new SimulationClock(SIM_DAYS_PER_REAL_SECOND_SYSTEM);

  readonly sceneBodyMap = new Map<string, SceneBodyEntry>();
  readonly moonsGroupMap = new Map<string, THREE.Group>();

  private readonly _bodySelectedCbs = new Set<(id: string) => void>();
  private readonly _selectionClearedCbs = new Set<() => void>();
  private readonly onWindowResize = () => this.resize();

  // S14 — Earth city lights: updater + mesh, both null when the night map is absent
  private earthNightUpdate: ((earthMesh: THREE.Object3D) => void) | null = null;
  private earthMesh: THREE.Mesh | null = null;

  // S15 — pre-allocated vectors for Earth focus direction (click-time, not per-frame)
  private readonly _earthFocusWorldPos = new THREE.Vector3();
  private readonly _earthFocusDir = new THREE.Vector3();
  private readonly _earthFocusRotM = new THREE.Matrix4();

  constructor(
    container: HTMLElement,
    model: SolarSystemModel,
    textures: Map<string, THREE.Texture>,
    gltfs: Map<string, THREE.Group> = new Map(),
  ) {
    this.model = model;
    this.textures = textures;
    this.gltfs = gltfs;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 5000);
    this.camera.position.set(0, 160, 320);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 900;

    // Sun + starfield
    const { sunMesh, sunLight, ambient } = createSun(textures);
    this.scene.add(createStarfield(), sunMesh, sunLight, ambient);

    const sunBody = model.bodies.find((b) => b.type === "star");
    if (sunBody !== undefined) {
      this.sceneBodyMap.set(sunBody.id, { anchor: sunMesh, mesh: sunMesh, orbitRadius: 0 });
    }

    this.buildSolarSystem();

    this.composer = createComposer(this.renderer, this.scene, this.camera);

    // Picker
    this.picker = new Picker(
      this.camera,
      this.renderer.domElement,
      (bodyId) => this.handleBodyPick(bodyId),
      () => this.handleSelectionClear(),
    );
    this.updatePickables(null);

    // CameraDirector
    this.cameraDirector = new CameraDirector(
      this.camera,
      this.controls,
      this.model,
      this.sceneBodyMap,
      this.renderer,
    );

    window.addEventListener("resize", this.onWindowResize);

    this.renderer.setAnimationLoop(() => {
      const delta = this.threeClock.getDelta();
      this.simClock.tick(delta);
      this.animateBodies();
      if (this.earthNightUpdate !== null && this.earthMesh !== null) {
        this.earthNightUpdate(this.earthMesh);
      }
      this.picker.update();
      this.cameraDirector.update(delta);
      this.controls.update();
      this.composer.render();
    });
  }

  // ── Scene construction ────────────────────────────────────────────────────

  private buildSolarSystem(): void {
    const planets = this.model.bodies.filter((b) => b.type === "planet");

    for (const planet of planets) {
      const orbitRadius = planet.orbitDisplayRadius ?? 0;
      const moons = this.model.childrenOf(planet.id);

      const planetSystem = new THREE.Group();

      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.x = degToRad(planet.inclinationDeg ?? 0);
      planetSystem.add(orbitGroup);
      orbitGroup.add(createOrbitLine(orbitRadius));

      const anchor = new THREE.Object3D();
      const angle = planet.orbitalAngleDeg ?? 0;
      anchor.position.set(
        orbitRadius * Math.cos(degToRad(angle)),
        0,
        -orbitRadius * Math.sin(degToRad(angle)),
      );
      orbitGroup.add(anchor);

      const tiltGroup = new THREE.Group();
      // Default 'XYZ' Euler order applies the Z tilt before the Y yaw (doc 05):
      // lean the pole, then aim the lean at its real ecliptic azimuth.
      tiltGroup.rotation.z = degToRad(planet.axialTiltDeg);
      tiltGroup.rotation.y = degToRad(planet.poleEclipticLonDeg - 180);
      anchor.add(tiltGroup);

      const mesh = createBodyMesh(planet, this.textures);
      mesh.rotation.y = degToRad(planet.rotationAngleDeg + 180 - planet.poleEclipticLonDeg);
      tiltGroup.add(mesh);

      // S14 — Earth city lights on the night hemisphere (only if both the day map
      // and the night map are present; the shader samples the night map at vMapUv)
      if (planet.id === "earth") {
        const nightTex = this.textures.get("earth-night");
        if (
          nightTex !== undefined &&
          mesh.material instanceof THREE.MeshStandardMaterial &&
          mesh.material.map !== null
        ) {
          this.earthNightUpdate = applyEarthNightLights(mesh.material, nightTex);
          this.earthMesh = mesh;
        }
      }

      if (planet.id === "saturn") {
        tiltGroup.add(createSaturnRings(planet.displayRadius, this.textures));
      }

      const moonsGroup = new THREE.Group();
      moonsGroup.visible = false;
      anchor.add(moonsGroup);
      this.moonsGroupMap.set(planet.id, moonsGroup);

      for (const moon of moons) {
        const moonOrbitRadius = moon.orbitDisplayRadius ?? 0;

        // S23: satellites get a nodeGroup (ascending-node yaw) wrapping the orbit group.
        // Moons ignore the node longitude — documented simplification (doc 05).
        let orbitContainer: THREE.Group = moonsGroup;
        if (moon.type === "satellite" && moon.nodeLonDeg !== null) {
          const nodeGroup = new THREE.Group();
          nodeGroup.rotation.y = degToRad(moon.nodeLonDeg);
          moonsGroup.add(nodeGroup);
          orbitContainer = nodeGroup;
        }

        const moonOrbitGroup = new THREE.Group();
        moonOrbitGroup.rotation.x = degToRad(moon.inclinationDeg ?? 0);
        orbitContainer.add(moonOrbitGroup);
        moonOrbitGroup.add(createOrbitLine(moonOrbitRadius, 0.25));

        const moonAnchor = new THREE.Object3D();
        const moonAngle = moon.orbitalAngleDeg ?? 0;
        moonAnchor.position.set(
          moonOrbitRadius * Math.cos(degToRad(moonAngle)),
          0,
          -moonOrbitRadius * Math.sin(degToRad(moonAngle)),
        );
        moonOrbitGroup.add(moonAnchor);

        const moonTiltGroup = new THREE.Group();
        moonTiltGroup.rotation.z = degToRad(moon.axialTiltDeg);
        moonTiltGroup.rotation.y = degToRad(moon.poleEclipticLonDeg - 180);
        moonAnchor.add(moonTiltGroup);

        // S24: use the committed GLB for satellites; fall back to a sphere on any failure.
        let moonMesh: THREE.Object3D;
        if (moon.type === "satellite") {
          const gltfScene = this.gltfs.get(moon.id);
          if (gltfScene !== undefined) {
            moonMesh = prepareSatelliteGltf(gltfScene.clone(), moon.id);
          } else {
            const sphere = createBodyMesh(moon, this.textures);
            sphere.userData["bodyId"] = moon.id;
            moonMesh = sphere;
          }
        } else {
          moonMesh = createBodyMesh(moon, this.textures);
        }
        moonMesh.rotation.y = degToRad(moon.rotationAngleDeg + 180 - moon.poleEclipticLonDeg);
        moonTiltGroup.add(moonMesh);

        this.sceneBodyMap.set(moon.id, {
          anchor: moonAnchor,
          mesh: moonMesh,
          orbitRadius: moonOrbitRadius,
        });
      }

      this.sceneBodyMap.set(planet.id, { anchor, mesh, orbitRadius });
      this.scene.add(planetSystem);
    }
  }

  // ── S15 — Earth focus direction ───────────────────────────────────────────

  /** Returns the visitor-meridian world direction for Earth, null for all other bodies. */
  private earthFocusDirection(bodyId: string): THREE.Vector3 | null {
    if (bodyId !== "earth") return null;
    const entry = this.sceneBodyMap.get("earth");
    if (entry === undefined) return null;

    entry.mesh.getWorldPosition(this._earthFocusWorldPos);

    const { orbitalAngleDeg, rotationAngleDeg } = this.model.stateAt(
      "earth",
      this.simClock.simDaysSinceEpoch,
    );
    const lss = ((orbitalAngleDeg + 180 - rotationAngleDeg) % 360 + 360) % 360;
    const delta = visitorLongitudeDeg() - lss;

    // dSun = direction from Earth toward the Sun (sun is at the world origin)
    this._earthFocusDir.copy(this._earthFocusWorldPos).multiplyScalar(-1).normalize();

    // Rotate dSun around +Y by Δ to get the visitor-meridian outward direction
    this._earthFocusRotM.makeRotationY((delta * Math.PI) / 180);
    this._earthFocusDir.applyMatrix4(this._earthFocusRotM);

    return this._earthFocusDir;
  }

  // ── Animation ─────────────────────────────────────────────────────────────

  private animateBodies(): void {
    const simDays = this.simClock.simDaysSinceEpoch;

    for (const [id, entry] of this.sceneBodyMap) {
      const body = this.model.byId(id);
      if (body === undefined) continue;

      if ((body.type === "moon" || body.type === "satellite") && body.parentId !== null) {
        const mg = this.moonsGroupMap.get(body.parentId);
        if (mg !== undefined && !mg.visible) continue;
      }

      const { orbitalAngleDeg, rotationAngleDeg } = this.model.stateAt(id, simDays);

      if (entry.orbitRadius > 0) {
        const rad = orbitalAngleDeg * DEG;
        entry.anchor.position.set(
          entry.orbitRadius * Math.cos(rad),
          0,
          -entry.orbitRadius * Math.sin(rad),
        );
      }

      // The sun has no tilt group, so no yaw to compensate (doc 05).
      const spinOffsetDeg = body.type === "star" ? 0 : 180 - body.poleEclipticLonDeg;
      entry.mesh.rotation.y = (rotationAngleDeg + spinOffsetDeg) * DEG;
    }
  }

  // ── Picking handlers ──────────────────────────────────────────────────────

  private handleBodyPick(bodyId: string): void {
    if (this.cameraDirector.isTransitioning) return;
    for (const cb of this._bodySelectedCbs) cb(bodyId);
  }

  private handleSelectionClear(): void {
    if (this.cameraDirector.isTransitioning) return;
    for (const cb of this._selectionClearedCbs) cb();
  }

  private updatePickables(focusedId: string | null): void {
    const meshes: THREE.Mesh[] = [];
    // Resolve which planet's moons/satellites are pickable (handles moon/satellite-is-focused case)
    let moonParentId: string | null = null;
    if (focusedId !== null) {
      const focused = this.model.byId(focusedId);
      if (focused?.type === "planet") {
        moonParentId = focusedId;
      } else if (focused?.type === "moon" || focused?.type === "satellite") {
        moonParentId = focused.parentId;
      }
    }

    // Collect Mesh instances from an Object3D (handles both plain Mesh and GLTF Group).
    const collectMeshes = (obj: THREE.Object3D): void => {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
      } else {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) meshes.push(child);
        });
      }
    };

    for (const [id, entry] of this.sceneBodyMap) {
      const body = this.model.byId(id);
      if (body === undefined) continue;
      if (body.type === "moon" || body.type === "satellite") {
        if (body.parentId === moonParentId) collectMeshes(entry.mesh);
      } else {
        collectMeshes(entry.mesh);
      }
    }
    this.picker.setPickables(meshes);
    this.picker.setFocused(focusedId !== null);
    this.picker.setFocusedBodyId(focusedId);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  onBodySelected(cb: (bodyId: string) => void): () => void {
    this._bodySelectedCbs.add(cb);
    return () => this._bodySelectedCbs.delete(cb);
  }

  onSelectionCleared(cb: () => void): () => void {
    this._selectionClearedCbs.add(cb);
    return () => this._selectionClearedCbs.delete(cb);
  }

  focusBody(bodyId: string, layout: "horizontal" | "vertical"): void {
    if (this.cameraDirector.isTransitioning) return;
    if (this.cameraDirector.focusedBodyId === bodyId) return;

    const prevId = this.cameraDirector.focusedBodyId;

    // Resolve the owning-planet id for moonsGroup management.
    // For moons/satellites their planet is the parentId; for planets it's themselves.
    const ownerPlanetId = (id: string | null): string | null => {
      if (id === null) return null;
      const b = this.model.byId(id);
      if (b === undefined) return null;
      if (b.type === "planet") return id;
      if ((b.type === "moon" || b.type === "satellite") && b.parentId !== null) return b.parentId;
      return null;
    };

    const prevPlanetId = ownerPlanetId(prevId);
    const newPlanetId = ownerPlanetId(bodyId);

    // Hide the previous planet's moonsGroup when moving to a different planet context
    if (prevPlanetId !== null && prevPlanetId !== newPlanetId) {
      const prev = this.moonsGroupMap.get(prevPlanetId);
      if (prev !== undefined) prev.visible = false;
    }

    // Show the new planet's moonsGroup (planet focus, or moon/satellite focus)
    if (newPlanetId !== null) {
      const mg = this.moonsGroupMap.get(newPlanetId);
      if (mg !== undefined) mg.visible = true;
    }

    this.updatePickables(bodyId);
    this.simClock.setRate(SIM_DAYS_PER_REAL_SECOND_FOCUSED);
    this.cameraDirector.focusBody(bodyId, layout, this.earthFocusDirection(bodyId));
  }

  resetView(): void {
    const prevId = this.cameraDirector.focusedBodyId;
    if (prevId !== null) {
      // For moons/satellites, hide the parent planet's moonsGroup
      const prevBody = this.model.byId(prevId);
      const planetId =
        (prevBody?.type === "moon" || prevBody?.type === "satellite") &&
        prevBody?.parentId !== null
          ? prevBody.parentId
          : prevId;
      const mg = this.moonsGroupMap.get(planetId);
      if (mg !== undefined) mg.visible = false;
    }
    this.updatePickables(null);
    this.simClock.setRate(SIM_DAYS_PER_REAL_SECOND_SYSTEM);
    this.cameraDirector.resetView();
  }

  setFocusLayout(layout: "horizontal" | "vertical"): void {
    this.cameraDirector.setFocusLayout(layout);
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.cameraDirector.onResize();
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.onWindowResize);
    this.picker.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) m.dispose();
      }
    });
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
