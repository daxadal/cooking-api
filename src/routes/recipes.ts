import express from "express";

import { getAllDetailedRecipes, getAllRecipes } from "@services/db";

const router = express.Router();

/* GET steps. */
router.get("/", async function (req, res) {
  const steps = req.query.detailed
    ? await getAllDetailedRecipes()
    : await getAllRecipes();
  res.status(200).send(steps);
});

export default router;
