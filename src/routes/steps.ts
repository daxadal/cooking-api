import express from "express";

import { Step } from "@services/db";

const router = express.Router();

/* GET steps. */
router.get("/", async function (req, res) {
  const steps = req.query.detailed
    ? await Step.getAllDetailed()
    : await Step.getAll();
  res.status(200).send(steps);
});

export default router;
