import express, { RequestHandler } from "express";

import { Step, Utensil } from "@services/db";
import { validatePathId } from "@services/joi";

const router = express.Router();

const loadUtensil: RequestHandler = async function (req, res, next) {
  const utensil = await Utensil.get(parseInt(req.params.id));
  if (utensil) {
    res.locals.utensil = utensil;
    next();
  } else {
    res.status(404).send({ message: "Utensil not found" });
  }
};

/* GET utensils. */
router.get("/", async function (req, res) {
  const utensils = await Utensil.getAll();
  res.status(200).send(utensils);
});

/* GET utensil by id. */
router.get("/:id(\\d+)", validatePathId, loadUtensil, async function (req, res) {
  res.status(200).send(res.locals.utensil);
});

/* CREATE utensils. */
router.post("/", async function (req, res) {
  const { name, waitTimeInMillis } = req.body;
  const id = await Utensil.create({ name, waitTimeInMillis });
  const utensil = await Utensil.get(id);
  res.status(200).send(utensil);
});

/* UPDATE utensil by id. */
router.put("/:id(\\d+)", validatePathId, loadUtensil, async function (req, res) {
  const utensil: Utensil.Utensil = res.locals.utensil;
  const { name, waitTimeInMillis } = req.body;
  const id = await Utensil.update({ id: utensil.id, name, waitTimeInMillis });
  const utensilUpdated = await Utensil.get(id);
  res.status(200).send(utensilUpdated);
});

/* DELETE utensil by id. */
router.delete("/:id(\\d+)", validatePathId, loadUtensil, async function (req, res) {
  await Utensil.destroy(res.locals.utensil.id);
  res.status(204).send();
});

/* GET step by utensil. */
router.get("/:id(\\d+)/uses", validatePathId, loadUtensil, async function (req, res) {
  const steps = await Step.queryDetailedFromUtensil(res.locals.utensil.id);
  res.status(200).send(steps);
});

export default router;
