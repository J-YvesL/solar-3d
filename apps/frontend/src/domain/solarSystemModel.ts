import type { Body } from "./types";

/** Normalize degrees to [0, 360). Works correctly for negative inputs. */
function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

export class SolarSystemModel {
  private readonly _bodies: readonly Body[];
  private readonly _byId: ReadonlyMap<string, Body>;
  readonly epochIso: string;

  constructor(bodies: Body[], epochIso: string) {
    this._bodies = bodies;
    this._byId = new Map(bodies.map((b) => [b.id, b]));
    this.epochIso = epochIso;
  }

  get bodies(): readonly Body[] {
    return this._bodies;
  }

  byId(id: string): Body | undefined {
    return this._byId.get(id);
  }

  /** Moons of the given body, ordered by semiMajorAxisKm ascending. */
  childrenOf(id: string): Body[] {
    return this._bodies
      .filter((b) => b.parentId === id)
      .sort((a, b) => (a.semiMajorAxisKm ?? 0) - (b.semiMajorAxisKm ?? 0));
  }

  /**
   * Angular state extrapolated to simDaysSinceEpoch days after the API epoch.
   * orbitalAngleDeg = (angle0 + 360 · simDays / orbitalPeriodDays) mod 360
   * rotationAngleDeg = (rot0 + 360 · simDays · 24 / rotationPeriodHours) mod 360
   */
  stateAt(
    id: string,
    simDaysSinceEpoch: number,
  ): { orbitalAngleDeg: number; rotationAngleDeg: number } {
    const body = this._byId.get(id);
    if (body === undefined) throw new Error(`Unknown body id: ${id}`);

    const angle0 = body.orbitalAngleDeg ?? 0;
    const period = body.orbitalPeriodDays;
    const orbitalAngleDeg =
      period !== null ? mod360(angle0 + (360 * simDaysSinceEpoch) / period) : 0;

    const rot0 = body.rotationAngleDeg;
    const rotationAngleDeg = mod360(
      rot0 + (360 * simDaysSinceEpoch * 24) / body.rotationPeriodHours,
    );

    return { orbitalAngleDeg, rotationAngleDeg };
  }
}
