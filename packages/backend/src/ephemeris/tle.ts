import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { SNAPSHOT_LINE1, SNAPSHOT_LINE2 } from "../data/issTle";
import { createLogger } from "../logger";

const logger = createLogger("iss-tle");

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
// Earth's second zonal harmonic and equatorial radius (doc 03) — for the J2
// nodal precession of the ISS orbit plane (≈ −5°/day).
const J2 = 1.08263e-3;
const RE_KM = 6378.137;
const DEG = Math.PI / 180;

const CELESTRAK_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE";
// Fallback TLE source when CelesTrak is unreachable or blocks the host (doc 02 step E).
const WHERETHEISS_URL = "https://api.wheretheiss.at/v1/satellites/25544/tles";
const TTL_MS = 24 * 60 * 60 * 1000;       // 24 h
const RETRY_COOLDOWN_MS = 30 * 60 * 1000; // 30 min after a failure

// Disk-persisted cache so the "at most one fetch per 24 h" guarantee survives
// dev-server restarts (the in-memory cache alone re-fetches on every restart).
// Disabled under vitest to keep unit tests hermetic.
const DISK_CACHE_PATH = join(__dirname, "../../.cache/iss-tle.json");
const DISK_CACHE_ENABLED = process.env["VITEST"] === undefined;

// Offline mode: never hit the network — serve the disk cache (even stale) or the
// committed snapshot. Set by the `dev` script so local development never queries
// CelesTrak / wheretheiss.at (avoids getting the dev host IP blocked, doc 02 step E).
// Read at call time so it can be toggled per environment (and in tests).
function isOffline(): boolean {
  const v = process.env["ISS_TLE_OFFLINE"];
  return v === "1" || v === "true";
}

interface DiskCache {
  line1: string;
  line2: string;
  fetchedAt: number;
}

let tleCache: { tle: ParsedTle; fetchedAt: number } | null = null;
let lastFailTime = 0;
let diskLoaded = false;

export function resetTleCache(): void {
  tleCache = null;
  lastFailTime = 0;
  diskLoaded = true; // skip disk reads in tests
}

function loadDiskCache(): void {
  diskLoaded = true;
  if (!DISK_CACHE_ENABLED || !existsSync(DISK_CACHE_PATH)) return;
  try {
    const data = JSON.parse(readFileSync(DISK_CACHE_PATH, "utf8")) as DiskCache;
    tleCache = { tle: parseTle(data.line1, data.line2), fetchedAt: data.fetchedAt };
  } catch {
    // Corrupt or unreadable cache — ignore and fetch fresh.
  }
}

function saveDiskCache(line1: string, line2: string, fetchedAt: number): void {
  if (!DISK_CACHE_ENABLED) return;
  try {
    mkdirSync(dirname(DISK_CACHE_PATH), { recursive: true });
    writeFileSync(
      DISK_CACHE_PATH,
      JSON.stringify({ line1, line2, fetchedAt } satisfies DiskCache),
    );
  } catch {
    // Read-only filesystem or similar — disk persistence is best-effort.
  }
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
 * J2 nodal regression rate of the orbit plane, in deg/day (doc 02 step E).
 * Ω̇ = −(3/2) · J2 · (Re/a)² · n · cos i, with n in deg/day (e ≈ 0 ⇒ p ≈ a).
 * For the ISS this is ≈ −4.96 °/day, so the RAAN must be propagated from the
 * TLE epoch or the orbit plane drifts up to ~5° between TLE refreshes.
 */
export function raanRateDegPerDay(tle: ParsedTle, semiMajorAxisKm: number): number {
  return (
    -1.5 *
    J2 *
    (RE_KM / semiMajorAxisKm) ** 2 *
    (360 * tle.meanMotion) *
    Math.cos(tle.inclination * DEG)
  );
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
  if (!diskLoaded) loadDiskCache();
  const now = Date.now();

  if (tleCache !== null && now - tleCache.fetchedAt < TTL_MS) {
    const ageH = ((now - tleCache.fetchedAt) / 3_600_000).toFixed(1);
    logger.info(`serving cached TLE (age ${ageH}h, epoch ${tleCache.tle.epochDate.toISOString()})`);
    return tleCache.tle;
  }

  // Local/offline: skip the network entirely; the disk cache (even stale) or the
  // committed snapshot is good enough, and the J2 propagation keeps the position
  // accurate for weeks (doc 02 step E).
  if (isOffline()) {
    const src = tleCache !== null ? "disk cache" : "committed snapshot";
    logger.info(`OFFLINE mode → serving ${src} (no network)`);
    return tleCache?.tle ?? getSnapshotTle();
  }

  if (now - lastFailTime < RETRY_COOLDOWN_MS) {
    const src = tleCache !== null ? "cached TLE" : "committed snapshot";
    logger.warn(`in retry cooldown (last failure < 30 min ago) → serving ${src}`);
    return tleCache?.tle ?? getSnapshotTle();
  }

  // Primary CelesTrak, then the wheretheiss.at fallback; first success wins.
  logger.info("cache stale/empty → fetching fresh TLE from the network");
  let lines = await fetchCelesTrak(fetchFn);
  let source = "CelesTrak";
  if (lines === null) {
    lines = await fetchWhereTheIss(fetchFn);
    source = "wheretheiss.at";
  }
  if (lines !== null) {
    const tle = parseTle(lines[0], lines[1]);
    tleCache = { tle, fetchedAt: now };
    saveDiskCache(lines[0], lines[1], now);
    logger.info(`fetched fresh TLE from ${source} (epoch ${tle.epochDate.toISOString()}) → cached on disk`);
    return tle;
  }

  lastFailTime = now;
  if (tleCache !== null) {
    logger.warn("both sources failed → serving previously cached TLE");
    return tleCache.tle;
  }
  logger.warn("both sources failed and no cache → serving committed snapshot");
  const snapshot = getSnapshotTle();
  tleCache = { tle: snapshot, fetchedAt: 0 }; // fetchedAt 0 → will retry after TTL
  return snapshot;
}

/** Fetch the 2 TLE lines from CelesTrak (plain text), or null on any failure. */
async function fetchCelesTrak(
  fetchFn: typeof globalThis.fetch,
): Promise<[string, string] | null> {
  try {
    const res = await fetchFn(CELESTRAK_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lines = (await res.text())
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    // CelesTrak format: optional name line, then line1, line2
    const line1 = (lines.length >= 3 ? lines[1] : lines[0]) ?? "";
    const line2 = (lines.length >= 3 ? lines[2] : lines[1]) ?? "";
    if (line1 === "" || line2 === "") throw new Error("malformed TLE");
    return [line1, line2];
  } catch (err) {
    logger.warn(`CelesTrak fetch failed: ${String(err)}`);
    return null;
  }
}

/** Fetch the 2 TLE lines from wheretheiss.at (JSON {line1, line2}), or null on failure. */
async function fetchWhereTheIss(
  fetchFn: typeof globalThis.fetch,
): Promise<[string, string] | null> {
  try {
    const res = await fetchFn(WHERETHEISS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { line1?: unknown; line2?: unknown };
    if (typeof body.line1 !== "string" || typeof body.line2 !== "string") {
      throw new Error("malformed JSON TLE");
    }
    return [body.line1.trim(), body.line2.trim()];
  } catch (err) {
    logger.warn(`wheretheiss.at fetch failed: ${String(err)}`);
    return null;
  }
}

function getSnapshotTle(): ParsedTle {
  return parseTle(SNAPSHOT_LINE1, SNAPSHOT_LINE2);
}
