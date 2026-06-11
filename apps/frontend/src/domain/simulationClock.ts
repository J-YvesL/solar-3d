// Real-time: 1 simulated day = 86 400 real seconds = 24 real hours
export const SIM_DAYS_PER_REAL_SECOND_SYSTEM = 1 / 86_400;
export const SIM_DAYS_PER_REAL_SECOND_FOCUSED = 1 / 86_400;

export class SimulationClock {
  private _simDays = 0;
  private _rate: number;

  constructor(daysPerRealSecond: number) {
    this._rate = daysPerRealSecond;
  }

  tick(realDeltaSeconds: number): void {
    this._simDays += this._rate * realDeltaSeconds;
  }

  /** Total simulated days elapsed since the API epoch. */
  get simDaysSinceEpoch(): number {
    return this._simDays;
  }

  /** Change the simulation rate without jumping the accumulated simDays. */
  setRate(daysPerRealSecond: number): void {
    this._rate = daysPerRealSecond;
  }
}
