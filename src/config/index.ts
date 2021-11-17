import { config } from "dotenv";
import {
  LogLevel,
  Environment,
  parseEnvironment,
  parseEnvLogLevel,
  parseEnvString,
} from "./types-helpers";

export { LogLevel, Environment };

const { error, parsed } = config();

const parsingErrors: string[] = [];

export const environment = parseEnvironment("ENV", parsingErrors);

export const winston = {
  slack: {
    level: parseEnvLogLevel("WINSTON_SLACK_LEVEL", parsingErrors),
    webhooks: {
      priority: parseEnvString("WINSTON_SLACK_PRIORITY_WEBHOOK", parsingErrors),
      all: parseEnvString("WINSTON_SLACK_NON_PRIORITY_WEBHOOK", parsingErrors),
    },
  },
  console: {
    level: parseEnvLogLevel("WINSTON_CONSOLE_LEVEL", parsingErrors),
  },
  file: {
    level: parseEnvLogLevel("WINSTON_FILE_LEVEL", parsingErrors),
    prefix: parseEnvString("WINSTON_FILE_PREFIX", parsingErrors),
  },
};

export const database = {
  name: parseEnvString("DB_NAME", parsingErrors),
};

export const configDebug = { dotenv: { error, parsed }, parsingErrors };
