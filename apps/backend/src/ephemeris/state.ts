import type { BodyDto } from "@solar/shared";
import { BODIES } from "../data/bodies";
import { bodyInfo } from "../data/bodyInfo";
import { type PlanetId } from "../data/keplerianElements";
import { daysSinceJ2000 } from "./julian";
import { mod360, planetOrbitalAngle } from "./kepler";

/** Assemble the full BodyDto array for 29 bodies at the given date. */
export function computeBodyStates(date: Date): BodyDto[] {
  const deltaDays = daysSinceJ2000(date);

  return BODIES.map((body): BodyDto => {
    let orbitalAngleDeg: number | null = null;

    if (body.type === "planet") {
      orbitalAngleDeg = planetOrbitalAngle(body.id as PlanetId, date);
    } else if (body.type === "moon") {
      // Formula C: circular uniform motion from doc 02
      const L0 = body.meanLongitudeAtJ2000Deg ?? 0;
      const period = body.orbitalPeriodDays ?? 1;
      orbitalAngleDeg = mod360(L0 + (360 * deltaDays) / period);
    }

    // Formula D: rotation angle — anchored to the real J2000 orientation (doc 03 Table 5)
    // so the day/night terminator is physically correct (doc 02 step D)
    const rotationAngleDeg = mod360(
      body.rotationAtJ2000Deg + (360 * deltaDays * 24) / body.rotationPeriodHours,
    );

    const info = bodyInfo[body.id];
    if (info === undefined) throw new Error(`Missing info for body: ${body.id}`);

    return {
      id: body.id,
      name: body.name,
      type: body.type,
      parentId: body.parentId,
      radiusKm: body.radiusKm,
      rotationPeriodHours: body.rotationPeriodHours,
      axialTiltDeg: body.axialTiltDeg,
      color: body.color,
      semiMajorAxisKm: body.semiMajorAxisKm,
      eccentricity: body.eccentricity,
      inclinationDeg: body.inclinationDeg,
      orbitalPeriodDays: body.orbitalPeriodDays,
      orbitalAngleDeg,
      rotationAngleDeg,
      info,
    };
  });
}
