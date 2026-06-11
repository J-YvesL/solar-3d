import { Router } from "express";
import type { BodiesResponse } from "@solar/shared";
import { computeBodyStates } from "../ephemeris/state";

export const bodiesRouter = Router();

bodiesRouter.get("/", (req, res) => {
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

  const response: BodiesResponse = {
    epochIso: date.toISOString(),
    bodies: computeBodyStates(date),
  };
  res.json(response);
});
