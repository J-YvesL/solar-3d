import { createApp } from "./app";
import { createLogger } from "./logger";

const logger = createLogger("server");

const app = createApp();
app.listen(3001, () => {
  logger.info("Backend listening on http://localhost:3001");
});
