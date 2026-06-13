// Convert equatorial orbit elements (TLE frame: inclination/RAAN measured against
// Earth's equator and the vernal equinox) into the scene's ecliptic frame, so the
// frontend — which renders every orbit in the ecliptic plane (doc 05) — places the
// satellite over its true sub-satellite point. Without this the ISS orbit plane is
// tilted by the obliquity (≤ 23.44°), shifting the rendered position by up to ~23°
// in longitude (doc 02 step E).

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

type Vec3 = readonly [number, number, number];

function rotX(a: number, [x, y, z]: Vec3): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

function rotZ(a: number, [x, y, z]: Vec3): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c, z];
}

/**
 * Apply the orbit-orientation matrix `R = Rx(−ε)·Rz(Ω)·Rx(i)` to a vector — this
 * carries a vector from the orbit's perifocal axes (equatorial) into the ecliptic
 * frame.
 */
function applyR(epsRad: number, nodeRad: number, inclRad: number, v: Vec3): Vec3 {
  return rotX(-epsRad, rotZ(nodeRad, rotX(inclRad, v)));
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

export interface EclipticElements {
  inclinationDeg: number; // i′ — orbit-plane tilt in the ecliptic frame
  nodeLonDeg: number; // Ω′ — ascending-node longitude in the ecliptic frame
  argLatDeg: number; // u′ — argument of latitude, re-zeroed to the new node
}

/**
 * Map equatorial orbit elements (i, Ω, u) to the ecliptic frame.
 *
 * The orbit's orientation in the equatorial frame is `Rz(Ω)·Rx(i)`; a rotation
 * `Rx(−ε)` carries the equatorial frame onto the ecliptic frame (ε = obliquity),
 * giving `R = Rx(−ε)·Rz(Ω)·Rx(i)`. We read the ecliptic elements straight off R
 * (a z–x–z decomposition): the orbit normal is `R·ẑ`, and the argument-of-latitude
 * shift δ is the angle from the new node to `R·x̂` (the equatorial u = 0 direction).
 */
export function equatorialToEcliptic(
  inclinationDeg: number,
  nodeLonDeg: number,
  argLatDeg: number,
  obliquityDeg: number,
): EclipticElements {
  const eps = obliquityDeg * DEG;
  const node = nodeLonDeg * DEG;
  const incl = inclinationDeg * DEG;

  const normal = applyR(eps, node, incl, [0, 0, 1]); // orbit normal
  const uZero = applyR(eps, node, incl, [1, 0, 0]); // equatorial u = 0 direction

  const inclEcl = Math.acos(Math.max(-1, Math.min(1, normal[2]))) * RAD;
  const nodeEcl = Math.atan2(normal[0], -normal[1]) * RAD;

  const nodeVec: Vec3 = [Math.cos(nodeEcl * DEG), Math.sin(nodeEcl * DEG), 0];
  const delta =
    Math.atan2(dot(normal, cross(nodeVec, uZero)), dot(nodeVec, uZero)) * RAD;

  return {
    inclinationDeg: inclEcl,
    nodeLonDeg: mod360(nodeEcl),
    argLatDeg: mod360(argLatDeg + delta),
  };
}
