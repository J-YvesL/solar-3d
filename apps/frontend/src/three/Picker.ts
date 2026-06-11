import * as THREE from "three";

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
  private hovered: THREE.Mesh | null = null;
  private pickables: THREE.Mesh[] = [];
  private focused = false;
  // The currently focused body's mesh — never gets the hover highlight.
  private focusedMesh: THREE.Mesh | null = null;
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
  setFocusedMesh(mesh: THREE.Mesh | null): void {
    this.focusedMesh = mesh;
    // Clear any highlight already applied if the hovered mesh just became focused.
    if (mesh !== null && this.hovered === mesh) {
      const mat = mesh.material;
      if (mat instanceof THREE.MeshStandardMaterial) mat.emissive.setHex(0x000000);
    }
  }

  /** Processes a pending hover raycast — call once per frame in the animation loop. */
  update(): void {
    if (!this.pendingHover || !this.hoverEnabled) return;
    this.pendingHover = false;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables);
    const hit = hits.length > 0 ? (hits[0]!.object as THREE.Mesh) : null;

    if (hit === this.hovered) return;

    if (this.hovered !== null) {
      const mat = this.hovered.material;
      if (mat instanceof THREE.MeshStandardMaterial) mat.emissive.setHex(0x000000);
      this.domElement.style.cursor = "default";
    }
    this.hovered = hit;
    if (this.hovered !== null) {
      if (this.hovered !== this.focusedMesh) {
        const mat = this.hovered.material;
        if (mat instanceof THREE.MeshStandardMaterial) mat.emissive.setHex(0x222222);
      }
      this.domElement.style.cursor = "pointer";
    }
  }

  dispose(): void {
    this.domElement.removeEventListener("pointerdown", this.handleDown);
    this.domElement.removeEventListener("pointerup", this.handleUp);
    if (this.hoverEnabled) {
      this.domElement.removeEventListener("pointermove", this.handleMove);
    }
    if (this.hovered !== null) {
      const mat = this.hovered.material;
      if (mat instanceof THREE.MeshStandardMaterial) mat.emissive.setHex(0x000000);
    }
    this.domElement.style.cursor = "default";
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
    const hits = this.raycaster.intersectObjects(this.pickables);

    if (hits.length > 0) {
      const bodyId = (hits[0]!.object as THREE.Mesh).userData["bodyId"] as string | undefined;
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
