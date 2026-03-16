import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

import { app } from "./utils/app";

import { apiRouter } from "./routers/apiRouter";
import { webRouter } from "./routers/webrouter";

const startServer = async () => {
  app.setupEnvironment();

  app.setupSecurity();

  app.setupCors();

  app.setupCookies();

  await app.setupDatabase();

  app.api.use("/api", apiRouter);
  app.api.use("/", webRouter);

  app.listen();
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});
