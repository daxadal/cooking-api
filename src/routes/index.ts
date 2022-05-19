import express from "express";

import { environment } from "@/config";
import { Ingredient, Recipe, Step, Utensil } from "@/services/db";

const router = express.Router();

router.get("/", async function (req, res) {
  const logger = res.locals.logger || console;
  try {
    res.status(200).send({
      environment,
      stats: {
        ingredients: await Ingredient.count(),
        utensils: await Utensil.count(),
        steps: await Step.count(),
        recipes: await Recipe.count(),
      },
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
