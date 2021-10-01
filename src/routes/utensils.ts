import express from "express";

import { getAllUtensils } from "@services/db";

const router = express.Router();

/* GET utensils. */
router.get("/", async function (req, res) {
  const utensils = await getAllUtensils();
  res.status(200).send(utensils);
});

export default router;
