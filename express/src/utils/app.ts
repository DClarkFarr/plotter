import express, { Application } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { configureEnv, env } from "./env";

class App {
  private static instance: App | null = null;
  public readonly api: Application;
  public db: unknown | null = null;

  private constructor() {
    this.api = express();
  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }

    return App.instance;
  }

  public setupSessions(): void {
    // Session setup will be added when auth is implemented.
  }

  public setupCookies(): void {
    this.api.use(cookieParser());
  }

  public listen(): void {
    const port = env.PORT;

    this.api.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }

  public setupEnvironment() {
    configureEnv({
      MODE: process.env.MODE,
      PORT: process.env.PORT,
    });
  }
}

export const app = App.getInstance();
