import type { BodiesResponse, BodyDto } from "@solar/shared";
import { displayRadius, orbitDisplayRadius, moonOrbitDisplayRadius } from "../domain/scaling";
import type { Locale } from "../domain/i18n/locale";
import type { Body } from "../domain/types";

const AU_KM = 149_597_870.7;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Fetches the current bodies snapshot from the API. Throws ApiError on non-OK response. */
export async function fetchBodies(lang: Locale): Promise<BodiesResponse> {
  const response = await fetch(`/api/bodies?lang=${lang}`);
  if (!response.ok) throw new ApiError(`HTTP ${response.status}`, response.status);
  return response.json() as Promise<BodiesResponse>;
}

/** Maps a raw BodiesResponse to Body[], adding displayRadius and orbitDisplayRadius. */
export function mapBodies(response: BodiesResponse): Body[] {
  const dtos = response.bodies;

  // Pre-compute display radii by id
  const displayRadiusById = new Map<string, number>();
  for (const dto of dtos) {
    displayRadiusById.set(dto.id, displayRadius(dto.radiusKm, dto.type, dto.id));
  }

  // Pre-compute moon ordering per parent (sorted by semiMajorAxisKm ascending = innermost first)
  const moonsByParent = new Map<string, BodyDto[]>();
  for (const dto of dtos) {
    if (dto.type === "moon" && dto.parentId !== null) {
      const group = moonsByParent.get(dto.parentId) ?? [];
      group.push(dto);
      moonsByParent.set(dto.parentId, group);
    }
  }
  for (const group of moonsByParent.values()) {
    group.sort((a, b) => (a.semiMajorAxisKm ?? 0) - (b.semiMajorAxisKm ?? 0));
  }
  const moonIndexById = new Map<string, number>();
  for (const group of moonsByParent.values()) {
    group.forEach((moon, i) => moonIndexById.set(moon.id, i));
  }

  return dtos.map((dto): Body => {
    const dr = displayRadiusById.get(dto.id) ?? displayRadius(dto.radiusKm, dto.type, dto.id);

    let orbitRadius: number | null = null;
    if (dto.type === "planet" && dto.semiMajorAxisKm !== null) {
      orbitRadius = orbitDisplayRadius(dto.semiMajorAxisKm / AU_KM);
    } else if (dto.type === "moon" && dto.parentId !== null) {
      const parentDr = displayRadiusById.get(dto.parentId) ?? 1;
      const idx = moonIndexById.get(dto.id) ?? 0;
      orbitRadius = moonOrbitDisplayRadius(parentDr, idx);
    }

    return { ...dto, displayRadius: dr, orbitDisplayRadius: orbitRadius };
  });
}
