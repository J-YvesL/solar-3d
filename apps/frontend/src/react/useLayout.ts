import { useEffect, useState } from "react";

export type Layout = "horizontal" | "vertical";

/** Subscribe to a media query and return its current match (doc 06). */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** "vertical" on narrow or portrait viewports, "horizontal" otherwise (doc 06). */
export function useLayout(): Layout {
  const isVertical = useMediaQuery("(max-width: 768px), (orientation: portrait)");
  return isVertical ? "vertical" : "horizontal";
}
