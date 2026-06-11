import { useCallback, useEffect, useState } from "react";
import type { Texture } from "three";
import { fetchBodies, mapBodies } from "../api/client";
import { SolarSystemModel } from "../domain/solarSystemModel";
import { preloadTextures } from "../three/textures";
import { CanvasHost } from "./CanvasHost";
import { Hud } from "./Hud";
import { InfoPanel } from "./InfoPanel";
import { useLayout } from "./useLayout";
import { useSolarSystemScene } from "./useSolarSystemScene";
import "./styles.css";

type AppState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; model: SolarSystemModel; textures: Map<string, Texture> };

export function App() {
  const [state, setState] = useState<AppState>({ phase: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const layout = useLayout();
  const model = state.phase === "ready" ? state.model : null;
  const { sceneRef, selectedBodyId, goBack, onSelect, onClear } =
    useSolarSystemScene(model, layout);

  useEffect(() => {
    setState({ phase: "loading" });
    let cancelled = false;

    Promise.all([fetchBodies(), preloadTextures()])
      .then(([response, textures]) => {
        if (cancelled) return;
        const bodies = mapBodies(response);
        const model = new SolarSystemModel(bodies, response.epochIso);
        setState({ phase: "ready", model, textures });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  if (state.phase === "loading") {
    return (
      <div className="screen-center">
        <p className="loading-text">Loading the solar system…</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="screen-center">
        <p>Could not load the solar system.</p>
        <p className="error-detail">{state.message}</p>
        <button className="retry-btn" onClick={retry}>
          Retry
        </button>
      </div>
    );
  }

  const selectedBody = selectedBodyId !== null ? state.model.byId(selectedBodyId) : undefined;

  return (
    <>
      <CanvasHost
        sceneRef={sceneRef}
        model={state.model}
        textures={state.textures}
        onSelect={onSelect}
        onClear={onClear}
      />
      {selectedBody !== undefined && (
        <InfoPanel body={selectedBody} model={state.model} />
      )}
      <Hud focused={selectedBodyId !== null} onBack={goBack} />
    </>
  );
}
