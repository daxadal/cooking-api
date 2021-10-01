import express from "express";

import { getAllIngredients } from "@services/db";

const router = express.Router();

/* GET ingredients. */
router.get("/", async function (req, res) {
  const ingredients = await getAllIngredients();
  res.status(200).send(ingredients);
});

export default router;
