export type BodyType = "star" | "planet" | "moon";

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
  color: string;
  // orbit (null for the sun)
  semiMajorAxisKm: number | null;
  eccentricity: number | null;
  inclinationDeg: number | null;
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
