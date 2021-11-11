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

/**
 * @openapi
 * /ingredients:
 *   get:
 *     tags:
 *       - ingredients
 *     description: Get all available ingredients.
 *     responses:
 *       200:
 *         description: A list of all ingredients.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/")
  .get(async function (req, res) {
    const ingredients = await Ingredient.getAll();
    res.status(200).send(ingredients);
  })

  /**
   * @openapi
   * /ingredients:
   *   post:
   *     tags:
   *       - ingredients
   *     description: Creates an ingredient
   *     requestBody:
   *       description: Ingredient to create
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/IngredientData'
   *     responses:
   *       200:
   *         description: The created ingredient.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Ingredient'
   *       400:
   *         $ref: '#/components/responses/400'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .post(async function (req, res) {
    const { name, type } = req.body;
    const newId = await Ingredient.create({ name, type });
    const ingredient = await Ingredient.get(newId);
    res.status(200).send(ingredient);
  });

router.use("/:id(\\d+)", validatePathId, loadIngredient);

/**
 * @openapi
 * /ingredients/{id}:
 *   get:
 *     tags:
 *       - ingredients
 *     description: Get an ingredient by id.
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: The requested ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/:id(\\d+)")
  .get(function (req, res) {
    res.status(200).send(res.locals.ingredient);
  })

  /**
   * @openapi
   * /ingredients/{id}:
   *   put:
   *     tags:
   *       - ingredients
   *     description: Updates an ingredient
   *     parameters:
   *       - $ref: '#/components/parameters/id'
   *     requestBody:
   *       description: Ingredient data to update
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/IngredientData'
   *     responses:
   *       200:
   *         description: The updated ingredient.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Ingredient'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .put(async function (req, res) {
    const ingredient: Ingredient.Ingredient = res.locals.ingredient;
    const { name, type } = req.body;
    const id = await Ingredient.update({ id: ingredient.id, name, type });
    const ingredientUpdated = await Ingredient.get(id);
    res.status(200).send(ingredientUpdated);
  })

  /**
   * @openapi
   * /ingredients/{id}:
   *   delete:
   *     tags:
   *       - ingredients
   *     description: Deletes an ingredient by id.
   *     parameters:
   *       - $ref: '#/components/parameters/id'
   *     responses:
   *       204:
   *         $ref: '#/components/responses/204'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   *       500:
   *         $ref: '#/components/responses/500'
   */
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
