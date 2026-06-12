import type { BodyInfo } from "@solar/shared";

export const localizedBodies: Record<string, { name: string; info: BodyInfo }> = {
  sun: {
    name: "Sole",
    info: {
      description:
        "La stella al centro del nostro sistema solare, una sfera quasi perfetta di plasma caldo che contiene il 99,86 % della massa del sistema.",
      composition: "~73 % idrogeno, ~25 % elio, tracce di ossigeno, carbonio, ferro",
      funFact: "Un milione di Terre potrebbe stare all'interno del Sole.",
    },
  },
  mercury: {
    name: "Mercurio",
    info: {
      description:
        "Il pianeta più piccolo e il più vicino al Sole, con una superficie fortemente craterizzata e quasi nessuna atmosfera.",
      composition: "Grande nucleo di ferro (~60 % della massa), mantello e crosta silicatici",
      funFact:
        "Un anno su Mercurio (88 giorni) è più breve del suo ciclo giorno–notte completo (176 giorni terrestri).",
    },
  },
  venus: {
    name: "Venere",
    info: {
      description:
        "Il «gemello» della Terra per dimensioni, avvolto in una schiacciante atmosfera di CO₂ con nubi di acido solforico — il pianeta più caldo.",
      composition:
        "Corpo roccioso; atmosfera di 96,5 % CO₂, pressione superficiale 92 volte quella della Terra",
      funFact: "Venere ruota al contrario: il suo Sole sorge a ovest e tramonta a est.",
    },
  },
  earth: {
    name: "Terra",
    info: {
      description:
        "L'unico mondo conosciuto ad ospitare la vita, con acqua liquida che copre il 71 % della sua superficie.",
      composition: "Nucleo ferro-nichel, mantello silicatico; atmosfera di 78 % N₂, 21 % O₂",
      funFact: "La Terra è il pianeta più denso del sistema solare.",
    },
  },
  mars: {
    name: "Marte",
    info: {
      description:
        "Il pianeta rosso, un freddo mondo desertico con il vulcano più alto e il canyon più profondo del sistema solare.",
      composition:
        "Roccia basaltica ricca di ferro; sottile atmosfera di CO₂ (meno dell'1 % della pressione terrestre)",
      funFact: "L'Olympus Mons su Marte è alto circa 2,5 volte il Monte Everest.",
    },
  },
  jupiter: {
    name: "Giove",
    info: {
      description:
        "Il pianeta più grande — un gigante gassoso la cui Grande Macchia Rossa è una tempesta più larga della Terra che imperversa da secoli.",
      composition: "~90 % idrogeno, ~10 % elio; possibile nucleo roccioso",
      funFact: "Giove è più del doppio della massa di tutti gli altri pianeti messi insieme.",
    },
  },
  saturn: {
    name: "Saturno",
    info: {
      description:
        "Il gigante gassoso con gli anelli: i suoi spettacolari anelli sono composti da innumerevoli frammenti di ghiaccio e roccia.",
      composition:
        "~96 % idrogeno, ~3 % elio; particelle di ghiaccio negli anelli da metri a centimetri",
      funFact:
        "La densità media di Saturno è inferiore a quella dell'acqua — galleggerebbe in una vasca sufficientemente grande.",
    },
  },
  uranus: {
    name: "Urano",
    info: {
      description:
        "Un gigante di ghiaccio che ruota di fianco, con un colore ciano pallido dovuto al metano nella sua atmosfera.",
      composition:
        "«Ghiacci» di acqua, metano e ammoniaca su un nucleo roccioso; atmosfera H₂/He",
      funFact:
        "L'asse di Urano è inclinato di 98°: ogni polo riceve 42 anni di luce del giorno, poi 42 anni di notte.",
    },
  },
  neptune: {
    name: "Nettuno",
    info: {
      description:
        "Il pianeta più lontano, un gigante di ghiaccio blu scuro con i venti più veloci del sistema solare (fino a 2 100 km/h).",
      composition: "Ghiacci di acqua, metano e ammoniaca; atmosfera H₂/He con metano",
      funFact:
        "Nettuno è stato scoperto dalla matematica: la sua posizione è stata prevista prima di essere osservata.",
    },
  },
  moon: {
    name: "Luna",
    info: {
      description:
        "L'unico satellite naturale della Terra, la cui gravità genera le maree oceaniche.",
      composition: "Roccia silicatica; piccolo nucleo di ferro; nessuna atmosfera",
      funFact: "La Luna mostra sempre la stessa faccia alla Terra — è in rotazione sincrona.",
    },
  },
  phobos: {
    name: "Fobos",
    info: {
      description:
        "Il più grande e vicino dei due piccoli satelliti di Marte, che orbita più velocemente di quanto Marte ruoti.",
      composition: "Roccia e regolite ricche di carbonio, probabilmente un asteroide catturato",
      funFact:
        "Fobos si avvicina lentamente e si schiaccerà su Marte o si frantumerà in ~50 milioni di anni.",
    },
  },
  deimos: {
    name: "Deimos",
    info: {
      description: "Il satellite esterno più piccolo di Marte, largo solo 12 km.",
      composition: "Roccia ricca di carbonio, simile agli asteroidi di tipo C",
      funFact: "Da Marte, Deimos sembra una stella luminosa piuttosto che una luna.",
    },
  },
  io: {
    name: "Io",
    info: {
      description:
        "Il corpo più vulcanicamente attivo del sistema solare, compresso dalle maree di Giove.",
      composition: "Roccia silicatica; superficie di zolfo e brina di biossido di zolfo",
      funFact: "Io ha centinaia di vulcani, alcuni con pennacchi eruttivi alti 500 km.",
    },
  },
  europa: {
    name: "Europa",
    info: {
      description:
        "Un satellite ghiacciato che nasconde un oceano globale di acqua liquida sotto il suo guscio congelato — un obiettivo prioritario nella ricerca della vita.",
      composition: "Crosta di ghiaccio d'acqua su un oceano salato; mantello silicatico, nucleo di ferro",
      funFact:
        "L'oceano nascosto di Europa potrebbe contenere il doppio dell'acqua di tutti gli oceani terrestri.",
    },
  },
  ganymede: {
    name: "Ganimede",
    info: {
      description: "Il satellite più grande del sistema solare — più grande del pianeta Mercurio.",
      composition: "Circa metà ghiaccio d'acqua, metà roccia silicatica; nucleo di ferro",
      funFact: "Ganimede è l'unico satellite conosciuto ad avere un proprio campo magnetico.",
    },
  },
  callisto: {
    name: "Callisto",
    info: {
      description:
        "Un mondo scuro e antico con la superficie più craterizzata del sistema solare.",
      composition: "Miscela di roccia e ghiaccio d'acqua; possibile oceano sotterraneo",
      funFact:
        "La superficie di Callisto ha circa 4 miliardi di anni — quasi invariata dalla sua formazione.",
    },
  },
  mimas: {
    name: "Mimante",
    info: {
      description:
        "Un piccolo satellite ghiacciato il cui enorme cratere Herschel lo fa sembrare la Morte Nera.",
      composition: "Ghiaccio d'acqua quasi puro",
      funFact: "Il cratere Herschel è largo 139 km — un terzo del diametro stesso di Mimante.",
    },
  },
  enceladus: {
    name: "Encelado",
    info: {
      description: "Un brillante satellite ghiacciato che lancia geyser d'acqua dal suo polo sud.",
      composition: "Ghiaccio d'acqua su un oceano sotterraneo globale; nucleo roccioso",
      funFact: "I geyser di Encelado alimentano l'anello E di Saturno con particelle di ghiaccio.",
    },
  },
  tethys: {
    name: "Teti",
    info: {
      description:
        "Un satellite ghiacciato di media grandezza di Saturno, segnato dall'enorme cratere Odisseo e dal canyon Ithaca Chasma.",
      composition: "Quasi interamente ghiaccio d'acqua",
      funFact:
        "Ithaca Chasma è un canyon che si estende per tre quarti del perimetro di Teti.",
    },
  },
  dione: {
    name: "Dione",
    info: {
      description:
        "Un satellite ghiacciato di Saturno solcato da brillanti scogliere di ghiaccio «vaporose».",
      composition: "Principalmente ghiaccio d'acqua con un nucleo roccioso",
      funFact:
        "Le striature vaporose di Dione sono scogliere di ghiaccio alte centinaia di metri.",
    },
  },
  rhea: {
    name: "Rea",
    info: {
      description:
        "Il secondo satellite più grande di Saturno, una fredda sfera craterizzata di ghiaccio e roccia.",
      composition: "~75 % ghiaccio d'acqua, ~25 % roccia",
      funFact: "Rea potrebbe aver avuto un tempo il proprio debole sistema di anelli.",
    },
  },
  titan: {
    name: "Titano",
    info: {
      description:
        "Il satellite più grande di Saturno — l'unico satellite con una spessa atmosfera e laghi di metano liquido.",
      composition: "Crosta di ghiaccio d'acqua; atmosfera di azoto più densa di quella terrestre",
      funFact:
        "Le piogge e i fiumi di metano di Titano ne fanno l'unico altro mondo con liquidi in superficie.",
    },
  },
  iapetus: {
    name: "Giapeto",
    info: {
      description:
        "Il satellite bifronte di Saturno: un emisfero è nero come il carbone, l'altro luminoso come la neve.",
      composition: "Principalmente ghiaccio d'acqua; rivestimento scuro ricco di carbonio su un lato",
      funFact: "Giapeto ha una misteriosa catena montuosa equatoriale alta fino a 13 km.",
    },
  },
  miranda: {
    name: "Miranda",
    info: {
      description:
        "Il satellite più strano di Urano, un caotico mosaico di scogliere e canyon.",
      composition: "Ghiaccio d'acqua e roccia silicatica",
      funFact:
        "Verona Rupes su Miranda potrebbe essere la scogliera più alta del sistema solare (~20 km).",
    },
  },
  ariel: {
    name: "Ariele",
    info: {
      description:
        "Il più brillante dei satelliti di Urano, con vallate e creste relativamente giovani.",
      composition: "Ghiaccio d'acqua e roccia, con possibile ghiaccio di ammoniaca",
      funFact: "La superficie di Ariele è la più giovane tra i principali satelliti di Urano.",
    },
  },
  umbriel: {
    name: "Umbriel",
    info: {
      description: "Il più scuro dei grandi satelliti di Urano, antico e pesantemente craterizzato.",
      composition: "Ghiaccio d'acqua e roccia con materiale superficiale scuro",
      funFact:
        "Un brillante e misterioso anello chiamato il «cheerio fluorescente» si trova nel suo cratere Wunda.",
    },
  },
  titania: {
    name: "Titania",
    info: {
      description: "Il satellite più grande di Urano, segnato da enormi canyon di faglia.",
      composition: "Circa metà ghiaccio d'acqua, metà roccia",
      funFact: "Il canyon Messina Chasma di Titania si estende per circa 1 500 km.",
    },
  },
  oberon: {
    name: "Oberon",
    info: {
      description: "Il satellite grande più esterno di Urano, vecchio, scuro e craterizzato.",
      composition: "Ghiaccio d'acqua e roccia con un possibile strato oceanico",
      funFact:
        "Oberon, come tutti i satelliti uraniani, prende il nome da un personaggio di Shakespeare — il re delle fate.",
    },
  },
  triton: {
    name: "Tritone",
    info: {
      description:
        "Il grande satellite di Nettuno, che orbita all'indietro — quasi certamente un oggetto catturato dalla fascia di Kuiper.",
      composition: "Superficie di ghiaccio d'azoto su roccia e metallo; sottile atmosfera d'azoto",
      funFact:
        "L'orbita retrograda di Tritone significa che le maree di Nettuno alla fine lo disgregheranno.",
    },
  },
};
