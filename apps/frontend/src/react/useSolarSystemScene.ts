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
  // goBack is registered once on mount; read the live selection from a ref so the
  // stable callback never closes over a stale selectedBodyId.
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedBodyId;

  const reset = useCallback(() => {
    setSelectedBodyId(null);
    sceneRef.current?.resetView();
  }, []);

  const focus = useCallback((bodyId: string) => {
    setSelectedBodyId(bodyId);
    sceneRef.current?.focusBody(bodyId, layoutRef.current);
  }, []);

  // Navigate up one level: moon → parent planet → system view (doc 06).
  const goBack = useCallback(() => {
    const currentId = selectedIdRef.current;
    if (currentId !== null && modelRef.current !== null) {
      const body = modelRef.current.byId(currentId);
      if (body?.type === "moon" && body.parentId !== null) {
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

  return { sceneRef, selectedBodyId, focus, reset, goBack, onSelect, onClear };
}
