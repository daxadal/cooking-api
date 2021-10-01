import express, { RequestHandler } from "express";

import {
  getAllIngredients,
  getDetailedStepsFromInput,
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

/* GET ingredient by id. */
router.get("/:id(\\d+)/outcomes", loadIngredient, async function (req, res) {
  const steps = await getDetailedStepsFromInput(res.locals.ingredient.id);
  res.status(200).send(steps);
});

export default router;
