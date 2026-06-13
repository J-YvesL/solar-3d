// Committed TLE snapshot for the ISS (NORAD 25544).
// Offline fallback used by getIssTle() when CelesTrak and wheretheiss.at are both
// unreachable (doc 02 step E). The orbit shape stays accurate for weeks; only the
// phase (orbitalAngleDeg) goes stale. Refresh occasionally when touching the backend.
// (The parser unit tests use the doc 02 reference TLE literally, not this snapshot.)
export const SNAPSHOT_LINE1 =
  "1 25544U 98067A   26162.83551937  .00007284  00000+0  13937-3 0  9994";
export const SNAPSHOT_LINE2 =
  "2 25544  51.6334 326.5798 0004934 175.2433 184.8603 15.49179015570924";
