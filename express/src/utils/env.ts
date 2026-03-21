export type AppMode = "development" | "production" | "test";

export interface EnvConfig {
  readonly PORT: number;
  readonly MODE: AppMode;
  readonly MONGO_URL: string;
  readonly SESSION_SECRET: string;
  readonly SESSION_COOKIE_NAME: string;
}

const DEFAULT_ENV: EnvConfig = {
  PORT: 1000,
  MODE: "development",
  MONGO_URL: "",
  SESSION_SECRET: "",
  SESSION_COOKIE_NAME: "plotter.sid",
};

let currentEnv: EnvConfig = { ...DEFAULT_ENV };

export const env: Readonly<EnvConfig> = new Proxy({} as EnvConfig, {
  get: (_target, prop: keyof EnvConfig) => currentEnv[prop],
  ownKeys: () => Reflect.ownKeys(currentEnv),
  getOwnPropertyDescriptor: () => ({
    enumerable: true,
    configurable: false,
  }),
});

export interface ConfigureEnvInput {
  PORT?: number | string | undefined;
  MODE?: AppMode | string | undefined;
  MONGO_URL?: string | undefined;
  SESSION_SECRET?: string | undefined;
  SESSION_COOKIE_NAME?: string | undefined;
}

const parsePort = (value: number | string | undefined): number => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_ENV.PORT;
};

const parseMode = (value: AppMode | string | undefined): AppMode => {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }

  return DEFAULT_ENV.MODE;
};

const parseMongoUrl = (value: string | undefined): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return DEFAULT_ENV.MONGO_URL;
};

const parseSessionSecret = (value: string | undefined): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return DEFAULT_ENV.SESSION_SECRET;
};

const parseSessionCookieName = (value: string | undefined): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return DEFAULT_ENV.SESSION_COOKIE_NAME;
};

export const configureEnv = (
  input: ConfigureEnvInput = {},
): Readonly<EnvConfig> => {
  currentEnv = {
    PORT: parsePort(input.PORT),
    MODE: parseMode(input.MODE),
    MONGO_URL: parseMongoUrl(input.MONGO_URL),
    SESSION_SECRET: parseSessionSecret(input.SESSION_SECRET),
    SESSION_COOKIE_NAME: parseSessionCookieName(input.SESSION_COOKIE_NAME),
  };

  return env;
};
