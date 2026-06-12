import { useEffect, useRef } from "react";
import { pathForBody, bodyIdFromPath } from "../domain/routes";

interface Params {
  validIds: ReadonlySet<string>;
  selectedBodyId: string | null;
  focus: (id: string) => void;
  reset: () => void;
  isReady: boolean;
}

/**
 * Syncs URL ↔ selectedBodyId using the History API (doc 06, S21).
 * - On boot (once the model is ready): deep-link or replaceState("/").
 * - On selection change: pushState (skipped when triggered by popstate/deep-link).
 * - On popstate: focus the body from the path or reset to system view.
 */
export function useRoute({ validIds, selectedBodyId, focus, reset, isReady }: Params): void {
  // Set to true to suppress the next push in the selectedBodyId effect.
  const skipNextPushRef = useRef(false);
  // Guard so the deep-link effect runs at most once.
  const deepLinkDoneRef = useRef(false);

  // Deep link: fires once when the model first becomes ready.
  useEffect(() => {
    if (!isReady || deepLinkDoneRef.current) return;
    deepLinkDoneRef.current = true;
    const id = bodyIdFromPath(location.pathname, validIds);
    if (id !== null) {
      skipNextPushRef.current = true; // URL already correct — don't push
      focus(id);
    } else if (location.pathname !== "/") {
      history.replaceState(null, "", "/");
    }
  }, [isReady, validIds, focus]);

  // Selection change → push URL (skipped for popstate/deep-link-driven changes).
  useEffect(() => {
    if (!isReady) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }
    const newPath = pathForBody(selectedBodyId);
    if (location.pathname !== newPath) {
      history.pushState(null, "", newPath);
    }
  }, [selectedBodyId, isReady]);

  // popstate → update selection to match the new URL.
  useEffect(() => {
    const handler = () => {
      skipNextPushRef.current = true;
      const id = bodyIdFromPath(location.pathname, validIds);
      if (id !== null) {
        focus(id);
      } else {
        reset();
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [validIds, focus, reset]);
}
