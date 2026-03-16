import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

import { app } from "./utils/app";

import { apiRouter } from "./routers/apiRouter";
import { webRouter } from "./routers/webrouter";

app.setupEnvironment();

app.setupSecurity();

app.setupCors();

app.setupCookies();

app.api.use("/api", apiRouter);
app.api.use("/", webRouter);

app.listen();
