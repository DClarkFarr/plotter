import { Request, Response } from "express";

import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

import { app } from "./utils/app";

app.setupEnvironment();

app.api.get("/", (req: Request, res: Response) => {
  res.send("Hello World with TypeScript and Express!");
});

app.listen();
