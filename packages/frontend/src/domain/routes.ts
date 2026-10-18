/** Returns the URL path for a given body id, or "/" for the system view. */
export function pathForBody(id: string | null): string {
  return id === null ? "/" : `/${id}`;
}

/**
 * Parses a URL path and returns the body id if it is valid, or null for
 * the system view ("/") and for unknown paths.
 */
export function bodyIdFromPath(path: string, validIds: ReadonlySet<string>): string | null {
  const id = path.startsWith("/") ? path.slice(1) : path;
  if (id === "" || !validIds.has(id)) return null;
  return id;
}
