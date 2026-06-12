import { describe, expect, it } from "vitest";
import { BODIES } from "./bodies";
import { bodyInfo } from "./bodyInfo";
import { localizedBodies as fr } from "./localized/fr";
import { localizedBodies as es } from "./localized/es";
import { localizedBodies as it_ } from "./localized/it";
import { localizedBodies as de } from "./localized/de";

describe("bodies data", () => {
  it("12: exactly 30 bodies, unique ids, correct type counts", () => {
    expect(BODIES).toHaveLength(30);
    const ids = BODIES.map((b) => b.id);
    expect(new Set(ids).size).toBe(30);
    expect(BODIES.filter((b) => b.type === "star")).toHaveLength(1);
    expect(BODIES.filter((b) => b.type === "planet")).toHaveLength(8);
    expect(BODIES.filter((b) => b.type === "moon")).toHaveLength(20);
    expect(BODIES.filter((b) => b.type === "satellite")).toHaveLength(1);
  });

  it("13: parent links valid, moon counts per planet correct", () => {
    const idSet = new Set(BODIES.map((b) => b.id));
    for (const body of BODIES) {
      if (body.parentId !== null) {
        expect(idSet.has(body.parentId), `${body.id}.parentId="${body.parentId}" not found`).toBe(
          true,
        );
      }
    }
    const moonCounts: Record<string, number> = {};
    for (const body of BODIES.filter((b) => b.type === "moon")) {
      const parent = body.parentId ?? "none";
      const current = moonCounts[parent];
      moonCounts[parent] = (current ?? 0) + 1;
    }
    expect(moonCounts["earth"]).toBe(1);
    expect(moonCounts["mars"]).toBe(2);
    expect(moonCounts["jupiter"]).toBe(4);
    expect(moonCounts["saturn"]).toBe(7);
    expect(moonCounts["uranus"]).toBe(5);
    expect(moonCounts["neptune"]).toBe(1);
    // ISS is a satellite, not a moon (S23)
    const iss = BODIES.find((b) => b.id === "iss");
    expect(iss?.type).toBe("satellite");
    expect(iss?.parentId).toBe("earth");
  });

  it("14: every body has info entry, colors match #RRGGBB format", () => {
    const colorRegex = /^#[0-9A-F]{6}$/i;
    for (const body of BODIES) {
      expect(bodyInfo[body.id], `missing info for ${body.id}`).toBeDefined();
      expect(
        colorRegex.test(body.color),
        `invalid color for ${body.id}: ${body.color}`,
      ).toBe(true);
    }
  });

  it("14b: every body has rotationAtJ2000Deg in [0, 360)", () => {
    for (const body of BODIES) {
      expect(
        body.rotationAtJ2000Deg >= 0 && body.rotationAtJ2000Deg < 360,
        `rotationAtJ2000Deg out of range for ${body.id}: ${body.rotationAtJ2000Deg}`,
      ).toBe(true);
    }
  });

  it("14c: every body has poleEclipticLonDeg in [0, 360), Table 6 spot checks", () => {
    const byId = new Map(BODIES.map((b) => [b.id, b]));
    for (const body of BODIES) {
      expect(
        body.poleEclipticLonDeg >= 0 && body.poleEclipticLonDeg < 360,
        `poleEclipticLonDeg out of range for ${body.id}: ${body.poleEclipticLonDeg}`,
      ).toBe(true);
    }
    expect(byId.get("earth")?.poleEclipticLonDeg).toBe(90);
    expect(byId.get("venus")?.poleEclipticLonDeg).toBe(210.19);
    expect(byId.get("uranus")?.poleEclipticLonDeg).toBe(77.65);
    for (const moon of BODIES.filter((b) => b.type === "moon")) {
      expect(moon.poleEclipticLonDeg, `poleEclipticLonDeg must be 0 for ${moon.id}`).toBe(0);
    }
  });

  it("21: localized files cover all 30 ids with non-empty fields and correct names (doc 09)", () => {
    const expectedNames: Record<string, { fr: string; es: string; it: string; de: string }> = {
      sun:       { fr: "Soleil",   es: "Sol",      it: "Sole",     de: "Sonne"   },
      mercury:   { fr: "Mercure",  es: "Mercurio", it: "Mercurio", de: "Merkur"  },
      venus:     { fr: "Vénus",    es: "Venus",    it: "Venere",   de: "Venus"   },
      earth:     { fr: "Terre",    es: "Tierra",   it: "Terra",    de: "Erde"    },
      mars:      { fr: "Mars",     es: "Marte",    it: "Marte",    de: "Mars"    },
      jupiter:   { fr: "Jupiter",  es: "Júpiter",  it: "Giove",    de: "Jupiter" },
      saturn:    { fr: "Saturne",  es: "Saturno",  it: "Saturno",  de: "Saturn"  },
      uranus:    { fr: "Uranus",   es: "Urano",    it: "Urano",    de: "Uranus"  },
      neptune:   { fr: "Neptune",  es: "Neptuno",  it: "Nettuno",  de: "Neptun"  },
      moon:      { fr: "Lune",     es: "Luna",     it: "Luna",     de: "Mond"    },
      phobos:    { fr: "Phobos",   es: "Fobos",    it: "Fobos",    de: "Phobos"  },
      deimos:    { fr: "Déimos",   es: "Deimos",   it: "Deimos",   de: "Deimos"  },
      io:        { fr: "Io",       es: "Ío",       it: "Io",       de: "Io"      },
      europa:    { fr: "Europe",   es: "Europa",   it: "Europa",   de: "Europa"  },
      ganymede:  { fr: "Ganymède", es: "Ganimedes",it: "Ganimede", de: "Ganymed" },
      callisto:  { fr: "Callisto", es: "Calisto",  it: "Callisto", de: "Kallisto"},
      mimas:     { fr: "Mimas",    es: "Mimas",    it: "Mimante",  de: "Mimas"   },
      enceladus: { fr: "Encelade", es: "Encélado", it: "Encelado", de: "Enceladus"},
      tethys:    { fr: "Téthys",   es: "Tetis",    it: "Teti",     de: "Tethys"  },
      dione:     { fr: "Dioné",    es: "Dione",    it: "Dione",    de: "Dione"   },
      rhea:      { fr: "Rhéa",     es: "Rea",      it: "Rea",      de: "Rhea"    },
      titan:     { fr: "Titan",    es: "Titán",    it: "Titano",   de: "Titan"   },
      iapetus:   { fr: "Japet",    es: "Jápeto",   it: "Giapeto",  de: "Iapetus" },
      miranda:   { fr: "Miranda",  es: "Miranda",  it: "Miranda",  de: "Miranda" },
      ariel:     { fr: "Ariel",    es: "Ariel",    it: "Ariele",   de: "Ariel"   },
      umbriel:   { fr: "Umbriel",  es: "Umbriel",  it: "Umbriel",  de: "Umbriel" },
      titania:   { fr: "Titania",  es: "Titania",  it: "Titania",  de: "Titania" },
      oberon:    { fr: "Obéron",   es: "Oberón",   it: "Oberon",   de: "Oberon"  },
      triton:    { fr: "Triton",   es: "Tritón",   it: "Tritone",  de: "Triton"  },
      iss:       { fr: "ISS",      es: "ISS",      it: "ISS",      de: "ISS"     },
    };

    const langs = [
      { code: "fr" as const, data: fr },
      { code: "es" as const, data: es },
      { code: "it" as const, data: it_ },
      { code: "de" as const, data: de },
    ];

    for (const { code, data } of langs) {
      const ids = BODIES.map((b) => b.id);
      expect(Object.keys(data), `${code}: wrong id count`).toHaveLength(30);
      for (const id of ids) {
        const entry = data[id];
        expect(entry, `${code}: missing entry for ${id}`).toBeDefined();
        if (!entry) continue;
        expect(entry.name, `${code}: empty name for ${id}`).toBeTruthy();
        expect(entry.info.description, `${code}: empty description for ${id}`).toBeTruthy();
        expect(entry.info.composition, `${code}: empty composition for ${id}`).toBeTruthy();
        expect(entry.info.funFact, `${code}: empty funFact for ${id}`).toBeTruthy();
        expect(entry.name, `${code}: wrong name for ${id}`).toBe(expectedNames[id]?.[code]);
      }
    }
  });
});
