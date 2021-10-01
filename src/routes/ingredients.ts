import express, { RequestHandler } from "express";

import {
  getAllIngredients,
  getDetailedStepsFromInput,
  getDetailedStepsFromOutput,
  getIngredient,
} from "@services/db";

const router = express.Router();

const loadIngredient: RequestHandler = async (req, res, next) => {
  const ingredient = await getIngredient(parseInt(req.params.id));
  if (ingredient) {
    res.locals.ingredient = ingredient;
    next();
  } else {
    res.status(404).send({ message: "Ingredient not found" });
  }
};

/* GET ingredients. */
router.get("/", async function (req, res) {
  const ingredients = await getAllIngredients();
  res.status(200).send(ingredients);
});

/* GET ingredient by id. */
router.get("/:id(\\d+)", loadIngredient, function (req, res) {
  res.status(200).send(res.locals.ingredient);
});

/* GET step by input. */
router.get("/:id(\\d+)/outcomes", loadIngredient, async function (req, res) {
  const steps = await getDetailedStepsFromInput(res.locals.ingredient.id);
  res.status(200).send(steps);
});

/* GET step by output. */
router.get("/:id(\\d+)/sources", loadIngredient, async function (req, res) {
  const steps = await getDetailedStepsFromOutput(res.locals.ingredient.id);
  res.status(200).send(steps);
});

export default router;
