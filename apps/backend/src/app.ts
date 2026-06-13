import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { bodiesRouter } from "./routes/bodies";

/**
 * Logs every request and its response status. For any non-2XX response it also
 * logs an error detail (the response body's `error`/`message`, or the status text).
 */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  console.log(`[http] → ${req.method} ${req.originalUrl} (incoming)`);

  // Capture the response body so a non-2XX status can report why it failed.
  let payload: unknown;
  const originalSend = res.send.bind(res);
  res.send = ((body?: unknown) => {
    payload = body;
    return originalSend(body as Parameters<typeof originalSend>[0]);
  }) as typeof res.send;

  res.on("finish", () => {
    const ms = Date.now() - start;
    const line = `[http] ← ${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(line);
    } else {
      console.warn(`${line} — ${errorDetail(payload, res)}`);
    }
  });

  next();
}

/** Best-effort extraction of an error message from a response body. */
function errorDetail(payload: unknown, res: Response): string {
  let body: unknown = payload;
  if (typeof payload === "string") {
    try {
      body = JSON.parse(payload);
    } catch {
      // Not JSON — fall back to the raw string below.
      const trimmed = payload.trim();
      if (trimmed !== "" && trimmed.length < 200) return trimmed;
      body = undefined;
    }
  }
  if (body !== null && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message = record["error"] ?? record["message"];
    if (typeof message === "string") return message;
  }
  return res.statusMessage || "non-2XX response";
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/bodies", bodiesRouter);

  return app;
}
