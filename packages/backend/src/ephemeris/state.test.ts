import { describe, expect, it } from "vitest";
import { mod360 } from "./kepler";
import { computeBodyStates } from "./state";

const J2000 = new Date("2000-01-01T12:00:00Z");

/** Sub-solar longitude invariant from doc 02 step D. */
function subSolarLongitude(orbitalAngleDeg: number, rotationAngleDeg: number): number {
  return mod360(orbitalAngleDeg + 180 - rotationAngleDeg);
}

describe("state", () => {
  it("9: Moon @ J2000 → 218.32; @ J2000 + one period → 218.32", async () => {
    const atJ2000 = (await computeBodyStates(J2000)).find((b) => b.id === "moon");
    expect(atJ2000?.orbitalAngleDeg).toBeCloseTo(218.32, 3);

    const oneperiod = new Date(J2000.getTime() + 27.3217 * 24 * 3600 * 1000);
    const atPeriod = (await computeBodyStates(oneperiod)).find((b) => b.id === "moon");
    expect(atPeriod?.orbitalAngleDeg).toBeCloseTo(218.32, 3);
  });

  it("10: Moon @ J2000 + 7 d → orbitalAngleDeg ≈ 310.554", async () => {
    const date = new Date(J2000.getTime() + 7 * 24 * 3600 * 1000);
    const moon = (await computeBodyStates(date)).find((b) => b.id === "moon");
    expect(moon?.orbitalAngleDeg).toBeCloseTo(310.554, 2);
  });

  it("10b: Pluto (dwarf planet, Formula C) @ J2000 → 238.93; @ J2000 + one period → 238.93", async () => {
    const atJ2000 = (await computeBodyStates(J2000)).find((b) => b.id === "pluto");
    expect(atJ2000?.type).toBe("dwarfPlanet");
    expect(atJ2000?.orbitalAngleDeg).toBeCloseTo(238.93, 3);

    const onePeriod = new Date(J2000.getTime() + 90560 * 24 * 3600 * 1000);
    const atPeriod = (await computeBodyStates(onePeriod)).find((b) => b.id === "pluto");
    expect(atPeriod?.orbitalAngleDeg).toBeCloseTo(238.93, 3);
  });

  it("11: Earth rotation @ J2000 → 280.461 (GMST anchor); @ J2000 + 48 h → 282.432", async () => {
    const earth0 = (await computeBodyStates(J2000)).find((b) => b.id === "earth");
    expect(earth0?.rotationAngleDeg).toBeCloseTo(280.461, 2);

    const date48 = new Date(J2000.getTime() + 48 * 3600 * 1000);
    const earth48 = (await computeBodyStates(date48)).find((b) => b.id === "earth");
    expect(earth48?.rotationAngleDeg).toBeCloseTo(282.432, 2);
  });

  it("11b: Earth sub-solar longitude tracks UTC time (terminator anchoring)", async () => {
    const noon = (await computeBodyStates(new Date("2026-06-11T12:00:00Z"))).find(
      (b) => b.id === "earth",
    )!;
    expect(
      subSolarLongitude(noon.orbitalAngleDeg!, noon.rotationAngleDeg),
    ).toBeCloseTo(0.74, 1);

    const midnight = (await computeBodyStates(new Date("2026-06-11T00:00:00Z"))).find(
      (b) => b.id === "earth",
    )!;
    expect(
      subSolarLongitude(midnight.orbitalAngleDeg!, midnight.rotationAngleDeg),
    ).toBeCloseTo(180.75, 1);
  });
});
