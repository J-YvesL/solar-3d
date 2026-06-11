import { keplerianElements, type PlanetId } from "../data/keplerianElements";
import { julianCenturiesSinceJ2000 } from "./julian";

/** Normalize degrees to [0, 360). Works correctly for negative inputs. */
export function mod360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * Solve Kepler's equation E − e·sin(E) = Mr using Newton–Raphson (5 iterations).
 * Input Mr and output E are in radians. 5 iterations converge to machine precision for e < 0.21.
 */
export function solveKepler(Mr: number, e: number): number {
  let E = Mr;
  for (let i = 0; i < 5; i++) {
    E = E - (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
  }
  return E;
}

/**
 * True anomaly from eccentric anomaly E and eccentricity e.
 * Input E and output ν are in radians.
 */
export function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

/**
 * Orbital angle in degrees [0, 360) for a planet at the given date.
 * Uses JPL Table 1 Keplerian elements (doc 03).
 * Approximation: ϖ + ν gives heliocentric ecliptic longitude only for zero inclination;
 * planet inclinations ≤ 7° make this acceptable for the circular-orbit frontend display.
 */
export function planetOrbitalAngle(planetId: PlanetId, date: Date): number {
  const T = julianCenturiesSinceJ2000(date);
  const el = keplerianElements[planetId];

  // Step 1: propagate elements
  const e = el.e0 + el.eDot * T;
  const L = el.L0 + el.LDot * T; // mean longitude (deg)
  const w = el.w0 + el.wDot * T; // longitude of perihelion ϖ (deg)

  // Step 2: mean anomaly (deg), normalized to [0, 360)
  const M = mod360(L - w);

  // Step 3: solve Kepler's equation in radians
  const Mr = M * (Math.PI / 180);
  const E = solveKepler(Mr, e);

  // Step 4: true anomaly (radians)
  const nu = trueAnomaly(E, e);

  // Step 5: orbital angle (deg)
  return mod360(w + nu * (180 / Math.PI));
}
