import { useCallback, useEffect, useMemo, useState } from "react";
import type { Group, Texture } from "three";
import { fetchBodies, mapBodies } from "../api/client";
import { resolveLocale } from "../domain/i18n/locale";
import type { Locale } from "../domain/i18n/locale";
import { t } from "../domain/i18n/strings";
import { SolarSystemModel } from "../domain/solarSystemModel";
import { preloadTextures } from "../three/textures";
import { preloadModels } from "../three/models";
import { CanvasHost } from "./CanvasHost";
import { Hud } from "./Hud";
import { InfoPanel } from "./InfoPanel";
import { NavMenu } from "./NavMenu";
import { useLayout } from "./useLayout";
import { useRoute } from "./useRoute";
import { useSolarSystemScene } from "./useSolarSystemScene";
import "./styles.css";

type AppState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; model: SolarSystemModel; textures: Map<string, Texture>; gltfs: Map<string, Group> };

export function App() {
  const locale: Locale = useMemo(() => resolveLocale(navigator.language), []);
  const [state, setState] = useState<AppState>({ phase: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const layout = useLayout();
  const model = state.phase === "ready" ? state.model : null;
  const { sceneRef, selectedBodyId, focus, reset, goBack, onSelect, onClear, onSceneReady } =
    useSolarSystemScene(model, layout);

  const validIds = useMemo(
    () => new Set(model?.bodies.map((b) => b.id) ?? []) as ReadonlySet<string>,
    [model],
  );

  useRoute({
    validIds,
    selectedBodyId,
    focus,
    reset,
    isReady: state.phase === "ready",
  });

  useEffect(() => {
    setState({ phase: "loading" });
    let cancelled = false;

    Promise.all([fetchBodies(locale), preloadTextures(), preloadModels()])
      .then(([response, textures, gltfs]) => {
        if (cancelled) return;
        const bodies = mapBodies(response);
        const model = new SolarSystemModel(bodies, response.epochIso);
        setState({ phase: "ready", model, textures, gltfs });
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
  }, [retryKey, locale]);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  if (state.phase === "loading") {
    return (
      <div className="screen-center">
        <p className="loading-text">{t(locale, "loading")}</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="screen-center">
        <p>{t(locale, "errorTitle")}</p>
        <p className="error-detail">{state.message}</p>
        <button className="retry-btn" onClick={retry}>
          {t(locale, "retry")}
        </button>
      </div>
    );
  }

  const selectedBody = selectedBodyId !== null ? state.model.byId(selectedBodyId) : undefined;

  return (
    <>
      <NavMenu model={state.model} selectedBodyId={selectedBodyId} focus={focus} />
      <CanvasHost
        sceneRef={sceneRef}
        model={state.model}
        textures={state.textures}
        gltfs={state.gltfs}
        onSelect={onSelect}
        onClear={onClear}
        onSceneReady={onSceneReady}
      />
      {selectedBody !== undefined && (
        <InfoPanel body={selectedBody} model={state.model} locale={locale} />
      )}
      <Hud focused={selectedBodyId !== null} onBack={goBack} locale={locale} />
    </>
  );
}
