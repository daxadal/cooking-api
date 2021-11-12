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
router.get("/", async function (req, res) {
  const steps = req.query.detailed
    ? await Step.getAllDetailed()
    : await Step.getAll();
  res.status(200).send(steps);
});

export default router;
