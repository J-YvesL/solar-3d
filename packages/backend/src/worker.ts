import { createApp } from "./app";

// Cloudflare Worker entry (wrangler.jsonc `main`). Static assets — the built
// frontend — are served by the platform; only /api/* reaches this app.
export default createApp();
