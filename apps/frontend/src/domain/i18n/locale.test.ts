import { describe, expect, it } from "vitest";
import { resolveLocale, SUPPORTED_LOCALES } from "./locale";

describe("resolveLocale", () => {
  it('"fr-FR" → "fr"', () => expect(resolveLocale("fr-FR")).toBe("fr"));
  it('"es-419" → "es"', () => expect(resolveLocale("es-419")).toBe("es"));
  it('"pt-BR" → "en" (fallback)', () => expect(resolveLocale("pt-BR")).toBe("en"));
  it("undefined → \"en\" (fallback)", () => expect(resolveLocale(undefined)).toBe("en"));
  it('"de" → "de"', () => expect(resolveLocale("de")).toBe("de"));
  it('"it-IT" → "it"', () => expect(resolveLocale("it-IT")).toBe("it"));
  it('"EN" (uppercase) → "en"', () => expect(resolveLocale("EN")).toBe("en"));
  it('all supported locales resolve to themselves', () => {
    for (const loc of SUPPORTED_LOCALES) {
      expect(resolveLocale(loc)).toBe(loc);
    }
  });
});
