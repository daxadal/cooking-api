import path from "path";
import { RequestHandler } from "express";
import { Format, FormatWrap } from "logform";
import { createLogger, transports, format, Logger } from "winston";
import TransportStream from "winston-transport";

const getConsoleTransport = (level: string): TransportStream =>
  new transports.Console({ level, format: fileAndConsoleFormatter });

const getFileTransport = (
  level: string,
  service: string,
  fileDate: string,
  filetag: string
): TransportStream =>
  new transports.File({
    level,
    filename: path.join(
      __dirname,
      "../../logs",
      service,
      `${fileDate}-${filetag}.log`
    ),
    maxsize: 52428800,
    format: fileAndConsoleFormatter,
  });

const extractAxios: FormatWrap = format((info) => {
  if (info.meta.isAxiosError && info.meta.response) {
    info.axios = {
      status: info.meta.response.status,
      data: info.meta.response.data,
    };
    info.meta = {};
  } else if (info.meta.isAxiosError) {
    info.axios = info.meta.toJSON();
    info.meta = {};
  } else if (info.meta.status && info.meta.data) {
    info.axios = { status: info.meta.status, data: info.meta.data };
    info.meta = {};
  }
  return info;
});

const fileAndConsoleFormatter: Format = format.printf(
  ({ level, message, timestamp, stack, meta, axios }) => {
    let msg;

    //Get basic message
    if (typeof message === "object")
      msg = JSON.stringify(message, null, 2) + "\n";
    else msg = message;

    //Add stack trace
    if (stack) msg += "\n" + stack + "\n";

    // Add axios metadata
    if (axios) msg += "\n" + JSON.stringify(axios, null, 2) + "\n";
    // Add other metadata
    else if (Object.keys(meta).length > 0)
      msg += "\n" + JSON.stringify(meta, null, 2) + "\n";

    //Add label
    return `[${timestamp} ${level}]: ${msg}`;
  }
);

export function getLogger(service = "api"): Logger {
  const dateForFileName = new Date().toISOString().split("T")[0];

  return createLogger({
    format: format.combine(
      format.metadata({
        key: "meta",
        fillExcept: ["level", "message", "stack", "timestamp"],
      }),
      format.timestamp(),
      format.errors({ stack: true }),
      extractAxios()
    ),
    transports: [
      getFileTransport("warn", service, dateForFileName, "errors"),
      getFileTransport("info", service, dateForFileName, "all"),
      getFileTransport("silly", service, dateForFileName, "verbose"),
      getConsoleTransport("info"),
    ],
  });
}

export const initLogger =
  (service = "api"): RequestHandler =>
  (req, res, next) => {
    const logger = getLogger(service);
    logger.info(`Calling ${req.method} ${req.originalUrl} ...`);
    res.locals.logger = logger;
    next();
  };
