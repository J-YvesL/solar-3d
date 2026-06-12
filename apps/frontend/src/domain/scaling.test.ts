import { describe, expect, it } from "vitest";
import { displayRadius, orbitDisplayRadius, moonOrbitDisplayRadius, DISPLAY_SIZE_FACTOR } from "./scaling";

describe("displayRadius", () => {
  it("sun → 12", () => expect(displayRadius(695700, "star")).toBe(12));
  it("mercury → 1.70", () => expect(displayRadius(2439.7, "planet")).toBeCloseTo(1.70, 2));
  it("venus → 2.45", () => expect(displayRadius(6051.8, "planet")).toBeCloseTo(2.45, 2));
  it("earth → 2.50", () => expect(displayRadius(6371.0, "planet")).toBeCloseTo(2.50, 2));
  it("mars → 1.94", () => expect(displayRadius(3389.5, "planet")).toBeCloseTo(1.94, 2));
  it("jupiter → 6.52", () => expect(displayRadius(69911, "planet")).toBeCloseTo(6.52, 2));
  it("saturn → 6.06", () => expect(displayRadius(58232, "planet")).toBeCloseTo(6.06, 2));
  it("uranus → 4.34", () => expect(displayRadius(25362, "planet")).toBeCloseTo(4.34, 2));
  it("neptune → 4.29", () => expect(displayRadius(24622, "planet")).toBeCloseTo(4.29, 2));
  it("moon without id → 1.49 (no factor)", () => expect(displayRadius(1737.4, "moon")).toBeCloseTo(1.49, 2));
  it("moon with id → 0.74 (DISPLAY_SIZE_FACTOR 0.5)", () => expect(displayRadius(1737.4, "moon", "moon")).toBeCloseTo(0.74, 2));
  it("DISPLAY_SIZE_FACTOR moon = 0.5", () => expect(DISPLAY_SIZE_FACTOR["moon"]).toBe(0.5));
  it("ganymede → 1.76", () => expect(displayRadius(2634.1, "moon")).toBeCloseTo(1.76, 2));
  it("titan → 1.74", () => expect(displayRadius(2574.7, "moon")).toBeCloseTo(1.74, 2));
  it("triton → 1.35", () => expect(displayRadius(1353.4, "moon")).toBeCloseTo(1.35, 2));
  it("mimas → 0.62", () => expect(displayRadius(198.2, "moon")).toBeCloseTo(0.62, 2));
  it("phobos clamped to 0.45", () => expect(displayRadius(11.1, "moon")).toBe(0.45));
  it("deimos clamped to 0.45", () => expect(displayRadius(6.2, "moon")).toBe(0.45));
});

// orbitDisplayRadius is a unit test of the math; inputs are Table 1 au values (doc 03)
// since the doc 05 expected results were derived from those.
describe("orbitDisplayRadius", () => {
  it("mercury → 35.0", () => expect(orbitDisplayRadius(0.38709927)).toBeCloseTo(35.0, 1));
  it("venus → 81.2", () => expect(orbitDisplayRadius(0.72333566)).toBeCloseTo(81.2, 1));
  it("earth → 105.1", () => expect(orbitDisplayRadius(1.00000261)).toBeCloseTo(105.1, 1));
  it("mars → 136.2", () => expect(orbitDisplayRadius(1.52371034)).toBeCloseTo(136.2, 1));
  it("jupiter → 226.8", () => expect(orbitDisplayRadius(5.20288700)).toBeCloseTo(226.8, 1));
  it("saturn → 271.6", () => expect(orbitDisplayRadius(9.53667594)).toBeCloseTo(271.6, 1));
  it("uranus → 323.2", () => expect(orbitDisplayRadius(19.18916464)).toBeCloseTo(323.2, 1));
  it("neptune → 356.4", () => expect(orbitDisplayRadius(30.06992276)).toBeCloseTo(356.4, 1));
});

describe("moonOrbitDisplayRadius — Jupiter moons (parent displayRadius ≈ 6.52)", () => {
  const parent = 6.52;
  it("io (index 0) → 14.3", () => expect(moonOrbitDisplayRadius(parent, 0)).toBeCloseTo(14.3, 1));
  it("europa (index 1) → 21.5", () => expect(moonOrbitDisplayRadius(parent, 1)).toBeCloseTo(21.5, 1));
  it("ganymede (index 2) → 28.7", () => expect(moonOrbitDisplayRadius(parent, 2)).toBeCloseTo(28.7, 1));
  it("callisto (index 3) → 35.9", () => expect(moonOrbitDisplayRadius(parent, 3)).toBeCloseTo(35.9, 1));
});
