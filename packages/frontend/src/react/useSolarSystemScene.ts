import { useCallback, useEffect, useRef, useState } from "react";
import type { SolarSystemModel } from "../domain/solarSystemModel";
import type { SceneManager } from "../three/SceneManager";
import type { Layout } from "./useLayout";

export function useSolarSystemScene(model: SolarSystemModel | null, layout: Layout) {
  const sceneRef = useRef<SceneManager | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const layoutRef = useRef<Layout>(layout);
  layoutRef.current = layout;
  const modelRef = useRef(model);
  modelRef.current = model;
  // Live selection mirror, updated synchronously in focus/reset (not at render time):
  // stable callbacks (goBack, onSceneReady) read it without closing over stale state,
  // and it is already current when CanvasHost remounts before the next render.
  const selectedIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    selectedIdRef.current = null;
    setSelectedBodyId(null);
    sceneRef.current?.resetView();
  }, []);

  const focus = useCallback((bodyId: string) => {
    selectedIdRef.current = bodyId;
    setSelectedBodyId(bodyId);
    sceneRef.current?.focusBody(bodyId, layoutRef.current);
  }, []);

  // CanvasHost calls this right after constructing a SceneManager. A new scene starts
  // un-focused even when React still holds a selection (StrictMode's mount/unmount/mount
  // cycle recreates the scene after the deep link focused the first instance), so
  // re-apply the current selection to the fresh instance.
  const onSceneReady = useCallback(() => {
    const id = selectedIdRef.current;
    if (id !== null) sceneRef.current?.focusBody(id, layoutRef.current);
  }, []);

  // Navigate up one level: moon/satellite → parent planet → system view (doc 06).
  const goBack = useCallback(() => {
    const currentId = selectedIdRef.current;
    if (currentId !== null && modelRef.current !== null) {
      const body = modelRef.current.byId(currentId);
      if ((body?.type === "moon" || body?.type === "satellite") && body.parentId !== null) {
        focus(body.parentId);
        return;
      }
    }
    reset();
  }, [focus, reset]);

  // Escape key: go back one level — listener active only when focused (doc 06).
  useEffect(() => {
    if (selectedBodyId === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedBodyId, goBack]);

  // Re-offset the camera when the layout flips while focused (doc 06).
  useEffect(() => {
    if (selectedBodyId !== null) sceneRef.current?.setFocusLayout(layout);
  }, [layout, selectedBodyId]);

  // Passed to CanvasHost and registered once on mount.
  const onSelect = useCallback((bodyId: string) => focus(bodyId), [focus]);
  const onClear = useCallback(() => goBack(), [goBack]);

  return { sceneRef, selectedBodyId, focus, reset, goBack, onSelect, onClear, onSceneReady };
}
