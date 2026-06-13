import type { BodyType } from "@solar/shared";

export interface StaticBody {
  id: string;
  name: string;
  type: BodyType;
  parentId: string | null;
  radiusKm: number;
  /** Always > 0; retrograde spin encoded via axialTiltDeg > 90 (doc 03 conventions). */
  rotationPeriodHours: number;
  /** Rotation phase anchor at J2000 (doc 03 Table 5); 0 for the 20 unlisted moons. */
  rotationAtJ2000Deg: number;
  axialTiltDeg: number;
  /** Ecliptic longitude the spin pole leans toward (doc 03 Table 6); 0 for the 21 moons. */
  poleEclipticLonDeg: number;
  color: string;
  semiMajorAxisKm: number | null;
  /** 0 for moons (circular approximation); null for the sun. */
  eccentricity: number | null;
  /** vs ecliptic (planets) or parent orbit plane (moons); > 90 = retrograde orbit. Null for the sun. */
  inclinationDeg: number | null;
  orbitalPeriodDays: number | null;
  /** Starting orbital angle at J2000 (deg). Moons and Pluto (dwarf planet, Formula C); null for sun and planets. */
  meanLongitudeAtJ2000Deg: number | null;
}

/** All 32 bodies: sun, planets by distance, Pluto (dwarf planet), then moons grouped by parent, then the ISS. */
export const BODIES: StaticBody[] = [
  // ── Sun ──────────────────────────────────────────────────────────────────
  {
    id: "sun", name: "Sun", type: "star", parentId: null,
    radiusKm: 695700, rotationPeriodHours: 609.12, rotationAtJ2000Deg: 84.176, axialTiltDeg: 7.25,
    poleEclipticLonDeg: 345.77,
    color: "#FDB813",
    semiMajorAxisKm: null, eccentricity: null, inclinationDeg: null,
    orbitalPeriodDays: null, meanLongitudeAtJ2000Deg: null,
  },

  // ── Planets ───────────────────────────────────────────────────────────────
  // eccentricity and inclinationDeg from Table 1 J2000 values (doc 03 Table 2 notes).
  {
    id: "mercury", name: "Mercury", type: "planet", parentId: "sun",
    radiusKm: 2439.7, rotationPeriodHours: 1407.5075, rotationAtJ2000Deg: 339.511, axialTiltDeg: 0.03,
    poleEclipticLonDeg: 318.24,
    color: "#9F8E84",
    semiMajorAxisKm: 57909050, eccentricity: 0.20563593, inclinationDeg: 7.00497902,
    orbitalPeriodDays: 87.969, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "venus", name: "Venus", type: "planet", parentId: "sun",
    radiusKm: 6051.8, rotationPeriodHours: 5832.4436, rotationAtJ2000Deg: 337.525, axialTiltDeg: 177.36,
    poleEclipticLonDeg: 210.19,
    color: "#E6C89C",
    semiMajorAxisKm: 108208000, eccentricity: 0.00677672, inclinationDeg: 3.39467605,
    orbitalPeriodDays: 224.701, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "earth", name: "Earth", type: "planet", parentId: "sun",
    radiusKm: 6371.0, rotationPeriodHours: 23.934472, rotationAtJ2000Deg: 280.4606, axialTiltDeg: 23.44,
    poleEclipticLonDeg: 90.0,
    color: "#4F71BE",
    semiMajorAxisKm: 149598023, eccentricity: 0.01671123, inclinationDeg: -0.00001531,
    orbitalPeriodDays: 365.256, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "mars", name: "Mars", type: "planet", parentId: "sun",
    radiusKm: 3389.5, rotationPeriodHours: 24.622962, rotationAtJ2000Deg: 218.245, axialTiltDeg: 25.19,
    poleEclipticLonDeg: 352.91,
    color: "#C1572D",
    semiMajorAxisKm: 227939366, eccentricity: 0.09339410, inclinationDeg: 1.84969142,
    orbitalPeriodDays: 686.980, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "jupiter", name: "Jupiter", type: "planet", parentId: "sun",
    radiusKm: 69911, rotationPeriodHours: 9.924920, rotationAtJ2000Deg: 283.963, axialTiltDeg: 3.13,
    poleEclipticLonDeg: 247.82,
    color: "#C8A97E",
    semiMajorAxisKm: 778479000, eccentricity: 0.04838624, inclinationDeg: 1.30439695,
    orbitalPeriodDays: 4332.589, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "saturn", name: "Saturn", type: "planet", parentId: "sun",
    radiusKm: 58232, rotationPeriodHours: 10.656222, rotationAtJ2000Deg: 171.532, axialTiltDeg: 26.73,
    poleEclipticLonDeg: 79.53,
    color: "#E3D1A8",
    semiMajorAxisKm: 1433530000, eccentricity: 0.05386179, inclinationDeg: 2.48599187,
    orbitalPeriodDays: 10759.22, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "uranus", name: "Uranus", type: "planet", parentId: "sun",
    radiusKm: 25362, rotationPeriodHours: 17.240000, rotationAtJ2000Deg: 115.865, axialTiltDeg: 97.77,
    poleEclipticLonDeg: 77.65,
    color: "#9BD4D4",
    semiMajorAxisKm: 2870972000, eccentricity: 0.04725744, inclinationDeg: 0.77263783,
    orbitalPeriodDays: 30688.5, meanLongitudeAtJ2000Deg: null,
  },
  {
    id: "neptune", name: "Neptune", type: "planet", parentId: "sun",
    radiusKm: 24622, rotationPeriodHours: 15.966300, rotationAtJ2000Deg: 276.980, axialTiltDeg: 28.32,
    poleEclipticLonDeg: 319.24,
    color: "#4565D5",
    semiMajorAxisKm: 4500000000, eccentricity: 0.00859048, inclinationDeg: 1.77004347,
    orbitalPeriodDays: 60182, meanLongitudeAtJ2000Deg: null,
  },

  // ── Pluto (dwarf planet, S28) ─────────────────────────────────────────────
  // Positioned by Formula C (circular, like a moon) because e ≈ 0.244 exceeds the
  // Kepler solver's validity (e < 0.21); doc 03 Table 2b. meanLongitudeAtJ2000Deg
  // is a real J2000 mean longitude, not a placeholder.
  {
    id: "pluto", name: "Pluto", type: "dwarfPlanet", parentId: "sun",
    radiusKm: 1188.3, rotationPeriodHours: 153.2928, rotationAtJ2000Deg: 0, axialTiltDeg: 122.53,
    poleEclipticLonDeg: 317.35,
    color: "#D9C8A8",
    semiMajorAxisKm: 5906380000, eccentricity: 0.2444, inclinationDeg: 17.16,
    orbitalPeriodDays: 90560, meanLongitudeAtJ2000Deg: 238.93,
  },

  // ── Earth's moons ─────────────────────────────────────────────────────────
  {
    id: "moon", name: "Moon", type: "moon", parentId: "earth",
    radiusKm: 1737.4, rotationPeriodHours: 27.3217 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 38.194,
    color: "#B8B8B8",
    semiMajorAxisKm: 384400, eccentricity: 0, inclinationDeg: 5.145,
    orbitalPeriodDays: 27.3217, meanLongitudeAtJ2000Deg: 218.32,
  },

  // ── Mars's moons ──────────────────────────────────────────────────────────
  {
    id: "phobos", name: "Phobos", type: "moon", parentId: "mars",
    radiusKm: 11.1, rotationPeriodHours: 0.3189 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#8A7F72",
    semiMajorAxisKm: 9376, eccentricity: 0, inclinationDeg: 1.08,
    orbitalPeriodDays: 0.3189, meanLongitudeAtJ2000Deg: 12,
  },
  {
    id: "deimos", name: "Deimos", type: "moon", parentId: "mars",
    radiusKm: 6.2, rotationPeriodHours: 1.2624 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#9C9286",
    semiMajorAxisKm: 23463, eccentricity: 0, inclinationDeg: 1.79,
    orbitalPeriodDays: 1.2624, meanLongitudeAtJ2000Deg: 245,
  },

  // ── Jupiter's moons ───────────────────────────────────────────────────────
  {
    id: "io", name: "Io", type: "moon", parentId: "jupiter",
    radiusKm: 1821.6, rotationPeriodHours: 1.7691 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#E8D14C",
    semiMajorAxisKm: 421800, eccentricity: 0, inclinationDeg: 0.04,
    orbitalPeriodDays: 1.7691, meanLongitudeAtJ2000Deg: 78,
  },
  {
    id: "europa", name: "Europa", type: "moon", parentId: "jupiter",
    radiusKm: 1560.8, rotationPeriodHours: 3.5512 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#D8CDBE",
    semiMajorAxisKm: 671100, eccentricity: 0, inclinationDeg: 0.47,
    orbitalPeriodDays: 3.5512, meanLongitudeAtJ2000Deg: 152,
  },
  {
    id: "ganymede", name: "Ganymede", type: "moon", parentId: "jupiter",
    radiusKm: 2634.1, rotationPeriodHours: 7.1546 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#9C8E7E",
    semiMajorAxisKm: 1070400, eccentricity: 0, inclinationDeg: 0.18,
    orbitalPeriodDays: 7.1546, meanLongitudeAtJ2000Deg: 301,
  },
  {
    id: "callisto", name: "Callisto", type: "moon", parentId: "jupiter",
    radiusKm: 2410.3, rotationPeriodHours: 16.689 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#7A6F63",
    semiMajorAxisKm: 1882700, eccentricity: 0, inclinationDeg: 0.19,
    orbitalPeriodDays: 16.689, meanLongitudeAtJ2000Deg: 224,
  },

  // ── Saturn's moons ────────────────────────────────────────────────────────
  {
    id: "mimas", name: "Mimas", type: "moon", parentId: "saturn",
    radiusKm: 198.2, rotationPeriodHours: 0.9420 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#B4B0AA",
    semiMajorAxisKm: 185539, eccentricity: 0, inclinationDeg: 1.57,
    orbitalPeriodDays: 0.9420, meanLongitudeAtJ2000Deg: 35,
  },
  {
    id: "enceladus", name: "Enceladus", type: "moon", parentId: "saturn",
    radiusKm: 252.1, rotationPeriodHours: 1.3702 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#E8EAEA",
    semiMajorAxisKm: 237948, eccentricity: 0, inclinationDeg: 0.01,
    orbitalPeriodDays: 1.3702, meanLongitudeAtJ2000Deg: 98,
  },
  {
    id: "tethys", name: "Tethys", type: "moon", parentId: "saturn",
    radiusKm: 531.1, rotationPeriodHours: 1.8878 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#C9C5BD",
    semiMajorAxisKm: 294619, eccentricity: 0, inclinationDeg: 1.12,
    orbitalPeriodDays: 1.8878, meanLongitudeAtJ2000Deg: 167,
  },
  {
    id: "dione", name: "Dione", type: "moon", parentId: "saturn",
    radiusKm: 561.4, rotationPeriodHours: 2.7369 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#B9B4AC",
    semiMajorAxisKm: 377396, eccentricity: 0, inclinationDeg: 0.02,
    orbitalPeriodDays: 2.7369, meanLongitudeAtJ2000Deg: 233,
  },
  {
    id: "rhea", name: "Rhea", type: "moon", parentId: "saturn",
    radiusKm: 763.8, rotationPeriodHours: 4.5175 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#ABA69E",
    semiMajorAxisKm: 527108, eccentricity: 0, inclinationDeg: 0.35,
    orbitalPeriodDays: 4.5175, meanLongitudeAtJ2000Deg: 312,
  },
  {
    id: "titan", name: "Titan", type: "moon", parentId: "saturn",
    radiusKm: 2574.7, rotationPeriodHours: 15.9454 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#D8A33C",
    semiMajorAxisKm: 1221870, eccentricity: 0, inclinationDeg: 0.35,
    orbitalPeriodDays: 15.9454, meanLongitudeAtJ2000Deg: 56,
  },
  {
    id: "iapetus", name: "Iapetus", type: "moon", parentId: "saturn",
    radiusKm: 734.5, rotationPeriodHours: 79.3215 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#8F857A",
    semiMajorAxisKm: 3560820, eccentricity: 0, inclinationDeg: 15.47,
    orbitalPeriodDays: 79.3215, meanLongitudeAtJ2000Deg: 141,
  },

  // ── Uranus's moons ────────────────────────────────────────────────────────
  {
    id: "miranda", name: "Miranda", type: "moon", parentId: "uranus",
    radiusKm: 235.8, rotationPeriodHours: 1.4135 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#A9A49C",
    semiMajorAxisKm: 129390, eccentricity: 0, inclinationDeg: 4.23,
    orbitalPeriodDays: 1.4135, meanLongitudeAtJ2000Deg: 19,
  },
  {
    id: "ariel", name: "Ariel", type: "moon", parentId: "uranus",
    radiusKm: 578.9, rotationPeriodHours: 2.5204 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#B5B0A8",
    semiMajorAxisKm: 191020, eccentricity: 0, inclinationDeg: 0.26,
    orbitalPeriodDays: 2.5204, meanLongitudeAtJ2000Deg: 88,
  },
  {
    id: "umbriel", name: "Umbriel", type: "moon", parentId: "uranus",
    radiusKm: 584.7, rotationPeriodHours: 4.1442 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#6E6A64",
    semiMajorAxisKm: 266300, eccentricity: 0, inclinationDeg: 0.13,
    orbitalPeriodDays: 4.1442, meanLongitudeAtJ2000Deg: 203,
  },
  {
    id: "titania", name: "Titania", type: "moon", parentId: "uranus",
    radiusKm: 788.4, rotationPeriodHours: 8.7062 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#A89F94",
    semiMajorAxisKm: 435910, eccentricity: 0, inclinationDeg: 0.34,
    orbitalPeriodDays: 8.7062, meanLongitudeAtJ2000Deg: 274,
  },
  {
    id: "oberon", name: "Oberon", type: "moon", parentId: "uranus",
    radiusKm: 761.4, rotationPeriodHours: 13.4632 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#95897C",
    semiMajorAxisKm: 583520, eccentricity: 0, inclinationDeg: 0.06,
    orbitalPeriodDays: 13.4632, meanLongitudeAtJ2000Deg: 327,
  },

  // ── Neptune's moons ───────────────────────────────────────────────────────
  {
    id: "triton", name: "Triton", type: "moon", parentId: "neptune",
    radiusKm: 1353.4, rotationPeriodHours: 5.8770 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#C8C2D6",
    semiMajorAxisKm: 354759, eccentricity: 0, inclinationDeg: 157.0,
    orbitalPeriodDays: 5.8770, meanLongitudeAtJ2000Deg: 64,
  },

  // ── Pluto's moon (S28) ────────────────────────────────────────────────────
  // Charon: a normal moon record (parentId "pluto"); mutually tidally locked with
  // Pluto (rotationPeriodHours = 6.3872 × 24 = 153.2928, equal to Pluto's).
  {
    id: "charon", name: "Charon", type: "moon", parentId: "pluto",
    radiusKm: 606, rotationPeriodHours: 6.3872 * 24, axialTiltDeg: 0, poleEclipticLonDeg: 0, rotationAtJ2000Deg: 0,
    color: "#9C8E80",
    semiMajorAxisKm: 19591, eccentricity: 0, inclinationDeg: 0.0,
    orbitalPeriodDays: 6.3872, meanLongitudeAtJ2000Deg: 0,
  },

  // ── ISS (satellite, S23) ──────────────────────────────────────────────────
  // Orbit elements are TLE-derived at request time (doc 03 Table 7 / doc 02 step E).
  // rotationPeriodHours below is a placeholder; the real value is set from the TLE.
  {
    id: "iss", name: "ISS", type: "satellite", parentId: "earth",
    radiusKm: 0.055, rotationPeriodHours: 1.5483, rotationAtJ2000Deg: 0,
    axialTiltDeg: 0, poleEclipticLonDeg: 0,
    color: "#C9D1D9",
    semiMajorAxisKm: null, eccentricity: 0, inclinationDeg: null,
    orbitalPeriodDays: null, meanLongitudeAtJ2000Deg: null,
  },
];
