// Minimal leveled logger. Writes through `console`, which Cloudflare Workers Logs
// (and the `wrangler dev` terminal) capture — the only place backend code may
// touch `console` (doc 07).

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
export type LogLevel = keyof typeof LEVELS;

let minLevel: LogLevel = "info";

/** Set the minimum level for every logger (from the `LOG_LEVEL` binding). */
export function setLogLevel(level: string | undefined): void {
  minLevel = level !== undefined && level in LEVELS ? (level as LogLevel) : "info";
}

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/** `YYYY-MM-DD HH:mm:ss.SSS` in UTC. */
function timestamp(): string {
  return new Date().toISOString().replace("T", " ").replace("Z", "");
}

export function createLogger(component: string): Logger {
  const log = (level: LogLevel, message: string): void => {
    if (LEVELS[level] < LEVELS[minLevel]) return;
    console[level](`${timestamp()} [${component}] ${level}: ${message}`);
  };
  return {
    debug: (message) => log("debug", message),
    info: (message) => log("info", message),
    warn: (message) => log("warn", message),
    error: (message) => log("error", message),
  };
}
