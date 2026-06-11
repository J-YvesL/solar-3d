import { describe, expect, it } from "vitest";
import { keplerianElements } from "../data/keplerianElements";
import { julianCenturiesSinceJ2000 } from "./julian";
import { mod360, solveKepler, trueAnomaly, planetOrbitalAngle } from "./kepler";

describe("kepler", () => {
  it("3: Earth @ J2000 → orbitalAngleDeg ≈ 100.380", () => {
    const angle = planetOrbitalAngle("earth", new Date("2000-01-01T12:00:00Z"));
    expect(angle).toBeCloseTo(100.380, 2);
  });

  it("4: Earth @ 2026-01-03T18:00:00Z (perihelion) → M ≈ 0, orbitalAngleDeg ≈ 103.012", () => {
    const date = new Date("2026-01-03T18:00:00Z");
    const T = julianCenturiesSinceJ2000(date);
    const el = keplerianElements.earth;
    const L = el.L0 + el.LDot * T;
    const w = el.w0 + el.wDot * T;
    const M = mod360(L - w);
    // Near perihelion M wraps close to 0; check both sides of [0,360)
    expect(Math.min(M, 360 - M)).toBeLessThan(0.05);
    expect(planetOrbitalAngle("earth", date)).toBeCloseTo(103.012, 2);
  });

  it("5: Mercury @ J2000 → orbitalAngleDeg ≈ 253.951", () => {
    const angle = planetOrbitalAngle("mercury", new Date("2000-01-01T12:00:00Z"));
    expect(angle).toBeCloseTo(253.951, 2);
  });

  it("6: Jupiter @ 2030-01-01T00:00:00Z → orbitalAngleDeg ≈ 222.187", () => {
    const angle = planetOrbitalAngle("jupiter", new Date("2030-01-01T00:00:00Z"));
    expect(angle).toBeCloseTo(222.187, 2);
  });

  it("7: Kepler solver edge — M = 0 → E = 0, ν = 0", () => {
    for (const e of [0.01, 0.1, 0.2]) {
      const E = solveKepler(0, e);
      expect(E).toBeCloseTo(0, 10);
      expect(trueAnomaly(E, e)).toBeCloseTo(0, 10);
    }
  });

  it("8: output always in [0, 360) for a date far in the past", () => {
    const date = new Date("1900-01-01T00:00:00Z");
    for (const id of ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"] as const) {
      const angle = planetOrbitalAngle(id, date);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
    }
  });
});
