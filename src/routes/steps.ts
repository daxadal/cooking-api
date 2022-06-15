import express from "express";

import { Ingredient, Step, Utensil } from "@/services/db";
import { validateBody, validatePath, validateQuery } from "@/services/joi";
import { DetailedQuery, IngredientType, SimpleStep } from "@/services/schemas";
import Joi from "joi";

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
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: More info about the error
   *                 conflicts:
   *                   type: array
   *                   description: If present, the steps that are preventing creation
   *                   items:
   *                     $ref: "#/components/schemas/SimpleStep"
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .post(validateBody(SimpleStep), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const { input, utensil, output } = req.body as SimpleStep;

      if (input === output) {
        res.status(400).send({
          message: "Input and output can't be the same ingredient",
        });
        return;
      }

      const [
        fullInput,
        fullUtensil,
        fullOutput,

        currentStep,
        otherInputSteps,
        otherUtensilSteps,
        otherOutputSteps,
      ] = await Promise.all([
        Ingredient.get(input),
        Utensil.get(utensil),
        Ingredient.get(output),

        Step.get({ input, utensil, output }),
        Step.search({ utensil, output }),
        Step.search({ input, output }),
        Step.search({ input, utensil }),
      ]);

      if (!fullInput)
        res.status(400).send({
          message: "The specified input ingredient doesn't exist",
        });
      else if (fullInput.type === IngredientType.END)
        res.status(400).send({
          message: "Input ingredient can't be an end ingredient",
        });
      else if (!fullUtensil)
        res.status(400).send({
          message: "The specified utensil doesn't exist",
        });
      else if (!fullOutput)
        res.status(400).send({
          message: "The specified output ingredient doesn't exist",
        });
      else if (fullOutput.type === IngredientType.START)
        res.status(400).send({
          message: "Output ingredient can't be a start ingredient",
        });
      else if (currentStep)
        res.status(400).send({
          message: "This step already exists",
        });
      else if (
        otherInputSteps.length > 0 ||
        otherUtensilSteps.length > 0 ||
        otherOutputSteps.length > 0
      )
        res.status(400).send({
          message: "Steps can't share 2 or more components with another step",
          conflicts: [
            ...otherInputSteps,
            ...otherUtensilSteps,
            ...otherOutputSteps,
          ],
        });
      else {
        await Step.create({ input, utensil, output });
        const step = await Step.getDetailed({ input, utensil, output });
        res.status(200).send(step);
      }
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
  });

router
  .route("/:input(\\d+)-:utensil(\\d+)-:output(\\d+)")
  .all(
    validatePath(
      Joi.object({
        input: Joi.number().integer().required(),
        utensil: Joi.number().integer().required(),
        output: Joi.number().integer().required(),
      })
    )
  )

  /**
   * @openapi
   * /steps/{input}-{utensil}-{output}:
   *   get:
   *     tags:
   *       - steps
   *     description: Get a specific step.
   *     parameters:
   *       - input:
   *           name: input
   *           in: path
   *           description: Step input
   *           required: true
   *           schema:
   *             type: number
   *       - utensil:
   *           name: utensil
   *           in: path
   *           description: Step utensil
   *           required: true
   *           schema:
   *             type: number
   *       - output:
   *           name: output
   *           in: path
   *           description: Step output
   *           required: true
   *           schema:
   *             type: number
   *       - $ref: '#/components/parameters/detailed'
   *     responses:
   *       200:
   *         description: The requested step.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Step'
   *       404:
   *         $ref: '#/components/responses/404'
   *       404:
   *         $ref: '#/components/responses/404'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .get(validateQuery(DetailedQuery), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const input = parseInt(req.params.input);
      const utensil = parseInt(req.params.utensil);
      const output = parseInt(req.params.output);

      const step = req.query.detailed
        ? await Step.getDetailed({ input, utensil, output })
        : await Step.get({ input, utensil, output });

      if (!step) res.status(404).send({ message: "Ingredient not found" });
      else res.status(200).send(step);
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
router.delete("/", validateBody(SimpleStep), async function (req, res) {
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
