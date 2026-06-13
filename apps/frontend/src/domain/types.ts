import type { BodyDto, BodyType } from "@solar/shared";

export type ViewMode = "system" | "focused";

/**
 * Planet-like bodies orbit the Sun, get a sun-anchored log orbit, can own moons,
 * appear in the nav bar and use planet-style camera framing. Pluto (a dwarf planet,
 * S28) behaves exactly like a planet everywhere except its info-panel type badge.
 */
export function isPlanetLike(type: BodyType): boolean {
  return type === "planet" || type === "dwarfPlanet";
}

export interface Body extends BodyDto {
  /** Scaled display radius for Three.js scene (doc 05). */
  displayRadius: number;
  /** Scaled orbit radius for Three.js scene (doc 05). Null for the sun. */
  orbitDisplayRadius: number | null;
}
