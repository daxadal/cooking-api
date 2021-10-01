import express from "express";

import { Recipe } from "@services/db";

const router = express.Router();

/* GET steps. */
router.get("/", async function (req, res) {
  const steps = req.query.detailed
    ? await Recipe.getAllDetailed()
    : await Recipe.getAll();
  res.status(200).send(steps);
});

export default router;
