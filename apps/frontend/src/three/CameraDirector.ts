import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SolarSystemModel } from "../domain/solarSystemModel";

const TRANSITION_DURATION = 1.2; // seconds

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type BodySceneRef = { mesh: THREE.Mesh; orbitRadius: number };

type State =
  | { phase: "idle" }
  | {
      phase: "transitioning";
      bodyId: string;
      layout: "horizontal" | "vertical";
      dist: number;
      elapsed: number;
      startCamPos: THREE.Vector3;
      startTarget: THREE.Vector3;
      startViewOffsetX: number;
      startViewOffsetY: number;
      targetViewOffsetX: number;
      targetViewOffsetY: number;
      /** When set, overrides the camera-relative direction for the endCamPos computation. */
      focusDirection: THREE.Vector3 | null;
    }
  | {
      phase: "focused";
      bodyId: string;
      layout: "horizontal" | "vertical";
      lastBodyWorldPos: THREE.Vector3;
    }
  | {
      phase: "resetting";
      elapsed: number;
      startCamPos: THREE.Vector3;
      startTarget: THREE.Vector3;
      startViewOffsetX: number;
      startViewOffsetY: number;
    };

export class CameraDirector {
  private state: State = { phase: "idle" };

  // Pre-allocated vectors — no per-frame allocations
  private readonly tmpBodyPos = new THREE.Vector3();
  private readonly tmpDir = new THREE.Vector3();
  private readonly tmpDelta = new THREE.Vector3();
  private readonly tmpEndCam = new THREE.Vector3();
  private readonly SYSTEM_CAM = new THREE.Vector3(0, 160, 320);
  private readonly SYSTEM_TARGET = new THREE.Vector3(0, 0, 0);

  private viewOffsetX = 0;
  private viewOffsetY = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly model: SolarSystemModel,
    private readonly sceneBodyMap: ReadonlyMap<string, BodySceneRef>,
    private readonly renderer: THREE.WebGLRenderer,
  ) {}

  get isTransitioning(): boolean {
    return this.state.phase === "transitioning" || this.state.phase === "resetting";
  }

  get focusedBodyId(): string | null {
    return this.state.phase === "focused" || this.state.phase === "transitioning"
      ? this.state.bodyId
      : null;
  }

  focusBody(
    bodyId: string,
    layout: "horizontal" | "vertical",
    focusDirection: THREE.Vector3 | null = null,
  ): void {
    if (this.state.phase === "focused" && this.state.bodyId === bodyId) return;

    const entry = this.sceneBodyMap.get(bodyId);
    const body = this.model.byId(bodyId);
    if (entry === undefined || body === undefined) return;

    const dist = this.computeDist(bodyId);
    this.controls.enabled = false;
    this.relaxDistanceClamp();

    const [targetViewOffsetX, targetViewOffsetY] = this.computeViewOffsetTarget(layout);
    this.state = {
      phase: "transitioning",
      bodyId,
      layout,
      dist,
      elapsed: 0,
      startCamPos: this.camera.position.clone(),
      startTarget: this.controls.target.clone(),
      startViewOffsetX: this.viewOffsetX,
      startViewOffsetY: this.viewOffsetY,
      targetViewOffsetX,
      targetViewOffsetY,
      focusDirection,
    };
  }

  resetView(): void {
    this.controls.enabled = false;
    this.relaxDistanceClamp();
    this.state = {
      phase: "resetting",
      elapsed: 0,
      startCamPos: this.camera.position.clone(),
      startTarget: this.controls.target.clone(),
      startViewOffsetX: this.viewOffsetX,
      startViewOffsetY: this.viewOffsetY,
    };
  }

  setFocusLayout(layout: "horizontal" | "vertical"): void {
    if (this.state.phase !== "focused") return;
    this.state = { ...this.state, layout };
    this.applyViewOffset(layout);
  }

  /** Re-apply the view offset for the current layout after a renderer resize (doc 06). */
  onResize(): void {
    if (this.state.phase === "focused") this.applyViewOffset(this.state.layout);
  }

  /** Call every frame from the animation loop. */
  update(delta: number): void {
    switch (this.state.phase) {
      case "transitioning":
        this.tickTransition(delta);
        break;
      case "focused":
        this.trackFocusedBody();
        break;
      case "resetting":
        this.tickReset(delta);
        break;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private tickTransition(delta: number): void {
    if (this.state.phase !== "transitioning") return;
    this.state.elapsed += delta;
    const t = Math.min(this.state.elapsed / TRANSITION_DURATION, 1);
    const ease = easeInOutCubic(t);

    const entry = this.sceneBodyMap.get(this.state.bodyId);
    if (entry === undefined) return;

    // Recompute endCamPos every frame — the target body is moving
    entry.mesh.getWorldPosition(this.tmpBodyPos);

    if (this.state.focusDirection !== null) {
      // Explicit direction (e.g. Earth S15 visitor meridian): use as-is so the camera
      // faces the equator. The 0.25·dist y-clamp is intentionally skipped — applying it
      // would push the camera toward the pole when the direction is near-horizontal.
      this.tmpDir.copy(this.state.focusDirection);
    } else {
      this.tmpDir.copy(this.camera.position).sub(this.tmpBodyPos);
      this.tmpDir.y = Math.max(this.tmpDir.y, 0.25 * this.state.dist);
    }
    this.tmpDir.normalize().multiplyScalar(this.state.dist);

    // Lerp camera position and controls target (reuse tmpEndCam — no per-frame alloc)
    this.tmpEndCam.copy(this.tmpBodyPos).add(this.tmpDir);
    this.camera.position.lerpVectors(this.state.startCamPos, this.tmpEndCam, ease);
    this.controls.target.lerpVectors(this.state.startTarget, this.tmpBodyPos, ease);

    // Ease the view offset in alongside the fly-in (0 → target), so the body slides
    // smoothly into the framed position instead of snapping at the end.
    const ox = Math.round(
      this.state.startViewOffsetX + (this.state.targetViewOffsetX - this.state.startViewOffsetX) * ease,
    );
    const oy = Math.round(
      this.state.startViewOffsetY + (this.state.targetViewOffsetY - this.state.startViewOffsetY) * ease,
    );
    this.applyOffsetRaw(ox, oy);

    if (t >= 1) {
      const { bodyId, layout, targetViewOffsetX, targetViewOffsetY, dist } = this.state;
      this.applyOffsetRaw(targetViewOffsetX, targetViewOffsetY);
      this.controls.minDistance = dist * 0.3;
      this.controls.maxDistance = dist * 4;
      this.controls.enabled = true;

      entry.mesh.getWorldPosition(this.tmpBodyPos);
      this.state = {
        phase: "focused",
        bodyId,
        layout,
        lastBodyWorldPos: this.tmpBodyPos.clone(),
      };
    }
  }

  private trackFocusedBody(): void {
    if (this.state.phase !== "focused") return;
    const entry = this.sceneBodyMap.get(this.state.bodyId);
    if (entry === undefined) return;

    entry.mesh.getWorldPosition(this.tmpBodyPos);

    // Translate camera by the body's frame-to-frame displacement
    this.tmpDelta.copy(this.tmpBodyPos).sub(this.state.lastBodyWorldPos);
    this.camera.position.add(this.tmpDelta);
    this.controls.target.copy(this.tmpBodyPos);
    this.state.lastBodyWorldPos.copy(this.tmpBodyPos);
  }

  private tickReset(delta: number): void {
    if (this.state.phase !== "resetting") return;
    this.state.elapsed += delta;
    const t = Math.min(this.state.elapsed / TRANSITION_DURATION, 1);
    const ease = easeInOutCubic(t);

    this.camera.position.lerpVectors(this.state.startCamPos, this.SYSTEM_CAM, ease);
    this.controls.target.lerpVectors(this.state.startTarget, this.SYSTEM_TARGET, ease);

    const ox = Math.round(this.state.startViewOffsetX * (1 - ease));
    const oy = Math.round(this.state.startViewOffsetY * (1 - ease));
    this.applyOffsetRaw(ox, oy);

    if (t >= 1) {
      this.applyOffsetRaw(0, 0);
      this.controls.minDistance = 15;
      this.controls.maxDistance = 900;
      this.controls.enabled = true;
      this.state = { phase: "idle" };
    }
  }

  /**
   * Disable OrbitControls' distance clamping during a transition. `controls.update()`
   * runs every frame regardless of `enabled` and clamps the radius to [min, max]; with the
   * focused body's tight bounds still active it would pin the camera to the moving target and
   * snap when the bounds widen. The proper bounds are reapplied when the transition completes.
   */
  private relaxDistanceClamp(): void {
    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;
  }

  /** Target view offset (px) for a layout at the current renderer size. */
  private computeViewOffsetTarget(layout: "horizontal" | "vertical"): [number, number] {
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    return layout === "horizontal"
      ? [Math.round(0.25 * w), 0]
      : [0, Math.round(0.25 * h)];
  }

  /** Apply an absolute view offset (or clear it when zero), tracking the current value. */
  private applyOffsetRaw(ox: number, oy: number): void {
    this.viewOffsetX = ox;
    this.viewOffsetY = oy;
    if (ox !== 0 || oy !== 0) {
      const w = this.renderer.domElement.width;
      const h = this.renderer.domElement.height;
      this.camera.setViewOffset(w, h, ox, oy, w, h);
    } else {
      this.camera.clearViewOffset();
    }
  }

  private applyViewOffset(layout: "horizontal" | "vertical"): void {
    const [ox, oy] = this.computeViewOffsetTarget(layout);
    this.applyOffsetRaw(ox, oy);
  }

  private computeDist(bodyId: string): number {
    const body = this.model.byId(bodyId);
    if (body === undefined) return 50;
    if (body.type !== "planet") return body.displayRadius * 8;
    const moons = this.model.childrenOf(bodyId);
    if (moons.length === 0) return body.displayRadius * 8;
    const outermost = moons[moons.length - 1]!;
    const moonOrbitR = outermost.orbitDisplayRadius ?? 0;
    return Math.max(moonOrbitR * 1.6, body.displayRadius * 8);
  }
}
