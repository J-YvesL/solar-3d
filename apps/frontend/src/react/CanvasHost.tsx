import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group, Texture } from "three";
import type { SolarSystemModel } from "../domain/solarSystemModel";
import { SceneManager } from "../three/SceneManager";

interface Props {
  sceneRef: MutableRefObject<SceneManager | null>;
  model: SolarSystemModel;
  textures: Map<string, Texture>;
  gltfs: Map<string, Group>;
  onSelect: (bodyId: string) => void;
  onClear: () => void;
}

export function CanvasHost({ sceneRef, model, textures, gltfs, onSelect, onClear }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // containerRef.current is guaranteed non-null immediately after mount (doc 07)
    const scene = new SceneManager(containerRef.current!, model, textures, gltfs);
    sceneRef.current = scene;
    const off1 = scene.onBodySelected(onSelect);
    const off2 = scene.onSelectionCleared(onClear);
    return () => {
      off1();
      off2();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [model, textures, gltfs]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="canvas-host" />;
}
