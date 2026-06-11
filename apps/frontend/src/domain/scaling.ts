import type { BodyType } from "@solar/shared";

export const EARTH_RADIUS_KM = 6371;
export const MERCURY_SMA_AU = 0.38709927;

/**
 * Scaled display radius for a body mesh.
 * Power-law compresses the range; proportions remain visible.
 */
export function displayRadius(radiusKm: number, type: BodyType): number {
  if (type === "star") return 12;
  return Math.max(2.5 * Math.pow(radiusKm / EARTH_RADIUS_KM, 0.4), 0.45);
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
 */
export function moonOrbitDisplayRadius(parentDisplayRadius: number, index: number): number {
  return parentDisplayRadius * (2.2 + index * 1.1);
}
