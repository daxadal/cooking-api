/* Types */

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

/* Helpers */

export function parseEnvironment(ENV: string | undefined): Environment {
  return ENV && ENV in Environment ? (ENV as Environment) : Environment.DEV;
}
export function parseLogLevel(level: string | undefined): LogLevel | undefined;
export function parseLogLevel(
  level: string | undefined,
  defaultValue: LogLevel
): LogLevel;
export function parseLogLevel(
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
