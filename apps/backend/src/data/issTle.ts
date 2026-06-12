// Committed TLE snapshot for the ISS (NORAD 25544).
// Offline fallback used by getIssTle() when CelesTrak is unreachable (doc 02 step E).
// The orbit shape stays accurate for months; only the phase (orbitalAngleDeg) goes stale.
// Reference TLE used for unit tests (doc 02 tests 22–23); refresh occasionally when touching the backend.
export const SNAPSHOT_LINE1 =
  "1 25544U 98067A   24001.50000000  .00016717  00000-0  30571-3 0  9991";
export const SNAPSHOT_LINE2 =
  "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49512571429723";
