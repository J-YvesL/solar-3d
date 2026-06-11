import { describe, expect, it } from "vitest";
import { SimulationClock, SIM_DAYS_PER_REAL_SECOND_SYSTEM } from "./simulationClock";

const RATE = SIM_DAYS_PER_REAL_SECOND_SYSTEM; // 1/86400

describe("SimulationClock", () => {
  it("tick accumulates simDays correctly", () => {
    const clock = new SimulationClock(RATE);
    expect(clock.simDaysSinceEpoch).toBe(0);
    clock.tick(1);
    expect(clock.simDaysSinceEpoch).toBeCloseTo(RATE, 15);
    clock.tick(1);
    clock.tick(1);
    expect(clock.simDaysSinceEpoch).toBeCloseTo(3 * RATE, 15);
  });

  it("tick with fractional seconds", () => {
    const clock = new SimulationClock(RATE);
    clock.tick(0.016); // ~60 fps frame
    expect(clock.simDaysSinceEpoch).toBeCloseTo(0.016 * RATE, 15);
  });

  it("rate change keeps accumulated simDays (no jump)", () => {
    const clock = new SimulationClock(2);
    clock.tick(5); // 5 * 2 = 10 simDays
    expect(clock.simDaysSinceEpoch).toBeCloseTo(10, 10);

    clock.setRate(0.05);
    // simDays must not jump
    expect(clock.simDaysSinceEpoch).toBeCloseTo(10, 10);

    clock.tick(5); // 5 * 0.05 = 0.25 more
    expect(clock.simDaysSinceEpoch).toBeCloseTo(10.25, 10);
  });
});
