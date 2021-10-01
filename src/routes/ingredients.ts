import express, { RequestHandler } from "express";

import { Ingredient, Step } from "@services/db";
import { validatePathId } from "@services/joi";

const router = express.Router();
router.use(express.json({ limit: "100kb" }));

const loadIngredient: RequestHandler = async (req, res, next) => {
  const ingredient = await Ingredient.get(parseInt(req.params.id));
  if (ingredient) {
    res.locals.ingredient = ingredient;
    next();
  } else {
    res.status(404).send({ message: "Ingredient not found" });
  }
};

/* GET ingredients. */
router.route("/").get(async function (req, res) {
  const ingredients = await Ingredient.getAll();
  res.status(200).send(ingredients);
})

/* CREATE ingredients. */
.post(async function (req, res) {
  const { name, type } = req.body;
  const newId = await Ingredient.create({ name, type });
  const ingredient = await Ingredient.get(newId);
  res.status(200).send(ingredient);
});

router.use("/:id(\\d+)", validatePathId, loadIngredient)

/* GET ingredient by id. */
router.route("/:id(\\d+)").get(function (req, res) {
  res.status(200).send(res.locals.ingredient);
})

/* UPDATE ingredient by id. */
.put(async function (req, res) {
  const ingredient: Ingredient.Ingredient = res.locals.ingredient;
  const { name, type } = req.body;
  const id = await Ingredient.update({ id: ingredient.id, name, type });
  const ingredientUpdated = await Ingredient.get(id);
  res.status(200).send(ingredientUpdated);
})

/* DELETE ingredient by id. */
.delete(async function (req, res) {
  const ingredient: Ingredient.Ingredient = res.locals.ingredient;
  await Ingredient.destroy(ingredient.id);
  res.status(204).send();
});

/* GET step by input. */
router.get("/:id(\\d+)/outcomes", async function (req, res) {
  const ingredient: Ingredient.Ingredient = res.locals.ingredient;
  if (ingredient.type === Ingredient.IngredientType.END) {
    res.status(400).send({
      message: "This is an end ingredient. It cannot be cooked further.",
    });
  } else {
    const steps = await Step.queryDetailedFromInput(ingredient.id);
    res.status(200).send(steps);
  }
});

/* GET step by output. */
router.get("/:id(\\d+)/sources", async function (req, res) {
  const ingredient: Ingredient.Ingredient = res.locals.ingredient;
  if (ingredient.type === Ingredient.IngredientType.START) {
    res.status(400).send({
      message:
        "This is an start ingredient. It cannot have been cooked before.",
    });
  } else {
    const steps = await Step.queryDetailedFromOutput(ingredient.id);
    res.status(200).send(steps);
  }
});

export default router;
