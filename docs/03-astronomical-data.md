# 03 — Astronomical Data (single source of truth)

Every number and every info text used in the project comes from this document. **Never invent, round differently, or "improve" a value** — copy these tables verbatim into `apps/backend/src/data/`.

## Conventions (read first)

- Angles in **degrees**, distances in **km** (orbital elements in **au** where stated), periods in **days** (orbits) or **hours** (rotation).
- `1 au = 149 597 870.7 km`. `earthRadiusKm = 6371` (used by frontend scaling, doc 05).
- **All periods are positive. Retrograde motion is never encoded with negative periods.** Instead:
  - A body **spins** counter-clockwise around its own axis; an `axialTiltDeg > 90°` (Venus 177.36°, Uranus 97.77°) makes the spin appear retrograde. This matches the IAU convention.
  - A moon **orbits** counter-clockwise in its orbital plane; an `inclinationDeg > 90°` (Triton 157°) makes the orbit appear retrograde.
- Moons use a **circular orbit approximation** (uniform angular speed). This is a deliberate POC simplification; their `meanLongitudeAtJ2000Deg` below is the starting angle.
- Earth uses the JPL "EM Bary" (Earth–Moon barycenter) elements — standard for this approximation level.

## Table 1 — Planet Keplerian elements at J2000 + rates per century

Source: JPL "Approximate Positions of the Planets", Table 1 (valid 1800–2050), mean ecliptic and equinox of J2000. First line = value at J2000, second line = change per Julian century (`/Cy`).

| Planet | a (au) | e | I (deg) | L (deg) | ϖ long.peri. (deg) | Ω long.node (deg) |
|---|---|---|---|---|---|---|
| Mercury | 0.38709927 | 0.20563593 | 7.00497902 | 252.25032350 | 77.45779628 | 48.33076593 |
| *rate* | 0.00000037 | 0.00001906 | −0.00594749 | 149472.67411175 | 0.16047689 | −0.12534081 |
| Venus | 0.72333566 | 0.00677672 | 3.39467605 | 181.97909950 | 131.60246718 | 76.67984255 |
| *rate* | 0.00000390 | −0.00004107 | −0.00078890 | 58517.81538729 | 0.00268329 | −0.27769418 |
| Earth | 1.00000261 | 0.01671123 | −0.00001531 | 100.46457166 | 102.93768193 | 0.0 |
| *rate* | 0.00000562 | −0.00004392 | −0.01294668 | 35999.37244981 | 0.32327364 | 0.0 |
| Mars | 1.52371034 | 0.09339410 | 1.84969142 | −4.55343205 | −23.94362959 | 49.55953891 |
| *rate* | 0.00001847 | 0.00007882 | −0.00813131 | 19140.30268499 | 0.44441088 | −0.29257343 |
| Jupiter | 5.20288700 | 0.04838624 | 1.30439695 | 34.39644051 | 14.72847983 | 100.47390909 |
| *rate* | −0.00011607 | −0.00013253 | −0.00183714 | 3034.74612775 | 0.21252668 | 0.20469106 |
| Saturn | 9.53667594 | 0.05386179 | 2.48599187 | 49.95424423 | 92.59887831 | 113.66242448 |
| *rate* | −0.00125060 | −0.00050991 | 0.00193609 | 1222.49362201 | −0.41897216 | −0.28867794 |
| Uranus | 19.18916464 | 0.04725744 | 0.77263783 | 313.23810451 | 170.95427630 | 74.01692503 |
| *rate* | −0.00196176 | −0.00004397 | −0.00242939 | 428.48202785 | 0.40805281 | 0.04240589 |
| Neptune | 30.06992276 | 0.00859048 | 1.77004347 | −55.12002969 | 44.96476227 | 131.78422574 |
| *rate* | 0.00026291 | 0.00005105 | 0.00035372 | 218.45945325 | −0.32241464 | −0.00508664 |

## Table 2 — Physical & display data: Sun and planets

| id | name | radiusKm | rotationPeriodHours | axialTiltDeg | orbitalPeriodDays | semiMajorAxisKm | color |
|---|---|---|---|---|---|---|---|
| sun | Sun | 695700 | 609.12 | 7.25 | — | — | `#FDB813` |
| mercury | Mercury | 2439.7 | 1407.5075 | 0.03 | 87.969 | 57909050 | `#9F8E84` |
| venus | Venus | 6051.8 | 5832.4436 | 177.36 | 224.701 | 108208000 | `#E6C89C` |
| earth | Earth | 6371.0 | 23.934472 | 23.44 | 365.256 | 149598023 | `#4F71BE` |
| mars | Mars | 3389.5 | 24.622962 | 25.19 | 686.980 | 227939366 | `#C1572D` |
| jupiter | Jupiter | 69911 | 9.924920 | 3.13 | 4332.589 | 778479000 | `#C8A97E` |
| saturn | Saturn | 58232 | 10.656222 | 26.73 | 10759.22 | 1433530000 | `#E3D1A8` |
| uranus | Uranus | 25362 | 17.240000 | 97.77 | 30688.5 | 2870972000 | `#9BD4D4` |
| neptune | Neptune | 24622 | 15.966300 | 28.32 | 60182 | 4500000000 | `#4565D5` |

Notes:
- `semiMajorAxisKm` here is informational/display data; the backend computes planet positions from Table 1 (in au), not from this column.
- For the planets' DTO fields `eccentricity` and `inclinationDeg` (doc 02), use the **J2000 values of Table 1** (columns `e` and `I`, first line of each planet — ignore the rates for these fields).
- Venus and Uranus have `axialTiltDeg > 90` and a positive rotation period — see Conventions.
- `rotationPeriodHours` values are sidereal periods derived from the IAU 2015 rotation rates (`8640 / |Ẇ deg·day⁻¹|`, source in Table 5). The 6-decimal precision is required: the rotation phase is anchored at J2000 (Table 5) and a rounded period would drift the day/night terminator by tens of degrees per decade (e.g. Saturn would be off by ~163° after 26 years with the 3-decimal value).

## Table 3 — Moons (20)

`a` = semi-major axis around the parent. `meanLongitudeAtJ2000Deg` (column `L₀`) is the orbital angle at J2000: the Moon's value is real; **all others are arbitrary fixed placeholders** (real moon ephemerides are out of scope) — they only guarantee a deterministic, reproducible layout. All these moons are tidally locked: `rotationPeriodHours = orbitalPeriodDays × 24`.

| id | name | parentId | a (km) | orbitalPeriodDays | inclinationDeg | radiusKm | L₀ (deg) | color |
|---|---|---|---|---|---|---|---|---|
| moon | Moon | earth | 384400 | 27.3217 | 5.145 | 1737.4 | 218.32 | `#B8B8B8` |
| phobos | Phobos | mars | 9376 | 0.3189 | 1.08 | 11.1 | 12 | `#8A7F72` |
| deimos | Deimos | mars | 23463 | 1.2624 | 1.79 | 6.2 | 245 | `#9C9286` |
| io | Io | jupiter | 421800 | 1.7691 | 0.04 | 1821.6 | 78 | `#E8D14C` |
| europa | Europa | jupiter | 671100 | 3.5512 | 0.47 | 1560.8 | 152 | `#D8CDBE` |
| ganymede | Ganymede | jupiter | 1070400 | 7.1546 | 0.18 | 2634.1 | 301 | `#9C8E7E` |
| callisto | Callisto | jupiter | 1882700 | 16.689 | 0.19 | 2410.3 | 224 | `#7A6F63` |
| mimas | Mimas | saturn | 185539 | 0.9420 | 1.57 | 198.2 | 35 | `#B4B0AA` |
| enceladus | Enceladus | saturn | 237948 | 1.3702 | 0.01 | 252.1 | 98 | `#E8EAEA` |
| tethys | Tethys | saturn | 294619 | 1.8878 | 1.12 | 531.1 | 167 | `#C9C5BD` |
| dione | Dione | saturn | 377396 | 2.7369 | 0.02 | 561.4 | 233 | `#B9B4AC` |
| rhea | Rhea | saturn | 527108 | 4.5175 | 0.35 | 763.8 | 312 | `#ABA69E` |
| titan | Titan | saturn | 1221870 | 15.9454 | 0.35 | 2574.7 | 56 | `#D8A33C` |
| iapetus | Iapetus | saturn | 3560820 | 79.3215 | 15.47 | 734.5 | 141 | `#8F857A` |
| miranda | Miranda | uranus | 129390 | 1.4135 | 4.23 | 235.8 | 19 | `#A9A49C` |
| ariel | Ariel | uranus | 191020 | 2.5204 | 0.26 | 578.9 | 88 | `#B5B0A8` |
| umbriel | Umbriel | uranus | 266300 | 4.1442 | 0.13 | 584.7 | 203 | `#6E6A64` |
| titania | Titania | uranus | 435910 | 8.7062 | 0.34 | 788.4 | 274 | `#A89F94` |
| oberon | Oberon | uranus | 583520 | 13.4632 | 0.06 | 761.4 | 327 | `#95897C` |
| triton | Triton | neptune | 354759 | 5.8770 | 157.0 | 1353.4 | 64 | `#C8C2D6` |

Moon counts per planet (use in tests): Earth 1, Mars 2, Jupiter 4, Saturn 7, Uranus 5, Neptune 1 → **20 moons, 29 bodies total** (1 sun + 8 planets + 20 moons). Mercury and Venus have none.

For moons, set `axialTiltDeg = 0` and `eccentricity = 0` in the data (circular approximation).

## Table 4 — Info-panel texts

Each body's `info` object has exactly three string fields: `description`, `composition`, `funFact`. Copy these texts verbatim.

| id | description | composition | funFact |
|---|---|---|---|
| sun | The star at the center of our solar system, a near-perfect sphere of hot plasma that contains 99.86% of the system's mass. | ~73% hydrogen, ~25% helium, traces of oxygen, carbon, iron | One million Earths could fit inside the Sun. |
| mercury | The smallest planet and the closest to the Sun, with a heavily cratered surface and almost no atmosphere. | Large iron core (~60% of mass), silicate mantle and crust | A year on Mercury (88 days) is shorter than its full day–night cycle (176 Earth days). |
| venus | Earth's "twin" in size, wrapped in a crushing CO₂ atmosphere with clouds of sulfuric acid — the hottest planet. | Rocky body; atmosphere of 96.5% CO₂, surface pressure 92× Earth's | Venus spins backwards: its Sun rises in the west and sets in the east. |
| earth | The only known world to harbor life, with liquid water covering 71% of its surface. | Iron-nickel core, silicate mantle; atmosphere of 78% N₂, 21% O₂ | Earth is the densest planet in the solar system. |
| mars | The red planet, a cold desert world with the largest volcano and the deepest canyon in the solar system. | Iron-rich basaltic rock; thin CO₂ atmosphere (less than 1% of Earth's pressure) | Olympus Mons on Mars is about 2.5 times the height of Mount Everest. |
| jupiter | The largest planet — a gas giant whose Great Red Spot is a storm wider than Earth that has raged for centuries. | ~90% hydrogen, ~10% helium; possible rocky core | Jupiter is more than twice as massive as all the other planets combined. |
| saturn | The ringed gas giant: its spectacular rings are made of countless ice and rock fragments. | ~96% hydrogen, ~3% helium; icy ring particles from meters to centimeters | Saturn's average density is lower than water — it would float in a big enough bathtub. |
| uranus | An ice giant that rotates on its side, with a pale cyan color from methane in its atmosphere. | Water, methane and ammonia "ices" over a rocky core; H₂/He atmosphere | Uranus's axis is tilted 98°: each pole gets 42 years of daylight, then 42 years of night. |
| neptune | The farthest planet, a deep-blue ice giant with the fastest winds in the solar system (up to 2 100 km/h). | Water, methane and ammonia ices; H₂/He atmosphere with methane | Neptune was discovered by mathematics: its position was predicted before it was seen. |
| moon | Earth's only natural satellite, whose gravity drives the ocean tides. | Silicate rock; small iron core; no atmosphere | The Moon always shows Earth the same face — it is tidally locked. |
| phobos | The larger and closer of Mars's two tiny moons, orbiting faster than Mars rotates. | Carbon-rich rock and regolith, possibly a captured asteroid | Phobos spirals slowly inward and will crash into Mars or break apart in ~50 million years. |
| deimos | The smaller, outer moon of Mars, just 12 km across. | Carbon-rich rock, similar to C-type asteroids | From Mars, Deimos looks like a bright star rather than a moon. |
| io | The most volcanically active body in the solar system, squeezed by Jupiter's tides. | Silicate rock; surface of sulfur and sulfur dioxide frost | Io has hundreds of volcanoes, some erupting plumes 500 km high. |
| europa | An icy moon hiding a global liquid-water ocean beneath its frozen shell — a prime target in the search for life. | Water-ice crust over a salty ocean; silicate mantle, iron core | Europa's hidden ocean may hold twice as much water as all of Earth's oceans. |
| ganymede | The largest moon in the solar system — bigger than the planet Mercury. | Roughly half water ice, half silicate rock; iron core | Ganymede is the only moon known to have its own magnetic field. |
| callisto | A dark, ancient world with the most heavily cratered surface in the solar system. | Mix of rock and water ice; possible subsurface ocean | Callisto's surface is about 4 billion years old — almost unchanged since its formation. |
| mimas | A small icy moon whose giant crater Herschel makes it look like the Death Star. | Almost pure water ice | The crater Herschel is 139 km wide — a third of Mimas's own diameter. |
| enceladus | A bright icy moon that shoots geysers of water from its south pole. | Water ice over a global subsurface ocean; rocky core | Enceladus's geysers feed Saturn's E ring with ice particles. |
| tethys | A mid-sized icy moon of Saturn, scarred by the huge Odysseus crater and the Ithaca Chasma canyon. | Almost entirely water ice | Ithaca Chasma is a canyon stretching three quarters of the way around Tethys. |
| dione | An icy Saturn moon streaked with bright "wispy" ice cliffs. | Mostly water ice with a rocky core | Dione's wispy streaks are cliffs of ice hundreds of meters high. |
| rhea | Saturn's second-largest moon, a cold, cratered ball of ice and rock. | ~75% water ice, ~25% rock | Rhea may once have had its own faint ring system. |
| titan | Saturn's largest moon — the only moon with a thick atmosphere, and lakes of liquid methane. | Water-ice crust; nitrogen atmosphere denser than Earth's | Titan's methane rain and rivers make it the only other world with standing liquid on its surface. |
| iapetus | Saturn's two-faced moon: one hemisphere is coal-dark, the other bright as snow. | Mostly water ice; dark carbon-rich coating on one side | Iapetus has a mysterious equatorial mountain ridge up to 13 km high. |
| miranda | Uranus's strangest moon, a jumbled patchwork of cliffs and canyons. | Water ice and silicate rock | Verona Rupes on Miranda may be the tallest cliff in the solar system (~20 km). |
| ariel | The brightest of Uranus's moons, with relatively young valleys and ridges. | Water ice and rock, with possible ammonia ice | Ariel's surface is the youngest of Uranus's major moons. |
| umbriel | The darkest of Uranus's large moons, ancient and heavily cratered. | Water ice and rock with dark surface material | A bright mysterious ring called the "fluorescent cheerio" sits in its crater Wunda. |
| titania | The largest moon of Uranus, marked by huge fault canyons. | Roughly half water ice, half rock | Titania's canyon Messina Chasma stretches about 1 500 km. |
| oberon | The outermost large moon of Uranus, old, dark and cratered. | Water ice and rock with a possible ocean layer | Oberon, like all Uranian moons, is named after a Shakespeare character — the fairy king. |
| triton | Neptune's giant moon, orbiting backwards — almost certainly a captured Kuiper Belt object. | Nitrogen-ice surface over rock and metal; thin nitrogen atmosphere | Triton's retrograde orbit means Neptune's tides will eventually tear it apart. |

## Table 5 — Rotation phase at J2000 (`rotationAtJ2000Deg`)

The rotation angle is **anchored to the real orientation of each body at J2000** so that the day/night terminator is physically correct at the current date (doc 02, step D). One value per body; the **19 moons not listed here use `rotationAtJ2000Deg = 0`** — real rotational phase for minor moons is out of scope (they are tidally locked and untextured, so the anchor is invisible anyway).

| id | rotationAtJ2000Deg | basis |
|---|---|---|
| sun | 84.176 | IAU W₀ (cosmetic — no terminator on the sun) |
| mercury | 339.511 | Horizons-derived (see below) |
| venus | 337.525 | Horizons-derived — **indicative only** (see note) |
| earth | 280.4606 | **GMST at J2000** (Greenwich Mean Sidereal Time, 18.697 374 6 h × 15) |
| mars | 218.245 | Horizons-derived |
| jupiter | 283.963 | Horizons-derived (System III) |
| saturn | 171.532 | Horizons-derived (System III) |
| uranus | 115.865 | Horizons-derived — **indicative only** (see note) |
| neptune | 276.980 | Horizons-derived |
| moon | 38.194 | Horizons-derived (cross-checks with IAU W₀ = 38.3213) |

**Sources.** Rotation rates: B. A. Archinal et al., *Report of the IAU Working Group on Cartographic Coordinates and Rotational Elements: 2015*, Celest. Mech. Dyn. Astron. 130:22 (2018). Phase values: derived from **JPL Horizons** sub-solar longitudes at JD 2451545.0 (observer table, quantity 14, center `500@10`, retrieved 2026-06-11), converted to east-positive longitude where Horizons reports west-positive (Mercury, Mars, Jupiter, Saturn, Neptune), corrected for light-time, then expressed in this project's scene frame as `rotationAtJ2000Deg = (orbitalAngleDeg(J2000) + 180 − subSolarLongitudeEast(J2000)) mod 360`. Earth uses GMST(J2000) directly per spec — it agrees with the Horizons-derived value (279.56) to within ~0.9° (ecliptic-vs-equator projection).

**Accuracy notes.**
- The invariant these values guarantee: `subSolarLongitudeDeg = (orbitalAngleDeg + 180 − rotationAngleDeg) mod 360` matches reality at any date, within a few degrees (projection approximations of doc 02/05) — i.e. the lit hemisphere and the texture longitude facing the Sun are correct. For Earth: sub-solar longitude ≈ `(180 − 15 × UTC decimal hours) mod 360` within ±4° (equation of time + approximations).
- **Venus and Uranus are indicative only**: our retrograde-via-tilt convention (tilt > 90°, positive spin) mirrors the texture's east/west direction, so their sub-solar longitude drifts in the wrong direction over time. Their anchor is correct at J2000 but effectively arbitrary decades later. Accepted: Venus is featureless clouds, Uranus near-featureless. Do not try to fix this with negative rotation rates — out of scope.

## Table 6 — Spin-pole azimuth (`poleEclipticLonDeg`)

`axialTiltDeg` (Table 2) only gives the tilt **magnitude**; the direction the pole leans toward sets the **seasonal phase**. `poleEclipticLonDeg` is the ecliptic longitude toward which the body's spin pole leans — the pole around which the spin is counter-clockwise (for Venus and Uranus, `axialTiltDeg > 90`, this is the **opposite** of the IAU north pole). Without it the scene shows solstices and equinoxes at the wrong dates (e.g. an equinox-like Earth in June, night falling ~2 h too early at European latitudes). One value for the sun + 8 planets; the **20 moons use `poleEclipticLonDeg = 0`** (their `axialTiltDeg` is 0, the azimuth is meaningless — doc 05 explains why the 0 placeholder is harmless).

| id | poleEclipticLonDeg | basis (IAU north pole α, δ — equatorial J2000) |
|---|---|---|
| sun | 345.77 | (286.13, +63.87) — cosmetic: the sun is not tilted in the scene (doc 05) |
| mercury | 318.24 | (281.0103, +61.4155) — near-zero tilt, azimuth barely visible |
| venus | 210.19 | opposite of (272.76, +67.16) — tilt > 90 |
| earth | 90.00 | exact by definition of ecliptic coordinates (pole at λ = 90°, β = 66.56°) |
| mars | 352.91 | (317.68143, +52.88650) |
| jupiter | 247.82 | (268.056595, +64.495303) |
| saturn | 79.53 | (40.589, +83.537) |
| uranus | 77.65 | opposite of (257.311, −15.175) — tilt > 90 |
| neptune | 319.24 | (299.36, +43.46) |

**Sources.** IAU north-pole directions (α₀, δ₀ at J2000, constant terms) from the same WGCCRE 2015 report as Table 5, converted to ecliptic longitude with obliquity ε = 23.4392911°: `λ = atan2(sin α · cos ε + tan δ · sin ε, cos α) mod 360`; for `axialTiltDeg > 90` (Venus, Uranus) the spin pole is the opposite of the IAU pole — add 180°.

**Accuracy notes.**
- Cross-check built into the data: `90° − β` of each spin pole reproduces Table 2's `axialTiltDeg` within ~2° (the residual is each planet's orbital inclination: Table 2 tilts are measured against the body's own orbit plane, λ/β against the ecliptic). Earth comes out exactly 90.00 / 23.44.
- The azimuth is applied inside the inclined orbit group (doc 05) while λ is measured on the ecliptic — error ≤ the orbital inclination, same class as the ignored node longitude Ω.

## How this maps to backend files

Split into three files in `apps/backend/src/data/` (see doc 02 for the exact TypeScript shapes):

- `keplerianElements.ts` — Table 1 (planets only).
- `bodies.ts` — Tables 2 + 3 merged: one record per body (29 records) with physical data, moon orbital data, parent links, colors, plus `rotationAtJ2000Deg` from Table 5 (0 for the 19 unlisted moons) and `poleEclipticLonDeg` from Table 6 (0 for the 20 moons).
- `bodyInfo.ts` — Table 4 (`Record<string, { description; composition; funFact }>` with all 29 ids).

A unit test must assert: 29 bodies, ids unique, every `parentId` exists, every body has an info entry (doc 02).
