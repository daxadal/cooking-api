import { RequestHandler } from "express";
import Joi from "joi";

import { getLogger } from "@/services/winston";

const logger = getLogger();

const validate =
  (fieldToValidate: "body" | "query" | "params") =>
  (schema: Joi.Schema): RequestHandler =>
  (req, res, next) => {
    const { value, error } = schema.validate(req[fieldToValidate]);
    if (error) {
      logger.error(`Validation of ${fieldToValidate} failed:`, error);
      res.status(400).send({ message: error.message });
    } else {
      logger.debug(`Validation passed. Request ${fieldToValidate}:`, value);
      req[fieldToValidate] = value;
      next();
    }
  };

export const validateBody = validate("body");
export const validateQuery = validate("query");
export const validatePath = validate("params");

export const validatePathId = validatePath(
  Joi.object({
    id: Joi.number().integer().required(),
  })
);
