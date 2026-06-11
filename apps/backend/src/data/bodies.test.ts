import { describe, expect, it } from "vitest";
import { BODIES } from "./bodies";
import { bodyInfo } from "./bodyInfo";

describe("bodies data", () => {
  it("12: exactly 29 bodies, unique ids, correct type counts", () => {
    expect(BODIES).toHaveLength(29);
    const ids = BODIES.map((b) => b.id);
    expect(new Set(ids).size).toBe(29);
    expect(BODIES.filter((b) => b.type === "star")).toHaveLength(1);
    expect(BODIES.filter((b) => b.type === "planet")).toHaveLength(8);
    expect(BODIES.filter((b) => b.type === "moon")).toHaveLength(20);
  });

  it("13: parent links valid, moon counts per planet correct", () => {
    const idSet = new Set(BODIES.map((b) => b.id));
    for (const body of BODIES) {
      if (body.parentId !== null) {
        expect(idSet.has(body.parentId), `${body.id}.parentId="${body.parentId}" not found`).toBe(
          true,
        );
      }
    }
    const moonCounts: Record<string, number> = {};
    for (const body of BODIES.filter((b) => b.type === "moon")) {
      const parent = body.parentId ?? "none";
      const current = moonCounts[parent];
      moonCounts[parent] = (current ?? 0) + 1;
    }
    expect(moonCounts["earth"]).toBe(1);
    expect(moonCounts["mars"]).toBe(2);
    expect(moonCounts["jupiter"]).toBe(4);
    expect(moonCounts["saturn"]).toBe(7);
    expect(moonCounts["uranus"]).toBe(5);
    expect(moonCounts["neptune"]).toBe(1);
  });

  it("14: every body has info entry, colors match #RRGGBB format", () => {
    const colorRegex = /^#[0-9A-F]{6}$/i;
    for (const body of BODIES) {
      expect(bodyInfo[body.id], `missing info for ${body.id}`).toBeDefined();
      expect(
        colorRegex.test(body.color),
        `invalid color for ${body.id}: ${body.color}`,
      ).toBe(true);
    }
  });

  it("14b: every body has rotationAtJ2000Deg in [0, 360)", () => {
    for (const body of BODIES) {
      expect(
        body.rotationAtJ2000Deg >= 0 && body.rotationAtJ2000Deg < 360,
        `rotationAtJ2000Deg out of range for ${body.id}: ${body.rotationAtJ2000Deg}`,
      ).toBe(true);
    }
  });

  it("14c: every body has poleEclipticLonDeg in [0, 360), Table 6 spot checks", () => {
    const byId = new Map(BODIES.map((b) => [b.id, b]));
    for (const body of BODIES) {
      expect(
        body.poleEclipticLonDeg >= 0 && body.poleEclipticLonDeg < 360,
        `poleEclipticLonDeg out of range for ${body.id}: ${body.poleEclipticLonDeg}`,
      ).toBe(true);
    }
    expect(byId.get("earth")?.poleEclipticLonDeg).toBe(90);
    expect(byId.get("venus")?.poleEclipticLonDeg).toBe(210.19);
    expect(byId.get("uranus")?.poleEclipticLonDeg).toBe(77.65);
    for (const moon of BODIES.filter((b) => b.type === "moon")) {
      expect(moon.poleEclipticLonDeg, `poleEclipticLonDeg must be 0 for ${moon.id}`).toBe(0);
    }
  });
});
