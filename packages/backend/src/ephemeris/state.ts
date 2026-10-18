import type { BodyDto } from "@solar/shared";
import { BODIES } from "../data/bodies";
import { bodyInfo } from "../data/bodyInfo";
import { type PlanetId } from "../data/keplerianElements";
import { daysSinceJ2000 } from "./julian";
import { equatorialToEcliptic } from "./frames";
import { mod360, planetOrbitalAngle } from "./kepler";
import { deriveCircularElements, getIssTle, raanRateDegPerDay } from "./tle";

// Earth's obliquity (doc 03 Table — Earth axialTiltDeg): the equatorial→ecliptic
// rotation angle used to place the ISS orbit plane in the scene's ecliptic frame.
const EARTH_OBLIQUITY_DEG = 23.44;

/** Assemble the full BodyDto array for 32 bodies at the given date. */
export async function computeBodyStates(date: Date): Promise<BodyDto[]> {
  const deltaDays = daysSinceJ2000(date);

  // 31 non-satellite bodies from the static BODIES table
  const regularBodies: BodyDto[] = BODIES.filter((b) => b.type !== "satellite").map(
    (body): BodyDto => {
      let orbitalAngleDeg: number | null = null;

      if (body.type === "planet") {
        orbitalAngleDeg = planetOrbitalAngle(body.id as PlanetId, date);
      } else if (body.type === "moon" || body.type === "dwarfPlanet") {
        // Formula C: circular uniform motion from doc 02. Pluto (dwarfPlanet, S28)
        // uses it too — its eccentricity (0.244) exceeds the Kepler solver's validity.
        const L0 = body.meanLongitudeAtJ2000Deg ?? 0;
        const period = body.orbitalPeriodDays ?? 1;
        orbitalAngleDeg = mod360(L0 + (360 * deltaDays) / period);
      }

      // Formula D: rotation angle — anchored to the real J2000 orientation (doc 03 Table 5)
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
        poleEclipticLonDeg: body.poleEclipticLonDeg,
        color: body.color,
        semiMajorAxisKm: body.semiMajorAxisKm,
        eccentricity: body.eccentricity,
        inclinationDeg: body.inclinationDeg,
        nodeLonDeg: null,
        orbitalPeriodDays: body.orbitalPeriodDays,
        orbitalAngleDeg,
        rotationAngleDeg,
        info,
      };
    },
  );

  // ISS: orbit from a live TLE (falls back to committed snapshot on any failure — doc 02 step E)
  const issTle = await getIssTle();
  const { orbitalPeriodDays, semiMajorAxisKm, u0 } = deriveCircularElements(issTle);
  const deltaFromTleEpoch =
    (date.getTime() - issTle.epochDate.getTime()) / 86_400_000;

  // Propagate the argument of latitude and the J2-precessing node from the TLE epoch,
  // then convert the equatorial elements to the scene's ecliptic frame (doc 02 step E).
  const argLatEquatorial = u0 + 360 * issTle.meanMotion * deltaFromTleEpoch;
  const raanEquatorial =
    issTle.raan + raanRateDegPerDay(issTle, semiMajorAxisKm) * deltaFromTleEpoch;
  const ecliptic = equatorialToEcliptic(
    issTle.inclination,
    raanEquatorial,
    argLatEquatorial,
    EARTH_OBLIQUITY_DEG,
  );

  const orbitalAngleDeg = ecliptic.argLatDeg;
  const rotationAngleDeg = orbitalAngleDeg; // LVLH: same face toward Earth
  const rotationPeriodHours = orbitalPeriodDays * 24;

  const issStatic = BODIES.find((b) => b.id === "iss");
  if (issStatic === undefined) throw new Error("ISS static body missing from BODIES");
  const issInfo = bodyInfo["iss"];
  if (issInfo === undefined) throw new Error("Missing info for body: iss");

  const issDto: BodyDto = {
    id: "iss",
    name: issStatic.name,
    type: "satellite",
    parentId: issStatic.parentId,
    radiusKm: issStatic.radiusKm,
    rotationPeriodHours,
    axialTiltDeg: 0,
    poleEclipticLonDeg: 0,
    color: issStatic.color,
    semiMajorAxisKm,
    eccentricity: 0,
    inclinationDeg: ecliptic.inclinationDeg,
    nodeLonDeg: ecliptic.nodeLonDeg,
    orbitalPeriodDays,
    orbitalAngleDeg,
    rotationAngleDeg,
    info: issInfo,
  };

  return [...regularBodies, issDto];
}
