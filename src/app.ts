import express, { Request, Response, NextFunction } from "express";

import indexRouter from "@routes/index";
import docsRouter from "@routes/docs";
import ingredientsRouter from "@routes/ingredients";
import recipesRouter from "@routes/recipes";
import stepsRouter from "@routes/steps";
import utensilsRouter from "@routes/utensils";
import { initLogger } from "@services/winston";

const app = express();

app.use(express.json());

app.use(initLogger());

app.use("/", indexRouter);
app.use("/docs", docsRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/recipes", recipesRouter);
app.use("/steps", stepsRouter);
app.use("/utensils", utensilsRouter);

// catch 404
app.use((req, res, next) => {
  const logger = res.locals.logger || console;
  logger.error(`404 not found: ${req.originalUrl}`);
  res.status(404).send({ message: "Endpoint not found" });
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const logger = res.locals.logger || console;
  logger.error("500 Internal server error:", err);
  res.status(500).send({ message: "Internal server error" });
});

export default app;
