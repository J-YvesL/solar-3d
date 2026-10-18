import { Hono, type MiddlewareHandler } from "hono";
import { bodiesRoute } from "./routes/bodies";
import { createLogger, setLogLevel } from "./logger";
import type { AppEnv } from "./env";

const logger = createLogger("http");

/** Logs incoming requests and their response status. */
const requestLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  setLogLevel(c.env?.LOG_LEVEL);
  const start = Date.now();
  const url = new URL(c.req.url);
  const target = `${c.req.method} ${url.pathname}${url.search}`;
  logger.info(`request ${target}`);

  await next();

  const ms = Date.now() - start;
  const line = `response ${target} ${c.res.status} (${ms}ms)`;
  if (c.res.status >= 200 && c.res.status < 300) {
    logger.info(line);
  } else {
    // Read a clone so the client still receives the original body.
    logger.warn(`${line} — ${await errorDetail(c.res.clone())}`);
  }
};

/** Best-effort extraction of an error message from a response body. */
async function errorDetail(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const body: unknown = JSON.parse(text);
    if (body !== null && typeof body === "object") {
      const record = body as Record<string, unknown>;
      const message = record["error"] ?? record["message"];
      if (typeof message === "string") return message;
    }
  } catch {
    // Not JSON — fall back to the raw string below.
    const trimmed = text.trim();
    if (trimmed !== "" && trimmed.length < 200) return trimmed;
  }
  return res.statusText || "non-2XX response";
}

export function createApp() {
  const app = new Hono<AppEnv>();
  app.use("/api/*", requestLogger);

  app.get("/api/health", (c) => c.json({ status: "ok" }));

  app.route("/api/bodies", bodiesRoute);

  return app;
}
