import { existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const TEXTURES_DIR = "apps/frontend/public/textures";

const MANIFEST = [
  { file: "sun.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_sun.jpg" },
  { file: "mercury.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_mercury.jpg" },
  { file: "venus.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg" },
  { file: "earth.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg" },
  { file: "earth-night.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg" },
  { file: "mars.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_mars.jpg" },
  { file: "jupiter.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg" },
  { file: "saturn.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_saturn.jpg" },
  { file: "saturn-ring.png", url: "https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png" },
  { file: "uranus.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_uranus.jpg" },
  { file: "neptune.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_neptune.jpg" },
  { file: "moon.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_moon.jpg" },
];

mkdirSync(TEXTURES_DIR, { recursive: true });

let failed = 0;

for (const { file, url } of MANIFEST) {
  const dest = join(TEXTURES_DIR, file);

  if (existsSync(dest) && statSync(dest).size > 10_000) {
    console.log(`  skip  ${file}`);
    continue;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) throw new Error(`unexpected content-type: ${ct}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  ✓  ${file}`);
  } catch (err) {
    console.error(`  ✗  ${file}: ${err.message}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} file(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${MANIFEST.length} textures ready.`);
