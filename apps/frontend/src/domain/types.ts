import type { BodyDto } from "@solar/shared";

export type ViewMode = "system" | "focused";

export interface Body extends BodyDto {
  /** Scaled display radius for Three.js scene (doc 05). */
  displayRadius: number;
  /** Scaled orbit radius for Three.js scene (doc 05). Null for the sun. */
  orbitDisplayRadius: number | null;
}
