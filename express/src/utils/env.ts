export type AppMode = "development" | "production" | "test";

export interface EnvConfig {
  readonly PORT: number;
  readonly MODE: AppMode;
  readonly MONGO_URL: string;
}

const DEFAULT_ENV: EnvConfig = {
  PORT: 1000,
  MODE: "development",
  MONGO_URL: "",
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

export const configureEnv = (
  input: ConfigureEnvInput = {},
): Readonly<EnvConfig> => {
  currentEnv = {
    PORT: parsePort(input.PORT),
    MODE: parseMode(input.MODE),
    MONGO_URL: parseMongoUrl(input.MONGO_URL),
  };

  return env;
};
