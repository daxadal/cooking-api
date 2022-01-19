import express from "express";

import { Step } from "@services/db";

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
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/")
  .get(async function (req, res) {
    const steps = req.query.detailed
      ? await Step.getAllDetailed()
      : await Step.getAll();
    res.status(200).send(steps);
  })

  /**
   * @openapi
   * /ingredients:
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
   *               $ref: '#/components/schemas/SimpleStep'
   *       400:
   *         $ref: '#/components/responses/400'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .post(async function (req, res) {
    const { input, utensil, output } = req.body;
    await Step.create({ input, utensil, output });
    const step = await Step.getDetailed({ input, utensil, output });
    res.status(200).send(step);
  });

export default router;
