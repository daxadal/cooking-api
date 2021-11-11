import express, { RequestHandler } from "express";

import { Step, Utensil } from "@services/db";
import { validatePathId } from "@services/joi";

const router = express.Router();

const loadUtensil: RequestHandler = async function (req, res, next) {
  const utensil = await Utensil.get(parseInt(req.params.id));
  if (utensil) {
    res.locals.utensil = utensil;
    next();
  } else {
    res.status(404).send({ message: "Utensil not found" });
  }
};

/**
 * @openapi
 * /utensils:
 *   get:
 *     tags:
 *       - utensils
 *     description: Get all avaliable utensils.
 *     responses:
 *       200:
 *         description: A list of all utensils.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Utensil'
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/")
  .get(async function (req, res) {
    const utensils = await Utensil.getAll();
    res.status(200).send(utensils);
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
  .post(async function (req, res) {
    const { name, waitTimeInMillis } = req.body;
    const id = await Utensil.create({ name, waitTimeInMillis });
    const utensil = await Utensil.get(id);
    res.status(200).send(utensil);
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
    res.status(200).send(res.locals.utensil);
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
  .put(async function (req, res) {
    const utensil: Utensil.Utensil = res.locals.utensil;
    const { name, waitTimeInMillis } = req.body;
    const id = await Utensil.update({ id: utensil.id, name, waitTimeInMillis });
    const utensilUpdated = await Utensil.get(id);
    res.status(200).send(utensilUpdated);
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
    await Utensil.destroy(res.locals.utensil.id);
    res.status(204).send();
  });

/* GET step by utensil. */
router.get("/:id(\\d+)/uses", async function (req, res) {
  const steps = await Step.queryDetailedFromUtensil(res.locals.utensil.id);
  res.status(200).send(steps);
});

export default router;
