import { SNAPSHOT_LINE1, SNAPSHOT_LINE2 } from "../data/issTle";

export interface ParsedTle {
  epochDate: Date;
  inclination: number;  // deg
  raan: number;         // deg (right ascension of ascending node)
  eccentricity: number;
  argPerigee: number;   // deg
  meanAnomaly: number;  // deg
  meanMotion: number;   // rev/day
}

export interface CircularElements {
  orbitalPeriodDays: number;
  semiMajorAxisKm: number;
  u0: number;  // argument of latitude at TLE epoch (deg)
}

// Standard gravitational parameter for Earth (km³/s²)
const MU_KM3_S2 = 398_600.4418;

const CELESTRAK_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE";
const TTL_MS = 24 * 60 * 60 * 1000;       // 24 h
const RETRY_COOLDOWN_MS = 30 * 60 * 1000; // 30 min after a failure

let tleCache: { tle: ParsedTle; fetchedAt: number } | null = null;
let lastFailTime = 0;

export function resetTleCache(): void {
  tleCache = null;
  lastFailTime = 0;
}

/**
 * Parse a 2-line TLE using fixed-column extraction (doc 02 step E).
 * No checksum validation — out of scope.
 */
export function parseTle(line1: string, line2: string): ParsedTle {
  // Line 1: epoch at columns 19–32 (1-indexed) → slice(18, 32)
  const epochStr = line1.slice(18, 32).trim();
  const epochYY = parseInt(epochStr.slice(0, 2), 10);
  const epochYear = epochYY <= 56 ? 2000 + epochYY : 1900 + epochYY;
  const dayOfYear = parseFloat(epochStr.slice(2)); // 1-based fractional
  const epochDate = new Date(
    Date.UTC(epochYear, 0, 1) + (dayOfYear - 1) * 86_400_000,
  );

  // Line 2 fields
  const inclination = parseFloat(line2.slice(8, 16));
  const raan = parseFloat(line2.slice(17, 25));
  const eccentricity = parseFloat("0." + line2.slice(26, 33));
  const argPerigee = parseFloat(line2.slice(34, 42));
  const meanAnomaly = parseFloat(line2.slice(43, 51));
  const meanMotion = parseFloat(line2.slice(52, 63));

  return { epochDate, inclination, raan, eccentricity, argPerigee, meanAnomaly, meanMotion };
}

/**
 * Derive circular-orbit elements from a parsed TLE (doc 02 step E).
 * The ISS has e ≈ 0.0005, so the circular approximation used for moons applies.
 */
export function deriveCircularElements(tle: ParsedTle): CircularElements {
  const n = tle.meanMotion; // rev/day
  const orbitalPeriodDays = 1 / n;
  const T_s = 86_400 / n;  // seconds per revolution
  const semiMajorAxisKm = Math.cbrt(MU_KM3_S2 * (T_s / (2 * Math.PI)) ** 2);
  const u0 = ((tle.argPerigee + tle.meanAnomaly) % 360 + 360) % 360;
  return { orbitalPeriodDays, semiMajorAxisKm, u0 };
}

/**
 * Return the current ISS TLE, fetching from CelesTrak when needed.
 * Cached 24 h; falls back to the committed snapshot on any failure.
 * A fetch failure never throws — the API must never 500 because of this.
 *
 * The optional `fetchFn` parameter allows tests to inject a failing fetch.
 */
export async function getIssTle(
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<ParsedTle> {
  const now = Date.now();

  if (tleCache !== null && now - tleCache.fetchedAt < TTL_MS) {
    return tleCache.tle;
  }

  if (now - lastFailTime < RETRY_COOLDOWN_MS) {
    return tleCache?.tle ?? getSnapshotTle();
  }

  try {
    const res = await fetchFn(CELESTRAK_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const lines = text
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    // CelesTrak format: optional name line, then line1, line2
    const line1 = (lines.length >= 3 ? lines[1] : lines[0]) ?? "";
    const line2 = (lines.length >= 3 ? lines[2] : lines[1]) ?? "";
    const tle = parseTle(line1, line2);
    tleCache = { tle, fetchedAt: now };
    return tle;
  } catch {
    lastFailTime = now;
    if (tleCache !== null) return tleCache.tle;
    const snapshot = getSnapshotTle();
    tleCache = { tle: snapshot, fetchedAt: 0 }; // fetchedAt 0 → will retry after TTL
    return snapshot;
  }
}

function getSnapshotTle(): ParsedTle {
  return parseTle(SNAPSHOT_LINE1, SNAPSHOT_LINE2);
}
