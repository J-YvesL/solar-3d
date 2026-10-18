import type { BodyInfo } from "@solar/shared";

/** Info-panel texts for all 32 bodies (Table 4, doc 03). */
export const bodyInfo: Record<string, BodyInfo> = {
  sun: {
    description:
      "The star at the center of our solar system, a near-perfect sphere of hot plasma that contains 99.86% of the system's mass.",
    composition: "~73% hydrogen, ~25% helium, traces of oxygen, carbon, iron",
    funFact: "One million Earths could fit inside the Sun.",
  },
  mercury: {
    description:
      "The smallest planet and the closest to the Sun, with a heavily cratered surface and almost no atmosphere.",
    composition: "Large iron core (~60% of mass), silicate mantle and crust",
    funFact:
      "A year on Mercury (88 days) is shorter than its full day–night cycle (176 Earth days).",
  },
  venus: {
    description:
      "Earth's \"twin\" in size, wrapped in a crushing CO₂ atmosphere with clouds of sulfuric acid — the hottest planet.",
    composition: "Rocky body; atmosphere of 96.5% CO₂, surface pressure 92× Earth's",
    funFact: "Venus spins backwards: its Sun rises in the west and sets in the east.",
  },
  earth: {
    description:
      "The only known world to harbor life, with liquid water covering 71% of its surface.",
    composition: "Iron-nickel core, silicate mantle; atmosphere of 78% N₂, 21% O₂",
    funFact: "Earth is the densest planet in the solar system.",
  },
  mars: {
    description:
      "The red planet, a cold desert world with the largest volcano and the deepest canyon in the solar system.",
    composition:
      "Iron-rich basaltic rock; thin CO₂ atmosphere (less than 1% of Earth's pressure)",
    funFact: "Olympus Mons on Mars is about 2.5 times the height of Mount Everest.",
  },
  jupiter: {
    description:
      "The largest planet — a gas giant whose Great Red Spot is a storm wider than Earth that has raged for centuries.",
    composition: "~90% hydrogen, ~10% helium; possible rocky core",
    funFact: "Jupiter is more than twice as massive as all the other planets combined.",
  },
  saturn: {
    description:
      "The ringed gas giant: its spectacular rings are made of countless ice and rock fragments.",
    composition: "~96% hydrogen, ~3% helium; icy ring particles from meters to centimeters",
    funFact:
      "Saturn's average density is lower than water — it would float in a big enough bathtub.",
  },
  uranus: {
    description:
      "An ice giant that rotates on its side, with a pale cyan color from methane in its atmosphere.",
    composition: "Water, methane and ammonia \"ices\" over a rocky core; H₂/He atmosphere",
    funFact:
      "Uranus's axis is tilted 98°: each pole gets 42 years of daylight, then 42 years of night.",
  },
  neptune: {
    description:
      "The farthest planet, a deep-blue ice giant with the fastest winds in the solar system (up to 2 100 km/h).",
    composition: "Water, methane and ammonia ices; H₂/He atmosphere with methane",
    funFact: "Neptune was discovered by mathematics: its position was predicted before it was seen.",
  },
  moon: {
    description: "Earth's only natural satellite, whose gravity drives the ocean tides.",
    composition: "Silicate rock; small iron core; no atmosphere",
    funFact: "The Moon always shows Earth the same face — it is tidally locked.",
  },
  phobos: {
    description: "The larger and closer of Mars's two tiny moons, orbiting faster than Mars rotates.",
    composition: "Carbon-rich rock and regolith, possibly a captured asteroid",
    funFact:
      "Phobos spirals slowly inward and will crash into Mars or break apart in ~50 million years.",
  },
  deimos: {
    description: "The smaller, outer moon of Mars, just 12 km across.",
    composition: "Carbon-rich rock, similar to C-type asteroids",
    funFact: "From Mars, Deimos looks like a bright star rather than a moon.",
  },
  io: {
    description:
      "The most volcanically active body in the solar system, squeezed by Jupiter's tides.",
    composition: "Silicate rock; surface of sulfur and sulfur dioxide frost",
    funFact: "Io has hundreds of volcanoes, some erupting plumes 500 km high.",
  },
  europa: {
    description:
      "An icy moon hiding a global liquid-water ocean beneath its frozen shell — a prime target in the search for life.",
    composition: "Water-ice crust over a salty ocean; silicate mantle, iron core",
    funFact: "Europa's hidden ocean may hold twice as much water as all of Earth's oceans.",
  },
  ganymede: {
    description: "The largest moon in the solar system — bigger than the planet Mercury.",
    composition: "Roughly half water ice, half silicate rock; iron core",
    funFact: "Ganymede is the only moon known to have its own magnetic field.",
  },
  callisto: {
    description:
      "A dark, ancient world with the most heavily cratered surface in the solar system.",
    composition: "Mix of rock and water ice; possible subsurface ocean",
    funFact: "Callisto's surface is about 4 billion years old — almost unchanged since its formation.",
  },
  mimas: {
    description:
      "A small icy moon whose giant crater Herschel makes it look like the Death Star.",
    composition: "Almost pure water ice",
    funFact: "The crater Herschel is 139 km wide — a third of Mimas's own diameter.",
  },
  enceladus: {
    description: "A bright icy moon that shoots geysers of water from its south pole.",
    composition: "Water ice over a global subsurface ocean; rocky core",
    funFact: "Enceladus's geysers feed Saturn's E ring with ice particles.",
  },
  tethys: {
    description:
      "A mid-sized icy moon of Saturn, scarred by the huge Odysseus crater and the Ithaca Chasma canyon.",
    composition: "Almost entirely water ice",
    funFact: "Ithaca Chasma is a canyon stretching three quarters of the way around Tethys.",
  },
  dione: {
    description: "An icy Saturn moon streaked with bright \"wispy\" ice cliffs.",
    composition: "Mostly water ice with a rocky core",
    funFact: "Dione's wispy streaks are cliffs of ice hundreds of meters high.",
  },
  rhea: {
    description: "Saturn's second-largest moon, a cold, cratered ball of ice and rock.",
    composition: "~75% water ice, ~25% rock",
    funFact: "Rhea may once have had its own faint ring system.",
  },
  titan: {
    description:
      "Saturn's largest moon — the only moon with a thick atmosphere, and lakes of liquid methane.",
    composition: "Water-ice crust; nitrogen atmosphere denser than Earth's",
    funFact:
      "Titan's methane rain and rivers make it the only other world with standing liquid on its surface.",
  },
  iapetus: {
    description: "Saturn's two-faced moon: one hemisphere is coal-dark, the other bright as snow.",
    composition: "Mostly water ice; dark carbon-rich coating on one side",
    funFact: "Iapetus has a mysterious equatorial mountain ridge up to 13 km high.",
  },
  miranda: {
    description: "Uranus's strangest moon, a jumbled patchwork of cliffs and canyons.",
    composition: "Water ice and silicate rock",
    funFact:
      "Verona Rupes on Miranda may be the tallest cliff in the solar system (~20 km).",
  },
  ariel: {
    description:
      "The brightest of Uranus's moons, with relatively young valleys and ridges.",
    composition: "Water ice and rock, with possible ammonia ice",
    funFact: "Ariel's surface is the youngest of Uranus's major moons.",
  },
  umbriel: {
    description: "The darkest of Uranus's large moons, ancient and heavily cratered.",
    composition: "Water ice and rock with dark surface material",
    funFact:
      "A bright mysterious ring called the \"fluorescent cheerio\" sits in its crater Wunda.",
  },
  titania: {
    description: "The largest moon of Uranus, marked by huge fault canyons.",
    composition: "Roughly half water ice, half rock",
    funFact: "Titania's canyon Messina Chasma stretches about 1 500 km.",
  },
  oberon: {
    description: "The outermost large moon of Uranus, old, dark and cratered.",
    composition: "Water ice and rock with a possible ocean layer",
    funFact:
      "Oberon, like all Uranian moons, is named after a Shakespeare character — the fairy king.",
  },
  triton: {
    description:
      "Neptune's giant moon, orbiting backwards — almost certainly a captured Kuiper Belt object.",
    composition: "Nitrogen-ice surface over rock and metal; thin nitrogen atmosphere",
    funFact: "Triton's retrograde orbit means Neptune's tides will eventually tear it apart.",
  },
  pluto: {
    description:
      "The largest dwarf planet, a frozen world far out in the Kuiper Belt, famous for the heart-shaped plain of nitrogen ice mapped by New Horizons in 2015.",
    composition: "Rock and water-ice core under a crust of nitrogen, methane and carbon-monoxide ices; a thin nitrogen atmosphere",
    funFact:
      "Pluto and its moon Charon are so close in size that they orbit a point in empty space between them — a true double system.",
  },
  charon: {
    description:
      "Pluto's largest moon, fully half the width of Pluto itself, with a dark reddish polar cap nicknamed Mordor.",
    composition: "Water ice and rock; little to no atmosphere",
    funFact: "Charon and Pluto permanently show each other the same face — they are mutually tidally locked.",
  },
  iss: {
    description:
      "The International Space Station, a football-field-sized research laboratory orbiting Earth every ~92 minutes, continuously inhabited since November 2000.",
    composition:
      "Aluminium modules, steel truss segments and eight solar array wings; ~915 m³ of pressurized volume",
    funFact:
      "The ISS travels at about 28 000 km/h — its crew sees 16 sunrises and sunsets every day.",
  },
};
