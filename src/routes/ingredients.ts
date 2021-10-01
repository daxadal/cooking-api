import express, { RequestHandler } from "express";

import {
  createIngredient,
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
  await createIngredient({ name, type });
  res.status(200).send({ message: "Ingredient created" });
});

/* UPDATE ingredient by id. */
router.put("/:id(\\d+)", loadIngredient, async function (req, res) {
  const ingredient: Ingredient = res.locals.ingredient;
  const { name, type } = req.body;
  await updateIngredient({ id: ingredient.id, name, type });
  res.status(200).send({ message: "Ingredient updated" });
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
