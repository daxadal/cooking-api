import express from "express";

import { Ingredient, Step, Utensil } from "@/services/db";
import { validateBody, validateQuery } from "@/services/joi";
import { DetailedQuery, SimpleStep } from "@/services/schemas";

const router = express.Router();

/**
 * @openapi
 * /steps:
 *   get:
 *     tags:
 *       - steps
 *     description: Get all available steps.
 *     parameters:
 *       - $ref: '#/components/parameters/detailed'
 *     responses:
 *       200:
 *         description: A list of all steps.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Step'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/")
  .get(validateQuery(DetailedQuery), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const steps = req.query.detailed
        ? await Step.getAllDetailed()
        : await Step.getAll();
      res.status(200).send(steps);
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
   * /steps:
   *   post:
   *     tags:
   *       - steps
   *     description: Creates an step
   *     requestBody:
   *       description: Step to create
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SimpleStep'
   *     responses:
   *       200:
   *         description: The created ingredient.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DetailedStep'
   *       400:
   *         $ref: '#/components/responses/400'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .post(validateBody(SimpleStep), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const { input, utensil, output } = req.body as SimpleStep;

      const [fullInput, fullUtensil, fullOutput] = await Promise.all([
        Ingredient.get(input),
        Utensil.get(utensil),
        Ingredient.get(output),
      ]);

      if (!fullInput) {
        res.status(400).send({
          message: "The specified input ingredient does not exist",
        });
        return;
      } else if (!fullUtensil) {
        res.status(400).send({
          message: "The specified utensil does not exist",
        });
        return;
      } else if (!fullOutput) {
        res.status(400).send({
          message: "The specified output ingredient does not exist",
        });
        return;
      }

      await Step.create({ input, utensil, output });
      const step = await Step.getDetailed({ input, utensil, output });
      res.status(200).send(step);
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
   * /steps:
   *   delete:
   *     tags:
   *       - steps
   *     description: Deletes an step
   *     requestBody:
   *       description: Step to delete
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SimpleStep'
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
  .delete(validateBody(SimpleStep), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const { input, utensil, output } = req.body as SimpleStep;
      const deletedRowsCount = await Step.destroy({ input, utensil, output });
      if (deletedRowsCount === 1) res.status(204).send();
      else if (deletedRowsCount === 0)
        res.status(404).send({ message: "Step not found" });
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

export default router;
