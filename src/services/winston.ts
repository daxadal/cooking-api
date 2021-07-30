import { RequestHandler } from "express";
import { Format, FormatWrap, TransformableInfo } from "logform";
import { createLogger, transports, format, Logger } from "winston";

interface ExtendedTransformableInfo extends TransformableInfo {
  timestamp: string;
  stack?: string;
  meta: Record<string, unknown>;
  axios?: { status: number; data: any };
  splat?: any[];
}

export function getLogger(service: string): Logger {
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

  const extractSplat: FormatWrap = format((info: any) => {
    info.splat = info[Symbol.for("splat")];
    return info;
  });

  const customLogToExtend: Format = format.printf((info: TransformableInfo) => {
    const extendedInfo = <ExtendedTransformableInfo>info;
    const { level, message, timestamp, stack, meta, axios, splat } =
      extendedInfo;
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
    // Add other info
    else if (!stack && splat && splat.length > 0) {
      if (splat.length == 1)
        msg += "\n" + JSON.stringify(splat[0], null, 2) + "\n";
      else msg += "\n" + JSON.stringify(splat.join(", "), null, 2) + "\n";
    }

    //Add label
    return `[${timestamp} ${level}]: ${msg}`;
  });

  const dateForFileName = new Date().toISOString().split("T")[0];

  return createLogger({
    format: format.combine(
      format.metadata({
        key: "meta",
        fillExcept: ["level", "message", "stack", "timestamp"],
      }),
      format.timestamp(),
      format.errors({ stack: true }),
      extractSplat(),
      extractAxios(),
      customLogToExtend
    ),
    transports: [
      new transports.File({
        level: "info",
        filename: `logs/${service}/${dateForFileName}-all.log`,
        maxsize: 52428800, // 50MB
      }),
      new transports.File({
        level: "warn",
        filename: `logs/${service}/${dateForFileName}-errors.log`,
        maxsize: 52428800, // 50MB
      }),
      new transports.Console(),
    ],
  });
}

export const initLogger: RequestHandler = (req, res, next) => {
  const logger = getLogger("api");
  logger.info(`Calling ${req.originalUrl} ...`);
  res.locals.logger = logger;
  next();
};
