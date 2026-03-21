import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { Db } from "mongodb";
import { configureEnv, env } from "./env";
import { connectToMongo } from "./mongo";
import { setDb } from "./db";

class App {
  private static instance: App | null = null;
  public readonly api: Application;
  public db: Db | null = null;

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

  public setupSecurity(): void {
    this.api.use(helmet());
  }

  public setupCors(): void {
    const allowedOrigins = this.getCorsAllowedOrigins();

    this.api.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
          }

          callback(
            new Error(
              `CORS blocked for origin: ${origin}. Allowed origins: ${allowedOrigins.join(
                ", ",
              )}`,
            ),
          );
        },
        credentials: true,
      }),
    );
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
      MONGO_URL: process.env.MONGO_URL,
    });
  }

  public async setupDatabase(): Promise<void> {
    const mongoUrl = env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL is not configured.");
    }

    const connectionTimeoutMs = 5000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(
          new Error("MongoDB connection attempt timed out after 5 seconds."),
        );
      }, connectionTimeoutMs);
    });

    try {
      this.db = await Promise.race([connectToMongo(mongoUrl), timeoutPromise]);
      setDb(this.db);
      console.log("MongoDB connection succeeded.");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("MongoDB connection attempt failed.");
    }
  }

  private getCorsAllowedOrigins(): string[] {
    if (env.MODE === "production") {
      return ["https://plotter.danielsjunk.com"];
    }

    return ["http://localhost:5173", "http://localhost:4000"];
  }
}

export const app = App.getInstance();
