import { describe, expect, it } from "vitest";
import { t, type UiKey } from "./strings";
import { SUPPORTED_LOCALES } from "./locale";

const ALL_KEYS: UiKey[] = [
  "loading", "errorTitle", "retry", "back", "hint",
  "localTime", "composition", "radius", "orbitalPeriod", "dayLength",
  "distanceFromSun", "distanceFromParent", "moons",
  "hours", "days", "years",
  "typeStar", "typePlanet", "typeDwarfPlanet", "typeMoon", "typeSatellite",
  "madeBy",
];

describe("t — completeness", () => {
  it("every locale × every key returns a non-empty string", () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of ALL_KEYS) {
        const result = t(locale, key);
        expect(result, `${locale}.${key} is empty`).toBeTruthy();
      }
    }
  });
});

describe("t — interpolation", () => {
  it("replaces {parent} placeholder", () => {
    expect(t("en", "distanceFromParent", { parent: "Earth" })).toBe("Distance from Earth");
    expect(t("fr", "distanceFromParent", { parent: "Terre" })).toBe("Distance à Terre");
  });

  it("replaces {author} placeholder in madeBy", () => {
    expect(t("en", "madeBy", { author: "Jynfra" })).toBe("Made by Jynfra with ❤️");
    expect(t("de", "madeBy", { author: "Jynfra" })).toBe("Erstellt von Jynfra mit ❤️");
  });

  it("returns string unchanged when no params given", () => {
    expect(t("en", "loading")).toBe("Loading the solar system…");
  });
});

describe("t — spot checks (doc 09 verbatim)", () => {
  it("fr loading", () => expect(t("fr", "loading")).toBe("Chargement du système solaire…"));
  it("es retry", () => expect(t("es", "retry")).toBe("Reintentar"));
  it("it typePlanet", () => expect(t("it", "typePlanet")).toBe("pianeta"));
  it("de typeMoon", () => expect(t("de", "typeMoon")).toBe("Mond"));
  it("fr typePlanet", () => expect(t("fr", "typePlanet")).toBe("planète"));
  it("fr typeDwarfPlanet", () => expect(t("fr", "typeDwarfPlanet")).toBe("planète naine"));
  it("en typeDwarfPlanet", () => expect(t("en", "typeDwarfPlanet")).toBe("dwarf planet"));
  it("de typeDwarfPlanet", () => expect(t("de", "typeDwarfPlanet")).toBe("Zwergplanet"));
});
