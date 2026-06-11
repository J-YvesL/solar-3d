import { describe, expect, it } from "vitest";
import { julianDate, julianCenturiesSinceJ2000 } from "./julian";

describe("julian", () => {
  it("1: JD(2000-01-01T12:00:00Z) = 2451545.0; T = 0", () => {
    const date = new Date("2000-01-01T12:00:00Z");
    expect(julianDate(date)).toBe(2_451_545.0);
    expect(julianCenturiesSinceJ2000(date)).toBe(0);
  });

  it("2: JD(2026-01-03T18:00:00Z) = 2461044.25", () => {
    const date = new Date("2026-01-03T18:00:00Z");
    expect(julianDate(date)).toBeCloseTo(2_461_044.25, 5);
  });
});
