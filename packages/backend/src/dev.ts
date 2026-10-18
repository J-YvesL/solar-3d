import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import type { Bindings } from "./env";
import type { TleStore } from "./ephemeris/tle";
import { createLogger } from "./logger";

// Local Node entry (`pnpm dev`). Serves the same Hono app as the Worker, for hosts
// where `wrangler dev` cannot run (workerd needs a 48-bit VA kernel — not the
// Raspberry Pi's). The KV binding is replaced by a gitignored file cache.

const logger = createLogger("server");
const CACHE_DIR = resolve(".cache");

const fileStore: TleStore = {
  get: (key) => readFile(join(CACHE_DIR, `${key}.json`), "utf8").catch(() => null),
  put: async (key, value) => {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(join(CACHE_DIR, `${key}.json`), value);
  },
};

const env: Bindings = {
  ISS_TLE_OFFLINE: process.env["ISS_TLE_OFFLINE"] ?? "1",
  LOG_LEVEL: process.env["LOG_LEVEL"],
  TLE_CACHE: fileStore,
};

const app = createApp();
serve({ fetch: (request) => app.fetch(request, env), port: 3001 }, () => {
  logger.info("Backend listening on http://localhost:3001");
});
