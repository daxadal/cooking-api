import { RequestHandler } from "express";
import Joi from "joi";

const validate =
  (fieldToValidate: "body" | "query" | "params") =>
  (schema: Joi.Schema): RequestHandler =>
  (req, res, next) => {
    const { value, error } = schema.validate(req[fieldToValidate]);
    if (error) {
      res.status(400).send({ message: error.message });
    } else {
      req[fieldToValidate] = value;
      next();
    }
  };

export const validateBody = validate("body");
export const validateQuery = validate("query");
export const validatePath = validate("params");

export const validatePathId = validateBody(
  Joi.object({
    id: Joi.number().integer().required(),
  })
);
