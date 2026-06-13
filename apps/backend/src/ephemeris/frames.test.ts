import { describe, expect, it } from "vitest";
import { equatorialToEcliptic } from "./frames";

const EPS = 23.44;

describe("equatorialToEcliptic", () => {
  it("Ω = 0: orbit plane tilts by exactly the obliquity, node and u unchanged", () => {
    const r = equatorialToEcliptic(51.6416, 0, 95.565, EPS);
    expect(r.inclinationDeg).toBeCloseTo(51.6416 - EPS, 4);
    expect(r.nodeLonDeg).toBeCloseTo(0, 4);
    expect(r.argLatDeg).toBeCloseTo(95.565, 4); // δ = 0
  });

  it("equatorial orbit (i = 0): becomes the ecliptic-vs-equator plane, node at 180°", () => {
    const r = equatorialToEcliptic(0, 0, 40, EPS);
    expect(r.inclinationDeg).toBeCloseTo(EPS, 4);
    expect(r.nodeLonDeg).toBeCloseTo(180, 4);
  });

  it("reference TLE (i = 51.6416, Ω = 247.4627): ecliptic inclination ≈ 63.26°", () => {
    // cos i′ = sin i·cos Ω·sin ε + cos i·cos ε
    const i = 51.6416,
      O = 247.4627;
    const d = Math.PI / 180;
    const cosIp =
      Math.sin(i * d) * Math.cos(O * d) * Math.sin(EPS * d) +
      Math.cos(i * d) * Math.cos(EPS * d);
    const expectedIp = (Math.acos(cosIp) * 180) / Math.PI;
    const r = equatorialToEcliptic(i, O, 0, EPS);
    expect(r.inclinationDeg).toBeCloseTo(expectedIp, 3);
    expect(expectedIp).toBeCloseTo(63.26, 1);
  });

  it("returns all angles in [0, 360)", () => {
    const r = equatorialToEcliptic(51.63, 326.58, 350, EPS);
    expect(r.nodeLonDeg).toBeGreaterThanOrEqual(0);
    expect(r.nodeLonDeg).toBeLessThan(360);
    expect(r.argLatDeg).toBeGreaterThanOrEqual(0);
    expect(r.argLatDeg).toBeLessThan(360);
  });
});
