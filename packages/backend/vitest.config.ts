import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests are always offline: the ISS TLE fetch must never hit the network
    // (hermetic, deterministic, fast). `getIssTle()` serves the committed snapshot
    // when ISS_TLE_OFFLINE is set (doc 02 step E, CLAUDE.md rule 5). The fetch
    // fallback-chain tests (tle.test.ts) opt back online by deleting this var in a
    // beforeEach so they can exercise the stubbed network path.
    env: { ISS_TLE_OFFLINE: "1" },
  },
});
