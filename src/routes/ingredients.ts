import express from "express";

import {
  getAllIngredients,
  getDetailedStepsFromInput,
  getIngredient,
} from "@services/db";

const router = express.Router();

/* GET ingredients. */
router.get("/", async function (req, res) {
  const ingredients = await getAllIngredients();
  res.status(200).send(ingredients);
});

/* GET ingredient by id. */
router.get("/:id(\\d+)", async function (req, res) {
  const ingredient = await getIngredient(parseInt(req.params.id));

  if (ingredient) res.status(200).send(ingredient);
  else res.status(404).send({ message: "Ingredient not found" });
});

/* GET ingredient by id. */
router.get("/:id(\\d+)/outcomes", async function (req, res) {
  const steps = await getDetailedStepsFromInput(parseInt(req.params.id));
  res.status(200).send(steps);
});

export default router;
