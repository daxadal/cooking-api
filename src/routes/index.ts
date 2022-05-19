import express from "express";

import { environment } from "@/config";
import { Ingredient, Recipe, Step, Utensil } from "@/services/db";

const router = express.Router();

router.get("/", async function (req, res) {
  res.status(200).send({
    environment,
    stats: {
      ingredients: await Ingredient.count(),
      utensils: await Utensil.count(),
      steps: await Step.count(),
      recipes: await Recipe.count(),
    },
  });
});

export default router;
