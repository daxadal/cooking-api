import express from "express";

import { Recipe } from "@services/db";

const router = express.Router();

/**
 * @openapi
 * /recipes:
 *   get:
 *     tags:
 *       - recipes
 *     description: Get all avaliable recipes.
 *     parameters:
 *       - name: detailed
 *         in: query
 *         description: If detailed, all the info of the ingredients and utensils
 *           is returned. If not, only the ids are returned.
 *         required: false
 *         default: false
 *         type: boolean
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
router.get("/", async function (req, res) {
  const steps = req.query.detailed
    ? await Recipe.getAllDetailed()
    : await Recipe.getAll();
  res.status(200).send(steps);
});

export default router;
