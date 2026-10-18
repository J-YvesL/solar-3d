import { afterEach, describe, expect, it, vi } from "vitest";
import type { BodyDto } from "@solar/shared";
import { createApp } from "../app";
import type { Bindings } from "../env";
import { resetTleCache } from "../ephemeris/tle";

const app = createApp();

interface TestResponse {
  status: number;
  body: { epochIso: string; bodies: BodyDto[]; error?: string };
}

/** GET through the Hono app (no port, no network); bindings default to none → TLE offline. */
async function get(path: string, env?: Bindings): Promise<TestResponse> {
  const res = await app.request(path, {}, env);
  return { status: res.status, body: (await res.json()) as TestResponse["body"] };
}

/** The body with this id; fails the test when it is missing. */
function byId(bodies: BodyDto[], id: string): BodyDto {
  const body = bodies.find((b) => b.id === id);
  if (body === undefined) throw new Error(`body ${id} missing from the response`);
  return body;
}

afterEach(() => {
  resetTleCache();
  vi.unstubAllGlobals();
});

describe("GET /api/bodies", () => {
  it("15: 200, 32 bodies, valid epochIso, planet/moon/satellite angles in [0, 360)", async () => {
    const res = await get("/api/bodies");
    expect(res.status).toBe(200);
    expect(res.body.bodies).toHaveLength(32);
    expect(Number.isNaN(new Date(res.body.epochIso).getTime())).toBe(false);
    for (const body of res.body.bodies) {
      if (body.type !== "star") {
        expect(body.orbitalAngleDeg).toBeGreaterThanOrEqual(0);
        expect(body.orbitalAngleDeg).toBeLessThan(360);
      }
    }
  });

  it("16: ?date=2000-01-01T12:00:00Z → Earth orbitalAngleDeg ≈ 100.380", async () => {
    const res = await get("/api/bodies?date=2000-01-01T12:00:00Z");
    expect(res.status).toBe(200);
    const earth = byId(res.body.bodies, "earth");
    expect(earth.orbitalAngleDeg).toBeCloseTo(100.380, 2);
  });

  it("17: invalid date → 400 with error message", async () => {
    const res = await get("/api/bodies?date=banana");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid date");
  });

  it("18: ?lang=fr → Earth name = Terre, French description, same orbitalAngleDeg", async () => {
    const date = "2000-01-01T12:00:00Z";
    const resFr = await get(`/api/bodies?lang=fr&date=${date}`);
    const resEn = await get(`/api/bodies?date=${date}`);
    expect(resFr.status).toBe(200);
    const earth = byId(resFr.body.bodies, "earth");
    expect(earth.name).toBe("Terre");
    expect(earth.info.description).not.toBe(
      byId(resEn.body.bodies, "earth").info.description,
    );
    expect(earth.orbitalAngleDeg).toBeCloseTo(
      byId(resEn.body.bodies, "earth").orbitalAngleDeg ?? Number.NaN,
      5,
    );
  });

  it("19: ?lang=pt → 400 Invalid lang; invalid date still wins over invalid lang", async () => {
    const resPt = await get("/api/bodies?lang=pt");
    expect(resPt.status).toBe(400);
    expect(resPt.body.error).toBe("Invalid lang");
    const resBoth = await get("/api/bodies?lang=pt&date=banana");
    expect(resBoth.status).toBe(400);
    expect(resBoth.body.error).toBe("Invalid date");
  });

  it("20: default and ?lang=en return byte-identical bodies for the same date", async () => {
    const date = "2000-01-01T12:00:00Z";
    const resDefault = await get(`/api/bodies?date=${date}`);
    const resEn = await get(`/api/bodies?lang=en&date=${date}`);
    expect(resDefault.status).toBe(200);
    expect(resEn.status).toBe(200);
    expect(resEn.body.bodies).toEqual(resDefault.body.bodies);
  });

  it("24: ISS entry is valid; non-satellites have nodeLonDeg === null (S23)", async () => {
    const res = await get("/api/bodies");
    expect(res.status).toBe(200);
    const iss = byId(res.body.bodies, "iss");
    expect(iss.type).toBe("satellite");
    expect(iss.parentId).toBe("earth");
    expect(iss.orbitalAngleDeg).toBeGreaterThanOrEqual(0);
    expect(iss.orbitalAngleDeg).toBeLessThan(360);
    // Ecliptic-frame inclination after the equatorial→ecliptic conversion (S27):
    // i′ ∈ [i − ε, i + ε] = [~28°, ~75°] depending on the RAAN.
    expect(iss.inclinationDeg).toBeGreaterThanOrEqual(28);
    expect(iss.inclinationDeg).toBeLessThanOrEqual(76);
    expect(iss.nodeLonDeg).toBeGreaterThanOrEqual(0);
    expect(iss.nodeLonDeg).toBeLessThan(360);
    expect(iss.semiMajorAxisKm).toBeGreaterThanOrEqual(6600);
    expect(iss.semiMajorAxisKm).toBeLessThanOrEqual(6900);
    expect(iss.rotationAngleDeg).toBeCloseTo(iss.orbitalAngleDeg ?? Number.NaN, 5);
    // Every non-satellite body has nodeLonDeg === null
    for (const body of res.body.bodies) {
      if (body.type !== "satellite") {
        expect(body.nodeLonDeg, `${body.id} should have nodeLonDeg null`).toBeNull();
      }
    }
  });

  it("25: offline fallback — ISS served from committed snapshot; route returns 200 (S23)", async () => {
    // Online mode (explicit opt-in binding) with every network source failing.
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    resetTleCache();
    const res = await get("/api/bodies", { ISS_TLE_OFFLINE: "0" });
    expect(res.status).toBe(200);
    const iss = byId(res.body.bodies, "iss");
    expect(iss.type).toBe("satellite");
    expect(iss.orbitalAngleDeg).toBeGreaterThanOrEqual(0);
    expect(iss.orbitalAngleDeg).toBeLessThan(360);
  });
});
