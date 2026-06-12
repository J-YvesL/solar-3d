import { afterEach, describe, expect, it, vi } from "vitest";
import { parseTle, deriveCircularElements, getIssTle, resetTleCache } from "./tle";
import { SNAPSHOT_LINE1, SNAPSHOT_LINE2 } from "../data/issTle";

// Reference TLE from doc 02 step E (used for expected-value tests)
const REF_LINE1 =
  "1 25544U 98067A   24001.50000000  .00016717  00000-0  30571-3 0  9991";
const REF_LINE2 =
  "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49512571429723";

afterEach(() => {
  resetTleCache();
  vi.unstubAllGlobals();
});

describe("parseTle — test 22", () => {
  it("parses all fields from the reference TLE", () => {
    const tle = parseTle(REF_LINE1, REF_LINE2);
    expect(tle.epochDate.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(tle.inclination).toBeCloseTo(51.6416, 4);
    expect(tle.raan).toBeCloseTo(247.4627, 4);
    expect(tle.eccentricity).toBeCloseTo(0.0006703, 7);
    expect(tle.argPerigee).toBeCloseTo(130.5360, 4);
    expect(tle.meanAnomaly).toBeCloseTo(325.0288, 4);
    expect(tle.meanMotion).toBeCloseTo(15.49512571, 5);
  });

  it("snapshot lines parse identically (same reference TLE)", () => {
    const tle = parseTle(SNAPSHOT_LINE1, SNAPSHOT_LINE2);
    expect(tle.inclination).toBeCloseTo(51.6416, 4);
    expect(tle.meanMotion).toBeCloseTo(15.49512571, 5);
  });
});

describe("deriveCircularElements — test 23", () => {
  it("derives period, semi-major axis and u0 from the reference TLE", () => {
    const tle = parseTle(REF_LINE1, REF_LINE2);
    const { orbitalPeriodDays, semiMajorAxisKm, u0 } = deriveCircularElements(tle);
    expect(orbitalPeriodDays).toBeCloseTo(0.06454, 4);
    expect(semiMajorAxisKm).toBeCloseTo(6796, 0);
    expect(u0).toBeCloseTo(95.565, 2);
  });
});

describe("getIssTle — test 25 (offline fallback)", () => {
  it("returns the committed snapshot when the fetch fails", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    const tle = await getIssTle();
    expect(tle.inclination).toBeCloseTo(51.6416, 3);
    expect(tle.meanMotion).toBeGreaterThan(15);
  });

  it("returns the committed snapshot for a non-ok response", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 503 } as Response));
    const tle = await getIssTle();
    expect(tle.inclination).toBeCloseTo(51.6416, 3);
  });

  it("serves cached tle on repeated calls within TTL", async () => {
    let callCount = 0;
    vi.stubGlobal("fetch", async () => {
      callCount++;
      return {
        ok: true,
        text: async () => `ISS\n${REF_LINE1}\n${REF_LINE2}`,
      } as Response;
    });
    await getIssTle();
    await getIssTle();
    expect(callCount).toBe(1);
  });
});
