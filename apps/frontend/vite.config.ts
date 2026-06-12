import { createRequire } from "module";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const _require = createRequire(import.meta.url);
const { version } = _require("./package.json") as { version: string };

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: { proxy: { "/api": "http://localhost:3001" } },
  test: {
    environment: "node",
  },
});
