export type Locale = "en" | "fr" | "es" | "it" | "de";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "fr", "es", "it", "de"];
export const DEFAULT_LOCALE: Locale = "en";

/** Pure: takes the navigator.language string (or undefined) and returns a supported locale. */
export function resolveLocale(navigatorLanguage: string | undefined): Locale {
  if (!navigatorLanguage) return DEFAULT_LOCALE;
  const primary = (navigatorLanguage.split("-")[0] ?? "").toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(primary)
    ? (primary as Locale)
    : DEFAULT_LOCALE;
}
