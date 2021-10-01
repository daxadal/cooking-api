import express, { RequestHandler } from "express";

import {
  createIngredient,
  deleteIngredient,
  getAllIngredients,
  getDetailedStepsFromInput,
  getDetailedStepsFromOutput,
  getIngredient,
  Ingredient,
  IngredientType,
  updateIngredient,
} from "@services/db";

const router = express.Router();
router.use(express.json({ limit: "100kb" }));

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

/* CREATE ingredients. */
router.post("/", async function (req, res) {
  const { name, type } = req.body;
  const newId = await createIngredient({ name, type });
  const ingredient = await getIngredient(newId);
  res.status(200).send(ingredient);
});

/* UPDATE ingredient by id. */
router.put("/:id(\\d+)", loadIngredient, async function (req, res) {
  const ingredient: Ingredient = res.locals.ingredient;
  const { name, type } = req.body;
  const id = await updateIngredient({ id: ingredient.id, name, type });
  const ingredientUpdated = await getIngredient(id);
  res.status(200).send(ingredientUpdated);
});

/* DELETE ingredient by id. */
router.delete("/:id(\\d+)", loadIngredient, async function (req, res) {
  await deleteIngredient(req.params.id);
  res.status(204).send();
});

/* GET step by input. */
router.get("/:id(\\d+)/outcomes", loadIngredient, async function (req, res) {
  const ingredient: Ingredient = res.locals.ingredient;
  if (ingredient.type === IngredientType.END) {
    res.status(400).send({
      message: "This is an end ingredient. It cannot be cooked further.",
    });
  } else {
    const steps = await getDetailedStepsFromInput(res.locals.ingredient.id);
    res.status(200).send(steps);
  }
});

/* GET step by output. */
router.get("/:id(\\d+)/sources", loadIngredient, async function (req, res) {
  const ingredient: Ingredient = res.locals.ingredient;
  if (ingredient.type === IngredientType.START) {
    res.status(400).send({
      message:
        "This is an start ingredient. It cannot have been cooked before.",
    });
  } else {
    const steps = await getDetailedStepsFromOutput(res.locals.ingredient.id);
    res.status(200).send(steps);
  }
});

export default router;
