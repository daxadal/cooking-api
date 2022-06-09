import express, { RequestHandler } from "express";

import { Step, Utensil } from "@/services/db";
import { Utensil as TUtensil, UtensilData } from "@/services/schemas";
import { validateBody, validatePathId } from "@/services/joi";

const router = express.Router();

const loadUtensil: RequestHandler = async function (req, res, next) {
  const logger = res.locals.logger || console;
  try {
    const utensil = await Utensil.get(parseInt(req.params.id));
    if (utensil) {
      res.locals.utensil = utensil;
      next();
    } else {
      res.status(404).send({ message: "Utensil not found" });
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
 * /utensils:
 *   get:
 *     tags:
 *       - utensils
 *     description: Get all available utensils.
 *     responses:
 *       200:
 *         description: A list of all utensils.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Utensil'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/")
  .get(async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const utensils = await Utensil.getAll();
      res.status(200).send(utensils);
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
   * /utensils:
   *   post:
   *     tags:
   *       - utensils
   *     description: Creates an utensil
   *     requestBody:
   *       description: Utensil to create
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UtensilData'
   *     responses:
   *       200:
   *         description: The created utensil.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Utensil'
   *       400:
   *         $ref: '#/components/responses/400'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .post(validateBody(UtensilData), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const { name, waitTimeInMillis } = req.body as UtensilData;
      const id = await Utensil.create({ name, waitTimeInMillis });
      const utensil = await Utensil.get(id);
      res.status(200).send(utensil);
    } catch (error) {
      logger.error(
        `Internal server error at ${req.method} ${req.originalUrl}`,
        error
      );
      res.status(500).send({ message: "Internal server error" });
    }
  });

router.use("/:id(\\d+)", validatePathId, loadUtensil);

/**
 * @openapi
 * /utensils/{id}:
 *   get:
 *     tags:
 *       - utensils
 *     description: Get an utensil by id.
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: The requested utensil.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utensil'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/:id(\\d+)")
  .get(async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      res.status(200).send(res.locals.utensil);
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
   * /utensils/{id}:
   *   put:
   *     tags:
   *       - utensils
   *     description: Updates an utensil
   *     parameters:
   *       - $ref: '#/components/parameters/id'
   *     requestBody:
   *       description: Utensil data to update
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UtensilData'
   *     responses:
   *       200:
   *         description: The updated utensil.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Utensil'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   *       500:
   *         $ref: '#/components/responses/500'
   */
  .put(validateBody(UtensilData), async function (req, res) {
    const logger = res.locals.logger || console;
    try {
      const utensil = res.locals.utensil as TUtensil;
      const { name, waitTimeInMillis } = req.body as UtensilData;
      const id = await Utensil.update({
        id: utensil.id,
        name,
        waitTimeInMillis,
      });
      const utensilUpdated = await Utensil.get(id);
      res.status(200).send(utensilUpdated);
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
   * /utensils/{id}:
   *   delete:
   *     tags:
   *       - utensils
   *     description: Deletes an utensil by id.
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
      const utensil = res.locals.utensil as TUtensil;

      const steps = await Step.search({ utensil: utensil.id });
      if (steps.length > 0) {
        res.status(400).send({
          message:
            "The utensil utensil is being used on steps. It can't be deleted.",
          steps,
        });
        return;
      }

      const deletedRowsCount = await Utensil.destroy(utensil.id);
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
 * /utensils/{id}/uses:
 *   get:
 *     tags:
 *       - utensils
 *       - steps
 *     description: Get all steps that use this utensil.
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: A list of the steps that use this utensil.
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
router.get("/:id(\\d+)/uses", async function (req, res) {
  const logger = res.locals.logger || console;
  try {
    const utensil = res.locals.utensil as TUtensil;
    const steps = await Step.searchDetailed({ utensil: utensil.id });
    res.status(200).send(steps);
  } catch (error) {
    logger.error(
      `Internal server error at ${req.method} ${req.originalUrl}`,
      error
    );
    res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
