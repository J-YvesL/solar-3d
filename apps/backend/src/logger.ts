import winston from "winston";

const { combine, timestamp, printf } = winston.format;

export function createLogger(component: string) {
  return winston.createLogger({
    level: process.env["LOG_LEVEL"] ?? "info",
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      printf((info) => `${String(info["timestamp"])} [${component}] ${info.level}: ${info.message}`),
    ),
    transports: [new winston.transports.Console()],
  });
}
