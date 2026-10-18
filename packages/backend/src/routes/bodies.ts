import { Hono } from "hono";
import type { BodiesResponse } from "@solar/shared";
import { computeBodyStates } from "../ephemeris/state";
import { localizedBodies as fr } from "../data/localized/fr";
import { localizedBodies as es } from "../data/localized/es";
import { localizedBodies as it } from "../data/localized/it";
import { localizedBodies as de } from "../data/localized/de";
import { isTleOffline, type AppEnv } from "../env";

export const bodiesRoute = new Hono<AppEnv>();

const VALID_LANGS = new Set(["en", "fr", "es", "it", "de"]);

const LOCALIZED: Record<string, Record<string, { name: string; info: { description: string; composition: string; funFact: string } }>> = {
  fr,
  es,
  it,
  de,
};

bodiesRoute.get("/", async (c) => {
  const dateStr = c.req.query("date");

  let date: Date;
  if (dateStr === undefined || dateStr === "") {
    date = new Date();
  } else {
    date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return c.json({ error: "Invalid date" }, 400);
    }
  }

  const langStr = c.req.query("lang");

  if (langStr !== undefined && langStr !== "" && !VALID_LANGS.has(langStr)) {
    return c.json({ error: "Invalid lang" }, 400);
  }

  const lang = langStr && VALID_LANGS.has(langStr) ? langStr : "en";

  let bodies = await computeBodyStates(date, {
    offline: isTleOffline(c.env),
    store: c.env?.TLE_CACHE,
  });

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
  return c.json(response);
});
