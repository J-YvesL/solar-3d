import * as THREE from "three";

/** Sets the emissive color on every MeshStandardMaterial under target (S26 — GLTF groups too). */
function setEmissive(target: THREE.Object3D, hex: number): void {
  target.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
      obj.material.emissive.setHex(hex);
    }
  });
}

/**
 * Handles raycasting on pointerup (with 5 px drag threshold) and hover highlights.
 * Call update() once per frame to process pending hover raycasts.
 */
export class Picker {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private downX = 0;
  private downY = 0;
  private pendingHover = false;
  // Highlight target: the body's visual Object3D (sphere mesh or GLTF group), never a hitbox.
  private hovered: THREE.Object3D | null = null;
  private hoveredBodyId: string | null = null;
  private pickables: THREE.Mesh[] = [];
  private focused = false;
  // The currently focused body id — meshes with this bodyId never get the hover highlight.
  // Using bodyId instead of a mesh reference supports GLTF models with multiple child meshes.
  private focusedBodyId: string | null = null;
  // Hover only on devices that support it
  private readonly hoverEnabled = !window.matchMedia("(hover: none)").matches;

  constructor(
    private readonly camera: THREE.Camera,
    private readonly domElement: HTMLElement,
    private readonly onBodySelected: (bodyId: string) => void,
    private readonly onSelectionCleared: () => void,
  ) {
    domElement.addEventListener("pointerdown", this.handleDown);
    domElement.addEventListener("pointerup", this.handleUp);
    if (this.hoverEnabled) {
      domElement.addEventListener("pointermove", this.handleMove);
    }
  }

  setPickables(meshes: THREE.Mesh[]): void {
    this.pickables = meshes;
  }

  setFocused(focused: boolean): void {
    this.focused = focused;
  }

  /** The focused body is excluded from the hover highlight (doc 06). */
  setFocusedBodyId(bodyId: string | null): void {
    if (bodyId !== this.focusedBodyId) {
      // Clear any hover highlight that belonged to the previously focused body.
      if (this.hovered !== null && this.hoveredBodyId === this.focusedBodyId) {
        setEmissive(this.hovered, 0x000000);
      }
      this.focusedBodyId = bodyId;
    }
  }

  /** Processes a pending hover raycast — call once per frame in the animation loop. */
  update(): void {
    if (!this.pendingHover || !this.hoverEnabled) return;
    this.pendingHover = false;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.resolveHit(this.raycaster.intersectObjects(this.pickables));
    const target = hit !== null ? this.highlightTarget(hit) : null;

    if (target === this.hovered) return;

    if (this.hovered !== null) {
      setEmissive(this.hovered, 0x000000);
      this.domElement.style.cursor = "default";
    }
    this.hovered = target;
    this.hoveredBodyId = hit !== null ? ((hit.userData["bodyId"] as string | undefined) ?? null) : null;
    if (this.hovered !== null) {
      if (this.hoveredBodyId !== this.focusedBodyId) setEmissive(this.hovered, 0x222222);
      this.domElement.style.cursor = "pointer";
    }
  }

  dispose(): void {
    this.domElement.removeEventListener("pointerdown", this.handleDown);
    this.domElement.removeEventListener("pointerup", this.handleUp);
    if (this.hoverEnabled) {
      this.domElement.removeEventListener("pointermove", this.handleMove);
    }
    if (this.hovered !== null) setEmissive(this.hovered, 0x000000);
    this.domElement.style.cursor = "default";
  }

  /**
   * S26 — the first hit on real geometry wins; only when every hit is a hitbox
   * does the nearest hitbox win. Hitboxes never occlude real bodies.
   */
  private resolveHit(hits: THREE.Intersection[]): THREE.Object3D | null {
    const visual = hits.find((h) => h.object.userData["isHitbox"] !== true);
    return (visual ?? hits[0])?.object ?? null;
  }

  /** A hitbox highlights its body's visual Object3D (S26); real geometry highlights itself. */
  private highlightTarget(hit: THREE.Object3D): THREE.Object3D {
    const target: unknown = hit.userData["pickTarget"];
    return target instanceof THREE.Object3D ? target : hit;
  }

  private readonly handleDown = (e: PointerEvent) => {
    this.downX = e.clientX;
    this.downY = e.clientY;
  };

  private readonly handleUp = (e: PointerEvent) => {
    const dx = e.clientX - this.downX;
    const dy = e.clientY - this.downY;
    if (Math.sqrt(dx * dx + dy * dy) > 5) return; // drag — not a click

    const rect = this.domElement.getBoundingClientRect();
    this.pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.resolveHit(this.raycaster.intersectObjects(this.pickables));

    if (hit !== null) {
      const bodyId = hit.userData["bodyId"] as string | undefined;
      if (bodyId !== undefined) this.onBodySelected(bodyId);
    } else if (this.focused) {
      this.onSelectionCleared();
    }
  };

  private readonly handleMove = (e: PointerEvent) => {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.pendingHover = true;
  };
}
