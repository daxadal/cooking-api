import express, { RequestHandler } from "express";

import { Ingredient, Step } from "@/services/db";
import {
  Ingredient as TIngredient,
  IngredientType,
  IngredientData,
} from "@/services/schemas";
import { validateBody, validatePathId } from "@/services/joi";

const router = express.Router();
router.use(express.json({ limit: "100kb" }));

const loadIngredient: RequestHandler = async (req, res, next) => {
  const logger = res.locals.logger || console;
  try {
    const ingredient = await Ingredient.get(parseInt(req.params.id));
    if (ingredient) {
      res.locals.ingredient = ingredient;
      next();
    } else {
      res.status(404).send({ message: "Ingredient not found" });
    }
  } catch (error) {
    logger.error(
      `Internal server error at ${req.method} ${req.originalUrl}`,
      error
    );
    res.status(500).send({ message: "Internal server error" });
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
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/")
  .get(async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const ingredients = await Ingredient.getAll();
      res.status(200).send(ingredients);
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
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
  .post(validateBody(IngredientData), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const { name, type } = req.body as IngredientData;
      const newId = await Ingredient.create({ name, type });
      const ingredient = await Ingredient.get(newId);
      res.status(200).send(ingredient);
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
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
    const logger = res.locals.logger || console;
    try {
      res.status(200).send(res.locals.ingredient);
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
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
  .put(validateBody(IngredientData), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const ingredient = res.locals.ingredient as TIngredient;
      const { name, type } = req.body as IngredientData;
      const id = await Ingredient.update({ id: ingredient.id, name, type });
      const ingredientUpdated = await Ingredient.get(id);
      res.status(200).send(ingredientUpdated);
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
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
    const logger = res.locals.logger || console;
    try {
      const ingredient = res.locals.ingredient as TIngredient;
      const deletedRowsCount = await Ingredient.destroy(ingredient.id);
      if (deletedRowsCount === 1) res.status(204).send();
      else
        res.status(500).send({
          message: `Internal server error. ${deletedRowsCount} rows were deleted instead of one`,
        });
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
  });

/**
 * @openapi
 * /ingredients/{id}/outcomes:
 *   get:
 *     tags:
 *       - ingredients
 *       - steps
 *     description: Get all steps that use this ingredient as source.
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: A list of the steps that use this ingredient as source.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetailedStep'
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get("/:id(\\d+)/outcomes", async function (req, res) {
  const logger = res.locals.logger || console;
  try {
    const ingredient = res.locals.ingredient as TIngredient;
    if (ingredient.type === IngredientType.END) {
      res.status(400).send({
        message: "This is an end ingredient. It cannot be cooked further.",
      });
    } else {
      const steps = await Step.queryDetailedFromInput(ingredient.id);
      res.status(200).send(steps);
    }
  } catch (error) {
    logger.error(
      `Internal server error at ${req.method} ${req.originalUrl}`,
      error
    );
    res.status(500).send({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /ingredients/{id}/sources:
 *   get:
 *     tags:
 *       - ingredients
 *       - steps
 *     description: Get all steps that result into this ingredient.
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: A list of the steps that result into this ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetailedStep'
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get("/:id(\\d+)/sources", async function (req, res) {
  const logger = res.locals.logger || console;
  try {
    const ingredient = res.locals.ingredient as TIngredient;
    if (ingredient.type === IngredientType.START) {
      res.status(400).send({
        message:
          "This is a start ingredient. It cannot have been cooked before.",
      });
    } else {
      const steps = await Step.queryDetailedFromOutput(ingredient.id);
      res.status(200).send(steps);
    }
  } catch (error) {
    logger.error(
      `Internal server error at ${req.method} ${req.originalUrl}`,
      error
    );
    res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
