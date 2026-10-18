import type { TleStore } from "./ephemeris/tle";

/** Worker bindings declared in wrangler.jsonc (doc 01). All optional so tests can omit them. */
export interface Bindings {
  /** "0" or "false" → fetch the ISS TLE from the network; anything else (or unset) → offline. */
  ISS_TLE_OFFLINE?: string;
  /** Minimum log level: debug | info | warn | error (default info). */
  LOG_LEVEL?: string;
  /** Workers KV namespace persisting the ISS TLE across isolates (doc 02 step E). */
  TLE_CACHE?: TleStore;
}

export type AppEnv = { Bindings: Bindings };

/** Online only on an explicit opt-out of offline mode — tests and dev stay offline by default. */
export function isTleOffline(env: Bindings | undefined): boolean {
  const v = env?.ISS_TLE_OFFLINE;
  return v !== "0" && v !== "false";
}
