import express from "express";

import { Recipe } from "@/services/db";
import { DetailedQuery } from "@/services/schemas";
import { validateQuery } from "@/services/joi";

const router = express.Router();

/**
 * @openapi
 * /recipes:
 *   get:
 *     tags:
 *       - recipes
 *     description: Get all available recipes.
 *     parameters:
 *       - $ref: '#/components/parameters/detailed'
 *     responses:
 *       200:
 *         description: A list of all recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get("/", validateQuery(DetailedQuery), async function (req, res) {
  const logger = res.locals.logger || console;
  try {
    const recipes = req.query.detailed
      ? await Recipe.getAllDetailed()
      : await Recipe.getAll();
    res.status(200).send(recipes);
  } catch (error) {
    logger.error(
      `Internal server error at ${req.method} ${req.originalUrl}`,
      error
    );
    res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
