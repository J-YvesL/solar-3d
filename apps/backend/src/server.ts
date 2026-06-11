import { createApp } from "./app";

const app = createApp();
app.listen(3001, () => {
  console.log("Backend listening on http://localhost:3001");
});
