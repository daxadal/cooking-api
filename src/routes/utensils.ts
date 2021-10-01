import express, { RequestHandler } from "express";

import {
  createUtensil,
  deleteUtensil,
  getAllUtensils,
  getDetailedStepsFromUtensil,
  getUtensil,
  updateUtensil,
  Utensil,
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

/* CREATE utensils. */
router.post("/", async function (req, res) {
  const { name, waitTimeInMillis } = req.body;
  await createUtensil({ name, waitTimeInMillis });
  res.status(200).send({ message: "Utensil created" });
});

/* UPDATE utensil by id. */
router.put("/:id(\\d+)", loadUtensil, async function (req, res) {
  const utensil: Utensil = res.locals.utensil;
  const { name, waitTimeInMillis } = req.body;
  await updateUtensil({ id: utensil.id, name, waitTimeInMillis });
  res.status(200).send({ message: "Utensil updated" });
});

/* DELETE utensil by id. */
router.delete("/:id(\\d+)", loadUtensil, async function (req, res) {
  await deleteUtensil(req.params.id);
  res.status(200).send({ message: "Utensil deleted" });
});

/* GET step by utensil. */
router.get("/:id(\\d+)/uses", loadUtensil, async function (req, res) {
  const steps = await getDetailedStepsFromUtensil(res.locals.utensil.id);
  res.status(200).send(steps);
});

export default router;
