import express, { RequestHandler } from "express";

import {
  getAllUtensils,
  getDetailedStepsFromUtensil,
  getUtensil,
} from "@services/db";

const router = express.Router();

const loadUtensil: RequestHandler = async function (req, res, next) {
  const utensil = await getUtensil(parseInt(req.params.id));
  if (utensil) {
    res.locals.utensil = utensil;
    next();
  } else {
    res.status(404).send({ message: "Utensil not found" });
  }
};

/* GET utensils. */
router.get("/", async function (req, res) {
  const utensils = await getAllUtensils();
  res.status(200).send(utensils);
});

/* GET utensil by id. */
router.get("/:id(\\d+)", loadUtensil, async function (req, res) {
  res.status(200).send(res.locals.utensil);
});

/* GET step by utensil. */
router.get("/:id(\\d+)/uses", loadUtensil, async function (req, res) {
  const steps = await getDetailedStepsFromUtensil(res.locals.utensil.id);
  res.status(200).send(steps);
});

export default router;
