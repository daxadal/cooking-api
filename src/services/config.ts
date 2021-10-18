import { config } from "dotenv";

const { error, parsed } = config();

const {
  ENV,
  MONGO_URL,

  WINSTON_SLACK_LEVEL,
  WINSTON_CONSOLE_LEVEL,
  WINSTON_FILE_LEVEL,
} = process.env;

export const environment = parseEnvironment(ENV);

/* Types */

export interface BaseMongoConfig {
  address: string;
  port: number;
  dbName: string;
}
export interface MongoConfig extends BaseMongoConfig {
  url: string;
}

export interface WinstonConfig {
  console: { level: LogLevel };
  file: { level: LogLevel; prefix?: string };
  slack: {
    level: LogLevel;
    webhooks: {
      priority?: string;
      all?: string;
    };
  };
}

/* Enums */
export enum Environment {
  PROD = "PROD",
  DEV = "DEV",
  JEST = "JEST",
  CI_JEST = "CI_JEST",
}

export enum LogLevel {
  NONE,
  ERROR,
  WARN,
  INFO,
  VERBOSE,
}

export function parseEnvironment(HAMELYN_ENV: string | undefined): Environment {
  const parsedEnv = HAMELYN_ENV ? (HAMELYN_ENV as Environment) : undefined;
  return parsedEnv || Environment.DEV;
}

function parseLogLevel(level: string | undefined): LogLevel | undefined;
function parseLogLevel(
  level: string | undefined,
  defaultValue: LogLevel
): LogLevel;
function parseLogLevel(
  level: string | undefined,
  defaultValue?: LogLevel
): LogLevel | undefined {
  if (!level) return defaultValue;
  if (/^none$/i.test(level)) return LogLevel.NONE;
  if (/^error$/i.test(level)) return LogLevel.ERROR;
  if (/^warn$/i.test(level)) return LogLevel.WARN;
  if (/^info$/i.test(level)) return LogLevel.INFO;
  if (/^verbose$/i.test(level)) return LogLevel.VERBOSE;
  return defaultValue;
}

export function parseUrl(url: string): BaseMongoConfig {
  const match = /(.*):(\d+)\/(.*)/.exec(url);
  const [, address, port, dbName] = match || [];
  return { address, port: Number(port), dbName };
}

export const _mongo: Record<Environment, BaseMongoConfig> = {
  PROD: {
    address: "mongodb://localhost",
    port: 27017,
    dbName: "Hamelyn",
  },
  DEV: {
    address: "mongodb://localhost",
    port: 27017,
    dbName: "HamelynDev",
  },
  JEST: {
    address: "mongodb://localhost",
    port: 27017,
    dbName: "HamelynJest",
  },
  CI_JEST: {
    address: "mongodb://mongo-docker",
    port: 27017,
    dbName: "HamelynJest",
  },
};

export const mongo: MongoConfig = MONGO_URL
  ? {
      url: MONGO_URL,
      ...parseUrl(MONGO_URL),
    }
  : {
      ..._mongo[environment],
      url: `${_mongo[environment].address}:${_mongo[environment].port}/${_mongo[environment].dbName}`,
    };

export const _winston: Record<Environment, WinstonConfig> = {
  PROD: {
    slack: { level: LogLevel.NONE, webhooks: {} },
    console: { level: LogLevel.NONE },
    file: { level: LogLevel.NONE, prefix: "__jest__" },
  },
  DEV: {
    slack: { level: LogLevel.NONE, webhooks: {} },
    console: { level: LogLevel.NONE },
    file: { level: LogLevel.NONE, prefix: "__jest__" },
  },
  JEST: {
    slack: { level: LogLevel.NONE, webhooks: {} },
    console: { level: LogLevel.NONE },
    file: { level: LogLevel.NONE, prefix: "__jest__" },
  },
  CI_JEST: {
    slack: { level: LogLevel.NONE, webhooks: {} },
    console: { level: LogLevel.NONE },
    file: { level: LogLevel.INFO, prefix: "__jest__" },
  },
};

export const winston: WinstonConfig = {
  slack: {
    level: parseLogLevel(
      WINSTON_SLACK_LEVEL,
      _winston[environment].slack.level
    ),
    webhooks: _winston[environment].slack.webhooks,
  },
  console: {
    level: parseLogLevel(
      WINSTON_CONSOLE_LEVEL,
      _winston[environment].console.level
    ),
  },
  file: {
    level: parseLogLevel(WINSTON_FILE_LEVEL, _winston[environment].file.level),
    prefix: _winston[environment].file.prefix,
  },
};
