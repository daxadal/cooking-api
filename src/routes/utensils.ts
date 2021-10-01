import express from "express";

import { getAllUtensils, getUtensil } from "@services/db";

const router = express.Router();

/* GET utensils. */
router.get("/", async function (req, res) {
  const utensils = await getAllUtensils();
  res.status(200).send(utensils);
});

/* GET utensil by id. */
router.get("/:id(\\d+)", async function (req, res) {
  const utensil = await getUtensil(parseInt(req.params.id));

  if (utensil) res.status(200).send(utensil);
  else res.status(404).send({ message: "Utensil not found" });
});

export default router;
