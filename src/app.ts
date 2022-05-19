import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import indexRouter from "@/routes/index";
import docsRouter from "@/routes/docs";
import ingredientsRouter from "@/routes/ingredients";
import recipesRouter from "@/routes/recipes";
import stepsRouter from "@/routes/steps";
import utensilsRouter from "@/routes/utensils";
import { initLogger } from "@/services/winston";

const app = express();

app.use(cors());

app.use(express.json());

app.use(initLogger());

app.use("/", indexRouter);
app.use("/docs", docsRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/recipes", recipesRouter);
app.use("/steps", stepsRouter);
app.use("/utensils", utensilsRouter);

// catch 404
app.use((req, res) => {
  const logger = res.locals.logger || console;
  logger.error(
    `Error at ${req.method} ${req.originalUrl} - Endpoint not found`
  );
  res.status(404).send({ message: "Endpoint not found" });
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const logger = res.locals.logger || console;
  logger.error(
    `Internal server error at ${req.method} ${req.originalUrl} captured at final handler`,
    err
  );
  res.status(500).send({ message: "Internal server error" });
});

export default app;
