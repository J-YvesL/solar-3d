import { describe, expect, it } from "vitest";
import type { Body } from "./types";
import { SolarSystemModel } from "./solarSystemModel";

function makeBody(id: string, overrides: Partial<Body> = {}): Body {
  return {
    id,
    name: id,
    type: "planet",
    parentId: null,
    radiusKm: 1000,
    rotationPeriodHours: 24,
    axialTiltDeg: 0,
    poleEclipticLonDeg: 0,
    color: "#FFFFFF",
    semiMajorAxisKm: 100_000_000,
    eccentricity: 0,
    inclinationDeg: 0,
    nodeLonDeg: null,
    orbitalPeriodDays: 365,
    orbitalAngleDeg: 0,
    rotationAngleDeg: 0,
    displayRadius: 2.5,
    orbitDisplayRadius: 100,
    info: { description: "", composition: "", funFact: "" },
    ...overrides,
  };
}

describe("SolarSystemModel", () => {
  describe("childrenOf", () => {
    it("returns moons ordered by semiMajorAxisKm ascending", () => {
      const planet = makeBody("planet1");
      const moonFar = makeBody("far", { type: "moon", parentId: "planet1", semiMajorAxisKm: 500_000 });
      const moonNear = makeBody("near", { type: "moon", parentId: "planet1", semiMajorAxisKm: 100_000 });
      const model = new SolarSystemModel([planet, moonFar, moonNear], "2000-01-01T12:00:00Z");
      const children = model.childrenOf("planet1");
      expect(children.map((b) => b.id)).toEqual(["near", "far"]);
    });

    it("returns empty array for body with no moons", () => {
      const model = new SolarSystemModel([makeBody("lone")], "2000-01-01T12:00:00Z");
      expect(model.childrenOf("lone")).toHaveLength(0);
    });
  });

  describe("stateAt — orbital extrapolation", () => {
    it("orbitalAngleDeg advances linearly and wraps at 360", () => {
      const body = makeBody("planet", { orbitalAngleDeg: 90, orbitalPeriodDays: 360 });
      const model = new SolarSystemModel([body], "2000-01-01T12:00:00Z");

      expect(model.stateAt("planet", 0).orbitalAngleDeg).toBeCloseTo(90, 5);
      expect(model.stateAt("planet", 90).orbitalAngleDeg).toBeCloseTo(180, 5);
      // full orbit → back to start
      expect(model.stateAt("planet", 360).orbitalAngleDeg).toBeCloseTo(90, 5);
      // crosses 360 boundary
      expect(model.stateAt("planet", 270).orbitalAngleDeg).toBeCloseTo(0, 5);
    });

    it("mod-360 wrap — large simDays stay in [0, 360)", () => {
      const body = makeBody("planet", { orbitalAngleDeg: 45, orbitalPeriodDays: 365 });
      const model = new SolarSystemModel([body], "2000-01-01T12:00:00Z");
      for (const days of [0, 365, 730, 3650, 36500]) {
        const { orbitalAngleDeg } = model.stateAt("planet", days);
        expect(orbitalAngleDeg).toBeGreaterThanOrEqual(0);
        expect(orbitalAngleDeg).toBeLessThan(360);
      }
    });

    it("rotationAngleDeg accumulates and wraps", () => {
      const body = makeBody("planet", { rotationAngleDeg: 0, rotationPeriodHours: 24 });
      const model = new SolarSystemModel([body], "2000-01-01T12:00:00Z");
      // after 1 day (24 h) = 1 full rotation
      expect(model.stateAt("planet", 1).rotationAngleDeg).toBeCloseTo(0, 5);
      // after 0.5 day = half rotation
      expect(model.stateAt("planet", 0.5).rotationAngleDeg).toBeCloseTo(180, 5);
    });

    it("sun (null orbit) returns orbitalAngleDeg 0", () => {
      const sun = makeBody("sun", {
        type: "star",
        parentId: null,
        orbitalAngleDeg: null,
        orbitalPeriodDays: null,
        orbitDisplayRadius: null,
      });
      const model = new SolarSystemModel([sun], "2000-01-01T12:00:00Z");
      expect(model.stateAt("sun", 100).orbitalAngleDeg).toBe(0);
    });
  });
});
