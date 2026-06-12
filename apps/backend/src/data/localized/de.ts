import type { BodyInfo } from "@solar/shared";

export const localizedBodies: Record<string, { name: string; info: BodyInfo }> = {
  sun: {
    name: "Sonne",
    info: {
      description:
        "Der Stern im Zentrum unseres Sonnensystems, eine nahezu perfekte Kugel aus heißem Plasma, die 99,86 % der Masse des Systems enthält.",
      composition: "~73 % Wasserstoff, ~25 % Helium, Spuren von Sauerstoff, Kohlenstoff, Eisen",
      funFact: "Eine Million Erden würden in die Sonne passen.",
    },
  },
  mercury: {
    name: "Merkur",
    info: {
      description:
        "Der kleinste Planet und der sonnennächste, mit einer stark verkraterten Oberfläche und fast keiner Atmosphäre.",
      composition: "Großer Eisenkern (~60 % der Masse), silikatischer Mantel und Kruste",
      funFact:
        "Ein Jahr auf Merkur (88 Tage) ist kürzer als sein vollständiger Tag-Nacht-Zyklus (176 Erdentage).",
    },
  },
  venus: {
    name: "Venus",
    info: {
      description:
        "Erds \"Zwilling\" in der Größe, eingehüllt in eine erdrückende CO₂-Atmosphäre mit Schwefelsäurewolken — der heißeste Planet.",
      composition:
        "Gesteinskörper; Atmosphäre aus 96,5 % CO₂, Oberflächendruck 92-mal so hoch wie auf der Erde",
      funFact: "Venus dreht sich rückwärts: ihre Sonne geht im Westen auf und im Osten unter.",
    },
  },
  earth: {
    name: "Erde",
    info: {
      description:
        "Die einzige bekannte Welt, die Leben beherbergt, mit flüssigem Wasser auf 71 % der Oberfläche.",
      composition: "Eisen-Nickel-Kern, silikatischer Mantel; Atmosphäre aus 78 % N₂, 21 % O₂",
      funFact: "Die Erde ist der dichteste Planet im Sonnensystem.",
    },
  },
  mars: {
    name: "Mars",
    info: {
      description:
        "Der rote Planet, eine kalte Wüstenwelt mit dem größten Vulkan und dem tiefsten Canyon im Sonnensystem.",
      composition:
        "Eisenreicher Basalt; dünne CO₂-Atmosphäre (weniger als 1 % des Erddrucks)",
      funFact: "Der Olympus Mons auf dem Mars ist etwa 2,5-mal so hoch wie der Mount Everest.",
    },
  },
  jupiter: {
    name: "Jupiter",
    info: {
      description:
        "Der größte Planet — ein Gasriese, dessen Großer Roter Fleck ein Sturm größer als die Erde ist, der seit Jahrhunderten tobt.",
      composition: "~90 % Wasserstoff, ~10 % Helium; möglicher Gesteinskern",
      funFact:
        "Jupiter ist mehr als doppelt so massereich wie alle anderen Planeten zusammen.",
    },
  },
  saturn: {
    name: "Saturn",
    info: {
      description:
        "Der Gasriese mit Ringen: seine spektakulären Ringe bestehen aus zahllosen Eis- und Gesteinsfragmenten.",
      composition:
        "~96 % Wasserstoff, ~3 % Helium; eisige Ringpartikel von Metern bis Zentimetern",
      funFact:
        "Saturns mittlere Dichte ist geringer als die von Wasser — er würde in einer ausreichend großen Badewanne schwimmen.",
    },
  },
  uranus: {
    name: "Uranus",
    info: {
      description:
        "Ein Eisriese, der auf der Seite rotiert, mit einer blassen Cyanfarbe durch Methan in seiner Atmosphäre.",
      composition:
        "Wasser-, Methan- und Ammoniak-\"Eise\" über einem Gesteinskern; H₂/He-Atmosphäre",
      funFact:
        "Uranus' Achse ist um 98° geneigt: jeder Pol erhält 42 Jahre Tageslicht, dann 42 Jahre Nacht.",
    },
  },
  neptune: {
    name: "Neptun",
    info: {
      description:
        "Der fernste Planet, ein tiefblauer Eisriese mit den schnellsten Winden im Sonnensystem (bis zu 2 100 km/h).",
      composition: "Wasser-, Methan- und Ammoniakeis; H₂/He-Atmosphäre mit Methan",
      funFact:
        "Neptun wurde durch Mathematik entdeckt: seine Position wurde vorhergesagt, bevor er gesehen wurde.",
    },
  },
  moon: {
    name: "Mond",
    info: {
      description:
        "Erds einziger natürlicher Satellit, dessen Schwerkraft die Meeresgezeiten antreibt.",
      composition: "Silikatgestein; kleiner Eisenkern; keine Atmosphäre",
      funFact: "Der Mond zeigt der Erde immer dieselbe Seite — er ist gebunden rotierend.",
    },
  },
  phobos: {
    name: "Phobos",
    info: {
      description:
        "Der größere und nähere der beiden kleinen Monde des Mars, der schneller als der Mars rotiert.",
      composition: "Kohlenstoffreiches Gestein und Regolith, möglicherweise ein eingefangener Asteroid",
      funFact:
        "Phobos spiraliert langsam nach innen und wird in ~50 Millionen Jahren auf dem Mars aufschlagen oder zerbrechen.",
    },
  },
  deimos: {
    name: "Deimos",
    info: {
      description: "Der kleinere, äußere Mond des Mars, nur 12 km groß.",
      composition: "Kohlenstoffreiches Gestein, ähnlich wie C-Typ-Asteroiden",
      funFact: "Vom Mars aus sieht Deimos wie ein heller Stern aus, nicht wie ein Mond.",
    },
  },
  io: {
    name: "Io",
    info: {
      description:
        "Der vulkanisch aktivste Körper im Sonnensystem, durch Jupiters Gezeiten zusammengepresst.",
      composition: "Silikatgestein; Oberfläche aus Schwefel und Schwefeldioxidfrost",
      funFact: "Io hat Hunderte von Vulkanen, einige mit Ausbruchfahnen von 500 km Höhe.",
    },
  },
  europa: {
    name: "Europa",
    info: {
      description:
        "Ein eisiger Mond, der unter seiner gefrorenen Schale einen globalen flüssigen Wasserozean verbirgt — ein vorrangiges Ziel bei der Suche nach Leben.",
      composition: "Wassereis-Kruste über einem salzigen Ozean; silikatischer Mantel, Eisenkern",
      funFact:
        "Europas verborgener Ozean könnte doppelt so viel Wasser enthalten wie alle Ozeane der Erde zusammen.",
    },
  },
  ganymede: {
    name: "Ganymed",
    info: {
      description: "Der größte Mond im Sonnensystem — größer als der Planet Merkur.",
      composition: "Ungefähr zur Hälfte Wassereis, zur Hälfte Silikatgestein; Eisenkern",
      funFact: "Ganymed ist der einzige Mond, von dem bekannt ist, dass er ein eigenes Magnetfeld besitzt.",
    },
  },
  callisto: {
    name: "Kallisto",
    info: {
      description:
        "Eine dunkle, alte Welt mit der am stärksten verkraterten Oberfläche im Sonnensystem.",
      composition: "Mischung aus Gestein und Wassereis; möglicher unterirdischer Ozean",
      funFact:
        "Callistos Oberfläche ist etwa 4 Milliarden Jahre alt — seit ihrer Entstehung nahezu unverändert.",
    },
  },
  mimas: {
    name: "Mimas",
    info: {
      description:
        "Ein kleiner Eismond, dessen riesiger Krater Herschel ihn wie den Todesstern aussehen lässt.",
      composition: "Fast reines Wassereis",
      funFact: "Der Krater Herschel ist 139 km breit — ein Drittel von Mimas' eigenem Durchmesser.",
    },
  },
  enceladus: {
    name: "Enceladus",
    info: {
      description: "Ein heller Eismond, der Geysire aus Wasser von seinem Südpol schleudert.",
      composition: "Wassereis über einem globalen unterirdischen Ozean; Gesteinskern",
      funFact: "Enceladus' Geysire speisen Saturns E-Ring mit Eispartikeln.",
    },
  },
  tethys: {
    name: "Tethys",
    info: {
      description:
        "Ein mittelgroßer Eismond des Saturns, gezeichnet vom riesigen Odysseus-Krater und dem Ithaca-Chasma-Canyon.",
      composition: "Fast vollständig aus Wassereis",
      funFact:
        "Ithaca Chasma ist ein Canyon, der sich über drei Viertel des Umfangs von Tethys erstreckt.",
    },
  },
  dione: {
    name: "Dione",
    info: {
      description: "Ein eisiger Saturnmond, durchzogen von hellen \"hauchigen\" Eiskliffs.",
      composition: "Überwiegend Wassereis mit einem Gesteinskern",
      funFact: "Diones hauchige Streifen sind Eiskliffs von mehreren hundert Metern Höhe.",
    },
  },
  rhea: {
    name: "Rhea",
    info: {
      description: "Saturns zweitgrößter Mond, eine kalte, verkraterte Kugel aus Eis und Gestein.",
      composition: "~75 % Wassereis, ~25 % Gestein",
      funFact: "Rhea hatte möglicherweise einmal ihr eigenes schwaches Ringsystem.",
    },
  },
  titan: {
    name: "Titan",
    info: {
      description:
        "Saturns größter Mond — der einzige Mond mit einer dichten Atmosphäre und Seen aus flüssigem Methan.",
      composition: "Wassereis-Kruste; Stickstoffatmosphäre dichter als die der Erde",
      funFact:
        "Titans Methanregen und -flüsse machen ihn zur einzigen anderen Welt mit flüssigen Gewässern an der Oberfläche.",
    },
  },
  iapetus: {
    name: "Iapetus",
    info: {
      description:
        "Saturns zweiseitiger Mond: eine Hemisphäre ist kohlrabenschwarz, die andere weiß wie Schnee.",
      composition: "Überwiegend Wassereis; dunkle kohlenstoffreiche Beschichtung auf einer Seite",
      funFact: "Iapetus hat einen mysteriösen äquatorialen Gebirgszug von bis zu 13 km Höhe.",
    },
  },
  miranda: {
    name: "Miranda",
    info: {
      description:
        "Uranus' seltsamster Mond, ein chaotisches Patchwork aus Klippen und Canyons.",
      composition: "Wassereis und Silikatgestein",
      funFact:
        "Verona Rupes auf Miranda könnte die höchste Klippe im Sonnensystem sein (~20 km).",
    },
  },
  ariel: {
    name: "Ariel",
    info: {
      description:
        "Der hellste der Uranus-Monde, mit relativ jungen Tälern und Graten.",
      composition: "Wassereis und Gestein, mit möglichem Ammoniakeis",
      funFact: "Ariels Oberfläche ist die jüngste unter den großen Monden des Uranus.",
    },
  },
  umbriel: {
    name: "Umbriel",
    info: {
      description: "Der dunkelste der großen Uranus-Monde, alt und stark verkratert.",
      composition: "Wassereis und Gestein mit dunklem Oberflächenmaterial",
      funFact:
        "Ein heller, geheimnisvoller Ring namens \"fluoreszenter Cheerio\" befindet sich in seinem Krater Wunda.",
    },
  },
  titania: {
    name: "Titania",
    info: {
      description: "Der größte Mond des Uranus, gezeichnet von riesigen Verwerfungscanyons.",
      composition: "Ungefähr zur Hälfte Wassereis, zur Hälfte Gestein",
      funFact: "Titanias Canyon Messina Chasma erstreckt sich über etwa 1 500 km.",
    },
  },
  oberon: {
    name: "Oberon",
    info: {
      description: "Der äußerste große Mond des Uranus, alt, dunkel und verkratert.",
      composition: "Wassereis und Gestein mit einer möglichen Ozeanschicht",
      funFact:
        "Oberon ist wie alle Uranus-Monde nach einer Shakespeare-Figur benannt — dem Elfenkönig.",
    },
  },
  triton: {
    name: "Triton",
    info: {
      description:
        "Neptuns großer Mond, der sich rückwärts bewegt — mit ziemlicher Sicherheit ein eingefangenes Kuipergürtelobjekt.",
      composition: "Stickstoffeisoberfläche über Gestein und Metall; dünne Stickstoffatmosphäre",
      funFact:
        "Tritons retrograde Umlaufbahn bedeutet, dass Neptuns Gezeiten es letztendlich zerreißen werden.",
    },
  },
  iss: {
    name: "ISS",
    info: {
      description:
        "Die Internationale Raumstation, ein fußballfeldgroßes Forschungslabor, das die Erde alle ~92 Minuten umkreist und seit November 2000 ununterbrochen bewohnt ist.",
      composition:
        "Aluminiummodule, Stahlgitterträger-Segmente und acht Solarzellenflügel; ~915 m³ Druckvolumen",
      funFact:
        "Die ISS reist mit etwa 28 000 km/h — ihre Besatzung erlebt täglich 16 Sonnenauf- und -untergänge.",
    },
  },
};
