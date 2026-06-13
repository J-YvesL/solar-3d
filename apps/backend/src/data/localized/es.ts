import type { BodyInfo } from "@solar/shared";

export const localizedBodies: Record<string, { name: string; info: BodyInfo }> = {
  sun: {
    name: "Sol",
    info: {
      description:
        "La estrella en el centro de nuestro sistema solar, una esfera casi perfecta de plasma caliente que contiene el 99,86 % de la masa del sistema.",
      composition: "~73 % hidrógeno, ~25 % helio, trazas de oxígeno, carbono, hierro",
      funFact: "Un millón de Tierras cabrían dentro del Sol.",
    },
  },
  mercury: {
    name: "Mercurio",
    info: {
      description:
        "El planeta más pequeño y el más cercano al Sol, con una superficie muy craterizada y casi sin atmósfera.",
      composition: "Gran núcleo de hierro (~60 % de la masa), manto y corteza silicatados",
      funFact:
        "Un año en Mercurio (88 días) es más corto que su ciclo completo día–noche (176 días terrestres).",
    },
  },
  venus: {
    name: "Venus",
    info: {
      description:
        "El «gemelo» de la Tierra en tamaño, envuelta en una aplastante atmósfera de CO₂ con nubes de ácido sulfúrico — el planeta más caliente.",
      composition: "Cuerpo rocoso; atmósfera de 96,5 % CO₂, presión superficial 92 veces la de la Tierra",
      funFact: "Venus gira al revés: su Sol sale por el oeste y se pone por el este.",
    },
  },
  earth: {
    name: "Tierra",
    info: {
      description:
        "El único mundo conocido que alberga vida, con agua líquida cubriendo el 71 % de su superficie.",
      composition: "Núcleo de hierro y níquel, manto silicatado; atmósfera de 78 % N₂, 21 % O₂",
      funFact: "La Tierra es el planeta más denso del sistema solar.",
    },
  },
  mars: {
    name: "Marte",
    info: {
      description:
        "El planeta rojo, un frío mundo desértico con el volcán más grande y el cañón más profundo del sistema solar.",
      composition:
        "Roca basáltica rica en hierro; tenue atmósfera de CO₂ (menos del 1 % de la presión terrestre)",
      funFact: "El Olympus Mons en Marte tiene aproximadamente 2,5 veces la altura del Everest.",
    },
  },
  jupiter: {
    name: "Júpiter",
    info: {
      description:
        "El planeta más grande — un gigante gaseoso cuya Gran Mancha Roja es una tormenta más ancha que la Tierra que lleva siglos rugiendo.",
      composition: "~90 % hidrógeno, ~10 % helio; posible núcleo rocoso",
      funFact: "Júpiter es más del doble de masivo que todos los demás planetas combinados.",
    },
  },
  saturn: {
    name: "Saturno",
    info: {
      description:
        "El gigante gaseoso con anillos: sus espectaculares anillos están formados por innumerables fragmentos de hielo y roca.",
      composition:
        "~96 % hidrógeno, ~3 % helio; partículas de anillo heladas de metros a centímetros",
      funFact:
        "La densidad media de Saturno es menor que la del agua — flotaría en una bañera suficientemente grande.",
    },
  },
  uranus: {
    name: "Urano",
    info: {
      description:
        "Un gigante de hielo que rota de lado, con un color cian pálido por el metano en su atmósfera.",
      composition: "«Hielos» de agua, metano y amoníaco sobre un núcleo rocoso; atmósfera de H₂/He",
      funFact:
        "El eje de Urano está inclinado 98°: cada polo recibe 42 años de luz solar y luego 42 años de noche.",
    },
  },
  neptune: {
    name: "Neptuno",
    info: {
      description:
        "El planeta más lejano, un gigante de hielo azul oscuro con los vientos más rápidos del sistema solar (hasta 2 100 km/h).",
      composition: "Hielos de agua, metano y amoníaco; atmósfera de H₂/He con metano",
      funFact:
        "Neptuno fue descubierto por las matemáticas: su posición se predijo antes de observarlo.",
    },
  },
  moon: {
    name: "Luna",
    info: {
      description:
        "El único satélite natural de la Tierra, cuya gravedad impulsa las mareas oceánicas.",
      composition: "Roca silicatada; pequeño núcleo de hierro; sin atmósfera",
      funFact: "La Luna siempre muestra a la Tierra la misma cara — está en rotación síncrona.",
    },
  },
  phobos: {
    name: "Fobos",
    info: {
      description:
        "La mayor y más cercana de las dos pequeñas lunas de Marte, orbitando más rápido que Marte gira.",
      composition: "Roca y regolito ricos en carbono, posiblemente un asteroide capturado",
      funFact:
        "Fobos se acerca lentamente y chocará con Marte o se fragmentará en ~50 millones de años.",
    },
  },
  deimos: {
    name: "Deimos",
    info: {
      description: "La luna exterior y más pequeña de Marte, con solo 12 km de diámetro.",
      composition: "Roca rica en carbono, similar a los asteroides de tipo C",
      funFact: "Desde Marte, Deimos parece una estrella brillante más que una luna.",
    },
  },
  io: {
    name: "Ío",
    info: {
      description:
        "El cuerpo más volcánicamente activo del sistema solar, comprimido por las mareas de Júpiter.",
      composition: "Roca silicatada; superficie de azufre y escarcha de dióxido de azufre",
      funFact: "Ío tiene cientos de volcanes, algunos con erupciones que alcanzan 500 km de altura.",
    },
  },
  europa: {
    name: "Europa",
    info: {
      description:
        "Una luna helada que oculta un océano de agua líquida global bajo su corteza congelada — un objetivo prioritario en la búsqueda de vida.",
      composition: "Corteza de hielo de agua sobre un océano salado; manto silicatado, núcleo de hierro",
      funFact:
        "El océano oculto de Europa puede contener el doble de agua que todos los océanos de la Tierra.",
    },
  },
  ganymede: {
    name: "Ganimedes",
    info: {
      description: "La luna más grande del sistema solar — más grande que el planeta Mercurio.",
      composition: "Aproximadamente la mitad hielo de agua, la mitad roca silicatada; núcleo de hierro",
      funFact: "Ganimedes es la única luna que se sabe que tiene su propio campo magnético.",
    },
  },
  callisto: {
    name: "Calisto",
    info: {
      description:
        "Un mundo oscuro y antiguo con la superficie más craterizada del sistema solar.",
      composition: "Mezcla de roca y hielo de agua; posible océano subsuperficial",
      funFact:
        "La superficie de Calisto tiene unos 4 000 millones de años — casi sin cambios desde su formación.",
    },
  },
  mimas: {
    name: "Mimas",
    info: {
      description:
        "Una pequeña luna helada cuyo enorme cráter Herschel la hace parecer la Estrella de la Muerte.",
      composition: "Hielo de agua casi puro",
      funFact:
        "El cráter Herschel tiene 139 km de ancho — un tercio del propio diámetro de Mimas.",
    },
  },
  enceladus: {
    name: "Encélado",
    info: {
      description: "Una brillante luna helada que lanza géiseres de agua desde su polo sur.",
      composition: "Hielo de agua sobre un océano subsuperficial global; núcleo rocoso",
      funFact: "Los géiseres de Encélado alimentan el anillo E de Saturno con partículas de hielo.",
    },
  },
  tethys: {
    name: "Tetis",
    info: {
      description:
        "Una luna helada de tamaño mediano de Saturno, marcada por el enorme cráter Odiseo y el cañón Ithaca Chasma.",
      composition: "Casi enteramente hielo de agua",
      funFact:
        "Ithaca Chasma es un cañón que se extiende tres cuartas partes alrededor de Tetis.",
    },
  },
  dione: {
    name: "Dione",
    info: {
      description:
        "Una luna helada de Saturno surcada de brillantes acantilados de hielo «vaporosos».",
      composition: "Principalmente hielo de agua con un núcleo rocoso",
      funFact:
        "Las estrías vaporosas de Dione son acantilados de hielo de cientos de metros de altura.",
    },
  },
  rhea: {
    name: "Rea",
    info: {
      description: "La segunda luna más grande de Saturno, una fría bola craterizada de hielo y roca.",
      composition: "~75 % hielo de agua, ~25 % roca",
      funFact: "Rea podría haber tenido en algún momento su propio tenue sistema de anillos.",
    },
  },
  titan: {
    name: "Titán",
    info: {
      description:
        "La luna más grande de Saturno — la única luna con una atmósfera densa y lagos de metano líquido.",
      composition: "Corteza de hielo de agua; atmósfera de nitrógeno más densa que la de la Tierra",
      funFact:
        "La lluvia y los ríos de metano de Titán lo convierten en el único otro mundo con líquido en su superficie.",
    },
  },
  iapetus: {
    name: "Jápeto",
    info: {
      description:
        "La luna de dos caras de Saturno: un hemisferio es negro como el carbón, el otro brillante como la nieve.",
      composition: "Principalmente hielo de agua; recubrimiento oscuro rico en carbono en un lado",
      funFact: "Jápeto tiene una misteriosa cordillera ecuatorial de hasta 13 km de altura.",
    },
  },
  miranda: {
    name: "Miranda",
    info: {
      description:
        "La luna más extraña de Urano, un confuso mosaico de acantilados y cañones.",
      composition: "Hielo de agua y roca silicatada",
      funFact:
        "Verona Rupes en Miranda puede ser el acantilado más alto del sistema solar (~20 km).",
    },
  },
  ariel: {
    name: "Ariel",
    info: {
      description: "La más brillante de las lunas de Urano, con valles y crestas relativamente jóvenes.",
      composition: "Hielo de agua y roca, con posible hielo de amoníaco",
      funFact: "La superficie de Ariel es la más joven de las principales lunas de Urano.",
    },
  },
  umbriel: {
    name: "Umbriel",
    info: {
      description: "La más oscura de las grandes lunas de Urano, antigua y muy craterizada.",
      composition: "Hielo de agua y roca con material superficial oscuro",
      funFact:
        "Un brillante y misterioso anillo llamado el «aro fluorescente» se encuentra en su cráter Wunda.",
    },
  },
  titania: {
    name: "Titania",
    info: {
      description: "La luna más grande de Urano, marcada por enormes cañones de falla.",
      composition: "Aproximadamente la mitad hielo de agua, la mitad roca",
      funFact: "El cañón Messina Chasma de Titania se extiende aproximadamente 1 500 km.",
    },
  },
  oberon: {
    name: "Oberón",
    info: {
      description: "La luna grande más exterior de Urano, vieja, oscura y craterizada.",
      composition: "Hielo de agua y roca con una posible capa de océano",
      funFact:
        "Oberón, como todas las lunas uranianas, lleva el nombre de un personaje de Shakespeare — el rey de las hadas.",
    },
  },
  triton: {
    name: "Tritón",
    info: {
      description:
        "La gran luna de Neptuno, orbitando en sentido contrario — casi con certeza un objeto capturado del cinturón de Kuiper.",
      composition: "Superficie de hielo de nitrógeno sobre roca y metal; tenue atmósfera de nitrógeno",
      funFact:
        "La órbita retrógrada de Tritón significa que las mareas de Neptuno acabarán por desgarrarlo.",
    },
  },
  pluto: {
    name: "Plutón",
    info: {
      description:
        "El mayor planeta enano, un mundo helado en lo profundo del cinturón de Kuiper, famoso por su llanura de hielo de nitrógeno con forma de corazón cartografiada por New Horizons en 2015.",
      composition:
        "Núcleo de roca y hielo de agua bajo una corteza de hielos de nitrógeno, metano y monóxido de carbono; tenue atmósfera de nitrógeno",
      funFact:
        "Plutón y su luna Caronte son tan parecidos en tamaño que orbitan un punto en el espacio vacío entre ambos — un verdadero sistema doble.",
    },
  },
  charon: {
    name: "Caronte",
    info: {
      description:
        "La mayor luna de Plutón, con la mitad del ancho del propio Plutón, con un casquete polar oscuro y rojizo apodado Mordor.",
      composition: "Hielo de agua y roca; poca o ninguna atmósfera",
      funFact:
        "Caronte y Plutón se muestran permanentemente la misma cara — están mutuamente anclados por las mareas.",
    },
  },
  iss: {
    name: "ISS",
    info: {
      description:
        "La Estación Espacial Internacional, un laboratorio de investigación del tamaño de un campo de fútbol americano en órbita alrededor de la Tierra cada ~92 minutos, habitada continuamente desde noviembre de 2000.",
      composition:
        "Módulos de aluminio, segmentos de celosía de acero y ocho alas de paneles solares; ~915 m³ de volumen presurizado",
      funFact:
        "La ISS viaja a unos 28 000 km/h — su tripulación ve 16 amaneceres y atardeceres cada día.",
    },
  },
};
