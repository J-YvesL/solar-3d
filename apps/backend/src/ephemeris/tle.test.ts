import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseTle,
  deriveCircularElements,
  getIssTle,
  raanRateDegPerDay,
  resetTleCache,
} from "./tle";
import { SNAPSHOT_LINE1, SNAPSHOT_LINE2 } from "../data/issTle";

// Reference TLE from doc 02 step E (used for expected-value tests)
const REF_LINE1 =
  "1 25544U 98067A   24001.50000000  .00016717  00000-0  30571-3 0  9991";
const REF_LINE2 =
  "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49512571429723";

// A distinct TLE so a test can prove it came from the wheretheiss.at fallback.
const FALLBACK_LINE1 =
  "1 25544U 98067A   26100.00000000  .00000000  00000+0  00000+0 0  9990";
const FALLBACK_LINE2 =
  "2 25544  52.0000 100.0000 0001000  90.0000  90.0000 15.50000000000000";

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

  it("the committed snapshot parses to a plausible ISS orbit", () => {
    const tle = parseTle(SNAPSHOT_LINE1, SNAPSHOT_LINE2);
    expect(tle.inclination).toBeCloseTo(51.6, 1); // ISS inclination band
    expect(tle.meanMotion).toBeGreaterThan(15);
    expect(tle.meanMotion).toBeLessThan(16);
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

describe("raanRateDegPerDay — J2 nodal regression", () => {
  it("reference TLE regresses ≈ −4.96 °/day", () => {
    const tle = parseTle(REF_LINE1, REF_LINE2);
    const { semiMajorAxisKm } = deriveCircularElements(tle);
    expect(raanRateDegPerDay(tle, semiMajorAxisKm)).toBeCloseTo(-4.96, 1);
  });
});

describe("getIssTle — fetch fallback chain", () => {
  it("falls back to wheretheiss.at when CelesTrak fails", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      if (String(url).includes("celestrak")) {
        return { ok: false, status: 403 } as Response;
      }
      return {
        ok: true,
        json: async () => ({ line1: FALLBACK_LINE1, line2: FALLBACK_LINE2 }),
      } as Response;
    });
    const tle = await getIssTle();
    expect(tle.inclination).toBeCloseTo(52.0, 3); // proves the fallback TLE was used
  });

  it("returns the committed snapshot when both sources fail", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    const tle = await getIssTle();
    expect(tle.inclination).toBeCloseTo(51.6, 1);
    expect(tle.meanMotion).toBeGreaterThan(15);
  });

  it("returns the committed snapshot when CelesTrak is non-ok and the fallback is malformed", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      if (String(url).includes("celestrak")) {
        return { ok: false, status: 503 } as Response;
      }
      return { ok: true, json: async () => ({ foo: "bar" }) } as Response; // missing line1/line2
    });
    const tle = await getIssTle();
    expect(tle.inclination).toBeCloseTo(51.6, 1);
  });

  it("offline mode never calls fetch — serves the committed snapshot", async () => {
    process.env["ISS_TLE_OFFLINE"] = "1";
    try {
      const fetchSpy = vi.fn(() => Promise.reject(new Error("should not fetch")));
      const tle = await getIssTle(fetchSpy as unknown as typeof globalThis.fetch);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(tle.inclination).toBeCloseTo(51.6, 1);
    } finally {
      delete process.env["ISS_TLE_OFFLINE"];
    }
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
