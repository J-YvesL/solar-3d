export type BodyType = "star" | "planet" | "moon" | "satellite";

export interface BodyInfo {
  description: string;
  composition: string;
  funFact: string;
}

export interface BodyDto {
  id: string;
  name: string;
  type: BodyType;
  parentId: string | null;
  // physical
  radiusKm: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  poleEclipticLonDeg: number;
  color: string;
  // orbit (null for the sun)
  semiMajorAxisKm: number | null;
  eccentricity: number | null;
  inclinationDeg: number | null;
  nodeLonDeg: number | null;   // ascending-node longitude for satellites (from TLE); null for all other bodies
  orbitalPeriodDays: number | null;
  // state at epochIso
  orbitalAngleDeg: number | null;
  rotationAngleDeg: number;
  // panel content
  info: BodyInfo;
}

export interface BodiesResponse {
  epochIso: string;
  bodies: BodyDto[];
}
