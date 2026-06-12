import type { BodyInfo } from "@solar/shared";

export const localizedBodies: Record<string, { name: string; info: BodyInfo }> = {
  sun: {
    name: "Soleil",
    info: {
      description:
        "L'étoile au centre de notre système solaire, une sphère presque parfaite de plasma chaud qui contient 99,86 % de la masse du système.",
      composition: "~73 % d'hydrogène, ~25 % d'hélium, traces d'oxygène, carbone, fer",
      funFact: "Un million de Terres pourraient tenir dans le Soleil.",
    },
  },
  mercury: {
    name: "Mercure",
    info: {
      description:
        "La plus petite planète et la plus proche du Soleil, avec une surface fortement cratérisée et presque pas d'atmosphère.",
      composition: "Grand noyau de fer (~60 % de la masse), manteau et croûte silicatés",
      funFact:
        "Une année sur Mercure (88 jours) est plus courte que son cycle jour–nuit complet (176 jours terrestres).",
    },
  },
  venus: {
    name: "Vénus",
    info: {
      description:
        "Le « jumeau » de la Terre en taille, enveloppé dans une atmosphère de CO₂ écrasante avec des nuages d'acide sulfurique — la planète la plus chaude.",
      composition: "Corps rocheux ; atmosphère de 96,5 % CO₂, pression de surface 92 fois celle de la Terre",
      funFact: "Vénus tourne à l'envers : son Soleil se lève à l'ouest et se couche à l'est.",
    },
  },
  earth: {
    name: "Terre",
    info: {
      description:
        "Le seul monde connu à abriter la vie, avec de l'eau liquide couvrant 71 % de sa surface.",
      composition: "Noyau fer-nickel, manteau silicaté ; atmosphère de 78 % N₂, 21 % O₂",
      funFact: "La Terre est la planète la plus dense du système solaire.",
    },
  },
  mars: {
    name: "Mars",
    info: {
      description:
        "La planète rouge, un monde désertique froid avec le plus grand volcan et le canyon le plus profond du système solaire.",
      composition:
        "Roche basaltique riche en fer ; fine atmosphère de CO₂ (moins de 1 % de la pression terrestre)",
      funFact: "Olympus Mons sur Mars mesure environ 2,5 fois la hauteur du mont Everest.",
    },
  },
  jupiter: {
    name: "Jupiter",
    info: {
      description:
        "La plus grande planète — une géante gazeuse dont la Grande Tache Rouge est une tempête plus large que la Terre qui fait rage depuis des siècles.",
      composition: "~90 % d'hydrogène, ~10 % d'hélium ; possible noyau rocheux",
      funFact: "Jupiter est plus de deux fois plus massif que toutes les autres planètes réunies.",
    },
  },
  saturn: {
    name: "Saturne",
    info: {
      description:
        "La géante gazeuse aux anneaux : ses spectaculaires anneaux sont constitués d'innombrables fragments de glace et de roche.",
      composition:
        "~96 % d'hydrogène, ~3 % d'hélium ; particules d'anneau glacées de quelques mètres à quelques centimètres",
      funFact:
        "La densité moyenne de Saturne est inférieure à celle de l'eau — elle flotterait dans une baignoire suffisamment grande.",
    },
  },
  uranus: {
    name: "Uranus",
    info: {
      description:
        "Une géante de glace qui tourne sur le côté, avec une couleur bleu-vert pâle due au méthane dans son atmosphère.",
      composition:
        "« Glaces » d'eau, méthane et ammoniac au-dessus d'un noyau rocheux ; atmosphère H₂/He",
      funFact:
        "L'axe d'Uranus est incliné à 98° : chaque pôle reçoit 42 ans de lumière du jour, puis 42 ans de nuit.",
    },
  },
  neptune: {
    name: "Neptune",
    info: {
      description:
        "La planète la plus éloignée, une géante de glace bleu profond avec les vents les plus rapides du système solaire (jusqu'à 2 100 km/h).",
      composition: "Glaces d'eau, méthane et ammoniac ; atmosphère H₂/He avec méthane",
      funFact:
        "Neptune a été découverte par les mathématiques : sa position a été prédite avant d'être observée.",
    },
  },
  moon: {
    name: "Lune",
    info: {
      description:
        "Le seul satellite naturel de la Terre, dont la gravité provoque les marées océaniques.",
      composition: "Roche silicatée ; petit noyau de fer ; pas d'atmosphère",
      funFact: "La Lune montre toujours la même face à la Terre — elle est en rotation synchrone.",
    },
  },
  phobos: {
    name: "Phobos",
    info: {
      description:
        "La plus grande et la plus proche des deux petites lunes de Mars, orbitant plus vite que Mars ne tourne.",
      composition: "Roche et régolite riches en carbone, probablement un astéroïde capturé",
      funFact:
        "Phobos se rapproche lentement et s'écrasera sur Mars ou se fragmentera dans ~50 millions d'années.",
    },
  },
  deimos: {
    name: "Déimos",
    info: {
      description: "La plus petite lune externe de Mars, ne mesurant que 12 km.",
      composition: "Roche riche en carbone, similaire aux astéroïdes de type C",
      funFact: "Depuis Mars, Déimos ressemble à une étoile brillante plutôt qu'à une lune.",
    },
  },
  io: {
    name: "Io",
    info: {
      description:
        "Le corps le plus volcaniquement actif du système solaire, comprimé par les marées de Jupiter.",
      composition: "Roche silicatée ; surface de soufre et givre de dioxyde de soufre",
      funFact: "Io possède des centaines de volcans, certains éjectant des panaches à 500 km de hauteur.",
    },
  },
  europa: {
    name: "Europe",
    info: {
      description:
        "Une lune glacée cachant un océan d'eau liquide global sous sa coquille gelée — une cible prioritaire dans la recherche de vie.",
      composition: "Croûte de glace d'eau sur un océan salé ; manteau silicaté, noyau de fer",
      funFact:
        "L'océan caché d'Europe pourrait contenir deux fois plus d'eau que tous les océans terrestres réunis.",
    },
  },
  ganymede: {
    name: "Ganymède",
    info: {
      description: "La plus grande lune du système solaire — plus grande que la planète Mercure.",
      composition: "Environ moitié glace d'eau, moitié roche silicatée ; noyau de fer",
      funFact: "Ganymède est la seule lune connue à posséder son propre champ magnétique.",
    },
  },
  callisto: {
    name: "Callisto",
    info: {
      description:
        "Un monde sombre et ancien avec la surface la plus cratérisée du système solaire.",
      composition: "Mélange de roche et de glace d'eau ; possible océan souterrain",
      funFact:
        "La surface de Callisto a environ 4 milliards d'années — presque inchangée depuis sa formation.",
    },
  },
  mimas: {
    name: "Mimas",
    info: {
      description:
        "Une petite lune glacée dont le grand cratère Herschel lui donne l'apparence de l'Étoile de la Mort.",
      composition: "Glace d'eau presque pure",
      funFact:
        "Le cratère Herschel mesure 139 km de large — un tiers du diamètre de Mimante elle-même.",
    },
  },
  enceladus: {
    name: "Encelade",
    info: {
      description: "Une lune glacée brillante qui projette des geysers d'eau depuis son pôle sud.",
      composition: "Glace d'eau sur un océan souterrain global ; noyau rocheux",
      funFact: "Les geysers d'Encelade alimentent l'anneau E de Saturne en particules de glace.",
    },
  },
  tethys: {
    name: "Téthys",
    info: {
      description:
        "Une lune glacée de taille moyenne de Saturne, marquée par l'énorme cratère Odysseus et le canyon Ithaca Chasma.",
      composition: "Glace d'eau presque entièrement",
      funFact:
        "Ithaca Chasma est un canyon qui s'étend sur les trois quarts du tour de Téthys.",
    },
  },
  dione: {
    name: "Dioné",
    info: {
      description: "Une lune glacée de Saturne striée de brillantes falaises de glace « vaporeuses ».",
      composition: "Principalement de la glace d'eau avec un noyau rocheux",
      funFact:
        "Les stries vaporeuses de Dioné sont des falaises de glace de plusieurs centaines de mètres de hauteur.",
    },
  },
  rhea: {
    name: "Rhéa",
    info: {
      description: "La deuxième plus grande lune de Saturne, une boule froide et cratérisée de glace et de roche.",
      composition: "~75 % de glace d'eau, ~25 % de roche",
      funFact: "Rhéa aurait autrefois pu posséder son propre faible système d'anneaux.",
    },
  },
  titan: {
    name: "Titan",
    info: {
      description:
        "La plus grande lune de Saturne — la seule lune avec une épaisse atmosphère et des lacs de méthane liquide.",
      composition: "Croûte de glace d'eau ; atmosphère d'azote plus dense que celle de la Terre",
      funFact:
        "Les pluies et rivières de méthane de Titan en font le seul autre monde avec des liquides en surface.",
    },
  },
  iapetus: {
    name: "Japet",
    info: {
      description:
        "La lune à deux faces de Saturne : un hémisphère est aussi sombre que du charbon, l'autre aussi brillant que la neige.",
      composition: "Principalement de la glace d'eau ; revêtement sombre riche en carbone d'un côté",
      funFact: "Japet possède une mystérieuse chaîne de montagnes équatoriale atteignant 13 km de hauteur.",
    },
  },
  miranda: {
    name: "Miranda",
    info: {
      description: "La lune la plus étrange d'Uranus, un patchwork désordonné de falaises et de canyons.",
      composition: "Glace d'eau et roche silicatée",
      funFact:
        "Verona Rupes sur Miranda serait la plus haute falaise du système solaire (~20 km).",
    },
  },
  ariel: {
    name: "Ariel",
    info: {
      description: "La plus brillante des lunes d'Uranus, avec des vallées et des crêtes relativement jeunes.",
      composition: "Glace d'eau et roche, avec possible glace d'ammoniac",
      funFact: "La surface d'Ariel est la plus jeune parmi les principales lunes d'Uranus.",
    },
  },
  umbriel: {
    name: "Umbriel",
    info: {
      description: "La plus sombre des grandes lunes d'Uranus, ancienne et fortement cratérisée.",
      composition: "Glace d'eau et roche avec matière de surface sombre",
      funFact:
        "Un anneau brillant et mystérieux appelé le « cheerio fluorescent » se trouve dans son cratère Wunda.",
    },
  },
  titania: {
    name: "Titania",
    info: {
      description: "La plus grande lune d'Uranus, marquée par d'immenses canyons de failles.",
      composition: "Environ moitié glace d'eau, moitié roche",
      funFact: "Le canyon Messina Chasma de Titania s'étend sur environ 1 500 km.",
    },
  },
  oberon: {
    name: "Obéron",
    info: {
      description: "La lune large la plus éloignée d'Uranus, vieille, sombre et cratérisée.",
      composition: "Glace d'eau et roche avec une possible couche océanique",
      funFact:
        "Obéron, comme toutes les lunes uraniennes, est nommé d'après un personnage de Shakespeare — le roi des fées.",
    },
  },
  triton: {
    name: "Triton",
    info: {
      description:
        "La grande lune de Neptune, orbitant à l'envers — presque certainement un objet capturé de la ceinture de Kuiper.",
      composition: "Surface de glace d'azote sur roche et métal ; fine atmosphère d'azote",
      funFact:
        "L'orbite rétrograde de Triton signifie que les marées de Neptune finiront par le déchirer.",
    },
  },
  iss: {
    name: "ISS",
    info: {
      description:
        "La Station spatiale internationale, un laboratoire de recherche de la taille d'un terrain de football en orbite autour de la Terre toutes les ~92 minutes, habitée en continu depuis novembre 2000.",
      composition:
        "Modules en aluminium, segments de poutre en acier et huit ailes de panneaux solaires ; ~915 m³ de volume pressurisé",
      funFact:
        "L'ISS voyage à environ 28 000 km/h — son équipage voit 16 levers et couchers de soleil chaque jour.",
    },
  },
};
