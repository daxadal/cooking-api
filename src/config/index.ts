import { config } from "dotenv";
import {
  WinstonConfig,
  LogLevel,
  Environment,
  parseEnvironment,
  parseLogLevel,
} from "./types-helpers";

export { LogLevel, Environment };

const { error, parsed } = config();

const {
  ENV,

  WINSTON_SLACK_LEVEL,
  WINSTON_CONSOLE_LEVEL,
  WINSTON_FILE_LEVEL,
} = process.env;

export const dotenv = { error, parsed };
export const environment = parseEnvironment(ENV);

export const _winston: Record<Environment, WinstonConfig> = {
  PROD: {
    slack: { level: LogLevel.NONE, webhooks: {} },
    console: { level: LogLevel.INFO },
    file: { level: LogLevel.INFO },
  },
  DEV: {
    slack: { level: LogLevel.NONE, webhooks: {} },
    console: { level: LogLevel.INFO },
    file: { level: LogLevel.VERBOSE },
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
