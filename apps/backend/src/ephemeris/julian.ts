/** Julian Date for the given instant. */
export function julianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

/**
 * Julian centuries since J2000.0.
 * UTC is used; the ~69 s difference vs Terrestrial Time is ignored at this precision level.
 */
export function julianCenturiesSinceJ2000(date: Date): number {
  return (julianDate(date) - 2_451_545.0) / 36_525;
}

/** Days since J2000.0 (fractional). */
export function daysSinceJ2000(date: Date): number {
  return julianDate(date) - 2_451_545.0;
}
