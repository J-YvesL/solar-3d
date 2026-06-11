/** Planet ids — only bodies with Keplerian elements. */
export type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

/** One row of JPL Table 1 (value at J2000 + rate per Julian century). All angles in degrees, distances in au. */
export interface KeplerianRow {
  /** Semi-major axis at J2000 (au) */
  a0: number;
  /** Semi-major axis rate (au/century) */
  aDot: number;
  /** Eccentricity at J2000 */
  e0: number;
  /** Eccentricity rate (/century) */
  eDot: number;
  /** Inclination at J2000 (deg) */
  i0: number;
  /** Inclination rate (deg/century) */
  iDot: number;
  /** Mean longitude at J2000 (deg) */
  L0: number;
  /** Mean longitude rate (deg/century) */
  LDot: number;
  /** Longitude of perihelion at J2000 (deg) */
  w0: number;
  /** Longitude of perihelion rate (deg/century) */
  wDot: number;
  /** Longitude of ascending node at J2000 (deg) */
  o0: number;
  /** Longitude of ascending node rate (deg/century) */
  oDot: number;
}

/** JPL "Approximate Positions of the Planets" Table 1, valid 1800–2050, mean ecliptic and equinox of J2000. */
export const keplerianElements: Record<PlanetId, KeplerianRow> = {
  mercury: {
    a0: 0.38709927, aDot: 0.00000037,
    e0: 0.20563593, eDot: 0.00001906,
    i0: 7.00497902, iDot: -0.00594749,
    L0: 252.25032350, LDot: 149472.67411175,
    w0: 77.45779628, wDot: 0.16047689,
    o0: 48.33076593, oDot: -0.12534081,
  },
  venus: {
    a0: 0.72333566, aDot: 0.00000390,
    e0: 0.00677672, eDot: -0.00004107,
    i0: 3.39467605, iDot: -0.00078890,
    L0: 181.97909950, LDot: 58517.81538729,
    w0: 131.60246718, wDot: 0.00268329,
    o0: 76.67984255, oDot: -0.27769418,
  },
  earth: {
    a0: 1.00000261, aDot: 0.00000562,
    e0: 0.01671123, eDot: -0.00004392,
    i0: -0.00001531, iDot: -0.01294668,
    L0: 100.46457166, LDot: 35999.37244981,
    w0: 102.93768193, wDot: 0.32327364,
    o0: 0.0, oDot: 0.0,
  },
  mars: {
    a0: 1.52371034, aDot: 0.00001847,
    e0: 0.09339410, eDot: 0.00007882,
    i0: 1.84969142, iDot: -0.00813131,
    L0: -4.55343205, LDot: 19140.30268499,
    w0: -23.94362959, wDot: 0.44441088,
    o0: 49.55953891, oDot: -0.29257343,
  },
  jupiter: {
    a0: 5.20288700, aDot: -0.00011607,
    e0: 0.04838624, eDot: -0.00013253,
    i0: 1.30439695, iDot: -0.00183714,
    L0: 34.39644051, LDot: 3034.74612775,
    w0: 14.72847983, wDot: 0.21252668,
    o0: 100.47390909, oDot: 0.20469106,
  },
  saturn: {
    a0: 9.53667594, aDot: -0.00125060,
    e0: 0.05386179, eDot: -0.00050991,
    i0: 2.48599187, iDot: 0.00193609,
    L0: 49.95424423, LDot: 1222.49362201,
    w0: 92.59887831, wDot: -0.41897216,
    o0: 113.66242448, oDot: -0.28867794,
  },
  uranus: {
    a0: 19.18916464, aDot: -0.00196176,
    e0: 0.04725744, eDot: -0.00004397,
    i0: 0.77263783, iDot: -0.00242939,
    L0: 313.23810451, LDot: 428.48202785,
    w0: 170.95427630, wDot: 0.40805281,
    o0: 74.01692503, oDot: 0.04240589,
  },
  neptune: {
    a0: 30.06992276, aDot: 0.00026291,
    e0: 0.00859048, eDot: 0.00005105,
    i0: 1.77004347, iDot: 0.00035372,
    L0: -55.12002969, LDot: 218.45945325,
    w0: 44.96476227, wDot: -0.32241464,
    o0: 131.78422574, oDot: -0.00508664,
  },
};
