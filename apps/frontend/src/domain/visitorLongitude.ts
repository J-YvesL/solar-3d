/** Visitor's longitude in degrees east, derived from the browser timezone offset. */
export function visitorLongitudeDeg(): number {
  return -(new Date().getTimezoneOffset() / 60) * 15;
}
