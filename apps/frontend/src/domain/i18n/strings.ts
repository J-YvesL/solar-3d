import type { Locale } from "./locale";

export type UiKey =
  | "loading"
  | "errorTitle"
  | "retry"
  | "back"
  | "hint"
  | "localTime"
  | "composition"
  | "radius"
  | "orbitalPeriod"
  | "dayLength"
  | "distanceFromSun"
  | "distanceFromParent"
  | "moons"
  | "hours"
  | "days"
  | "years"
  | "typeStar"
  | "typePlanet"
  | "typeMoon"
  | "madeBy";

type Dict = Record<UiKey, string>;

const dicts: Record<Locale, Dict> = {
  en: {
    loading: "Loading the solar system…",
    errorTitle: "Could not load the solar system.",
    retry: "Retry",
    back: "← Back",
    hint: "Click a planet to explore — drag to rotate, scroll to zoom",
    localTime: "Your local time",
    composition: "Composition",
    radius: "Radius",
    orbitalPeriod: "Orbital period",
    dayLength: "Day length (rotation)",
    distanceFromSun: "Distance from Sun",
    distanceFromParent: "Distance from {parent}",
    moons: "Moons",
    hours: "hours",
    days: "days",
    years: "years",
    typeStar: "star",
    typePlanet: "planet",
    typeMoon: "moon",
    madeBy: "Made by {author} with ❤️",
  },
  fr: {
    loading: "Chargement du système solaire…",
    errorTitle: "Impossible de charger le système solaire.",
    retry: "Réessayer",
    back: "← Retour",
    hint: "Cliquez sur une planète pour l’explorer — glissez pour pivoter, molette pour zoomer",
    localTime: "Votre heure locale",
    composition: "Composition",
    radius: "Rayon",
    orbitalPeriod: "Période orbitale",
    dayLength: "Durée du jour (rotation)",
    distanceFromSun: "Distance au Soleil",
    distanceFromParent: "Distance à {parent}",
    moons: "Lunes",
    hours: "heures",
    days: "jours",
    years: "ans",
    typeStar: "étoile",
    typePlanet: "planète",
    typeMoon: "lune",
    madeBy: "Réalisé par {author} avec ❤️",
  },
  es: {
    loading: "Cargando el sistema solar…",
    errorTitle: "No se pudo cargar el sistema solar.",
    retry: "Reintentar",
    back: "← Volver",
    hint: "Haz clic en un planeta para explorarlo — arrastra para rotar, rueda para hacer zoom",
    localTime: "Tu hora local",
    composition: "Composición",
    radius: "Radio",
    orbitalPeriod: "Período orbital",
    dayLength: "Duración del día (rotación)",
    distanceFromSun: "Distancia al Sol",
    distanceFromParent: "Distancia a {parent}",
    moons: "Lunas",
    hours: "horas",
    days: "días",
    years: "años",
    typeStar: "estrella",
    typePlanet: "planeta",
    typeMoon: "luna",
    madeBy: "Hecho por {author} con ❤️",
  },
  it: {
    loading: "Caricamento del sistema solare…",
    errorTitle: "Impossibile caricare il sistema solare.",
    retry: "Riprova",
    back: "← Indietro",
    hint: "Clicca su un pianeta per esplorarlo — trascina per ruotare, rotella per zoomare",
    localTime: "La tua ora locale",
    composition: "Composizione",
    radius: "Raggio",
    orbitalPeriod: "Periodo orbitale",
    dayLength: "Durata del giorno (rotazione)",
    distanceFromSun: "Distanza dal Sole",
    distanceFromParent: "Distanza da {parent}",
    moons: "Lune",
    hours: "ore",
    days: "giorni",
    years: "anni",
    typeStar: "stella",
    typePlanet: "pianeta",
    typeMoon: "luna",
    madeBy: "Realizzato da {author} con ❤️",
  },
  de: {
    loading: "Sonnensystem wird geladen…",
    errorTitle: "Das Sonnensystem konnte nicht geladen werden.",
    retry: "Erneut versuchen",
    back: "← Zurück",
    hint: "Klicke auf einen Planeten — ziehen zum Drehen, scrollen zum Zoomen",
    localTime: "Deine Ortszeit",
    composition: "Zusammensetzung",
    radius: "Radius",
    orbitalPeriod: "Umlaufzeit",
    dayLength: "Tageslänge (Rotation)",
    distanceFromSun: "Abstand zur Sonne",
    distanceFromParent: "Abstand zu {parent}",
    moons: "Monde",
    hours: "Stunden",
    days: "Tage",
    years: "Jahre",
    typeStar: "Stern",
    typePlanet: "Planet",
    typeMoon: "Mond",
    madeBy: "Erstellt von {author} mit ❤️",
  },
};

/** Returns the localized string for `key`, replacing `{placeholder}` tokens from `params`. */
export function t(locale: Locale, key: UiKey, params?: Record<string, string>): string {
  let s = dicts[locale][key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(`{${k}}`, v);
    }
  }
  return s;
}
