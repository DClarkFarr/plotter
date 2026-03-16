import express, { Application, Request, Response } from "express";

import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 1000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World with TypeScript and Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
