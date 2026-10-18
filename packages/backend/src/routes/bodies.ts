import { Router } from "express";
import type { BodiesResponse } from "@solar/shared";
import { computeBodyStates } from "../ephemeris/state";
import { localizedBodies as fr } from "../data/localized/fr";
import { localizedBodies as es } from "../data/localized/es";
import { localizedBodies as it } from "../data/localized/it";
import { localizedBodies as de } from "../data/localized/de";

export const bodiesRouter = Router();

const VALID_LANGS = new Set(["en", "fr", "es", "it", "de"]);

const LOCALIZED: Record<string, Record<string, { name: string; info: { description: string; composition: string; funFact: string } }>> = {
  fr,
  es,
  it,
  de,
};

bodiesRouter.get("/", async (req, res) => {
  const rawDate = req.query["date"];
  const dateStr = typeof rawDate === "string" ? rawDate : undefined;

  let date: Date;
  if (dateStr === undefined || dateStr === "") {
    date = new Date();
  } else {
    date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date" });
      return;
    }
  }

  const rawLang = req.query["lang"];
  const langStr = typeof rawLang === "string" ? rawLang : undefined;

  if (langStr !== undefined && langStr !== "" && !VALID_LANGS.has(langStr)) {
    res.status(400).json({ error: "Invalid lang" });
    return;
  }

  const lang = langStr && VALID_LANGS.has(langStr) ? langStr : "en";

  let bodies = await computeBodyStates(date);

  if (lang !== "en") {
    const localized = LOCALIZED[lang] ?? {};
    bodies = bodies.map((body) => {
      const loc = localized[body.id];
      return loc ? { ...body, name: loc.name, info: loc.info } : body;
    });
  }

  const response: BodiesResponse = {
    epochIso: date.toISOString(),
    bodies,
  };
  res.json(response);
});
