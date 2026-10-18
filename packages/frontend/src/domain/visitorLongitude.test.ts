import { afterEach, describe, expect, it, vi } from "vitest";
import { visitorLongitudeDeg } from "./visitorLongitude";

describe("visitorLongitudeDeg", () => {
  afterEach(() => vi.restoreAllMocks());

  it("UTC+2 (getTimezoneOffset=-120) → +30°", () => {
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-120);
    expect(visitorLongitudeDeg()).toBeCloseTo(30, 5);
  });

  it("UTC-5 (getTimezoneOffset=300) → -75°", () => {
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(300);
    expect(visitorLongitudeDeg()).toBeCloseTo(-75, 5);
  });

  it("UTC (getTimezoneOffset=0) → 0°", () => {
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(0);
    expect(visitorLongitudeDeg()).toBeCloseTo(0, 5);
  });
});
