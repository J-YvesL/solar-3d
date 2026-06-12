import type { BodyType } from "@solar/shared";

export const EARTH_RADIUS_KM = 6371;
export const MERCURY_SMA_AU = 0.38709927;

export const DISPLAY_SIZE_FACTOR: Record<string, number> = { moon: 0.5 };

export function displayRadius(radiusKm: number, type: BodyType, id?: string): number {
  if (type === "star") return 12;
  const base = Math.max(2.5 * Math.pow(radiusKm / EARTH_RADIUS_KM, 0.4), 0.45);
  return base * (id !== undefined ? (DISPLAY_SIZE_FACTOR[id] ?? 1) : 1);
}

/**
 * Scaled orbit radius for a planet.
 * @param semiMajorAxisAu Semi-major axis in astronomical units.
 * Log scale anchored on Mercury at 35 units.
 */
export function orbitDisplayRadius(semiMajorAxisAu: number): number {
  return 35 + 170 * Math.log10(semiMajorAxisAu / MERCURY_SMA_AU);
}

/**
 * Scaled orbit radius for a moon in focused view.
 * @param parentDisplayRadius Display radius of the parent planet.
 * @param index Rank of the moon ordered by real semiMajorAxisKm (0 = innermost).
 * S23: only type === "moon" bodies contribute to this ranking; satellites are excluded
 * so the ISS (a = 6 791 km) doesn't steal index 0 from the Moon (a = 384 400 km).
 */
export function moonOrbitDisplayRadius(parentDisplayRadius: number, index: number): number {
  return parentDisplayRadius * (2.2 + index * 1.1);
}

/**
 * Scaled orbit radius for a satellite in focused view (S23).
 * Low orbit hugging the parent, below every moon.
 * Earth: 2.5 × 1.4 = 3.5 units.
 */
export function satelliteOrbitDisplayRadius(parentDisplayRadius: number): number {
  return parentDisplayRadius * 1.4;
}
