import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("GET /api/bodies", () => {
  it("15: 200, 29 bodies, valid epochIso, planet/moon angles in [0, 360)", async () => {
    const res = await request(app).get("/api/bodies");
    expect(res.status).toBe(200);
    expect(res.body.bodies).toHaveLength(29);
    expect(Number.isNaN(new Date(res.body.epochIso).getTime())).toBe(false);
    for (const body of res.body.bodies) {
      if (body.type !== "star") {
        expect(body.orbitalAngleDeg).toBeGreaterThanOrEqual(0);
        expect(body.orbitalAngleDeg).toBeLessThan(360);
      }
    }
  });

  it("16: ?date=2000-01-01T12:00:00Z → Earth orbitalAngleDeg ≈ 100.380", async () => {
    const res = await request(app).get("/api/bodies?date=2000-01-01T12:00:00Z");
    expect(res.status).toBe(200);
    const earth = res.body.bodies.find((b: { id: string }) => b.id === "earth");
    expect(earth.orbitalAngleDeg).toBeCloseTo(100.380, 2);
  });

  it("17: invalid date → 400 with error message", async () => {
    const res = await request(app).get("/api/bodies?date=banana");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid date");
  });

  it("18: ?lang=fr → Earth name = Terre, French description, same orbitalAngleDeg", async () => {
    const date = "2000-01-01T12:00:00Z";
    const resFr = await request(app).get(`/api/bodies?lang=fr&date=${date}`);
    const resEn = await request(app).get(`/api/bodies?date=${date}`);
    expect(resFr.status).toBe(200);
    const earth = resFr.body.bodies.find((b: { id: string }) => b.id === "earth");
    expect(earth.name).toBe("Terre");
    expect(earth.info.description).not.toBe(
      resEn.body.bodies.find((b: { id: string }) => b.id === "earth").info.description,
    );
    expect(earth.orbitalAngleDeg).toBeCloseTo(
      resEn.body.bodies.find((b: { id: string }) => b.id === "earth").orbitalAngleDeg,
      5,
    );
  });

  it("19: ?lang=pt → 400 Invalid lang; invalid date still wins over invalid lang", async () => {
    const resPt = await request(app).get("/api/bodies?lang=pt");
    expect(resPt.status).toBe(400);
    expect(resPt.body.error).toBe("Invalid lang");
    const resBoth = await request(app).get("/api/bodies?lang=pt&date=banana");
    expect(resBoth.status).toBe(400);
    expect(resBoth.body.error).toBe("Invalid date");
  });

  it("20: default and ?lang=en return byte-identical bodies for the same date", async () => {
    const date = "2000-01-01T12:00:00Z";
    const resDefault = await request(app).get(`/api/bodies?date=${date}`);
    const resEn = await request(app).get(`/api/bodies?lang=en&date=${date}`);
    expect(resDefault.status).toBe(200);
    expect(resEn.status).toBe(200);
    expect(resEn.body.bodies).toEqual(resDefault.body.bodies);
  });
});
