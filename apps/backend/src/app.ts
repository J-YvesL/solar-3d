import express from "express";
import cors from "cors";
import { bodiesRouter } from "./routes/bodies";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/bodies", bodiesRouter);

  return app;
}
