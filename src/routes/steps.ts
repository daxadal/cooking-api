import express from "express";

import { getAllDetailedSteps, getAllSteps } from "@services/db";

const router = express.Router();

/* GET steps. */
router.get("/", async function (req, res) {
  const steps = req.query.detailed
    ? await getAllDetailedSteps()
    : await getAllSteps();
  res.status(200).send(steps);
});

export default router;
