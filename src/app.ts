import "module-alias/register";
import express, { Request, Response, NextFunction } from "express";

import indexRouter from "./routes/index";
import ingredientsRouter from "./routes/ingredients";
import stepsRouter from "./routes/steps";
import usersRouter from "./routes/users";
import utensilsRouter from "./routes/utensils";

import { getLogger, initLogger } from "./services/winston";
import { closeConnection, createConnection } from "./services/db";

const logger = getLogger();

createConnection();

const app = express();

app.use(express.json());

app.use(initLogger());

app.use("/", indexRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/steps", stepsRouter);
app.use("/users", usersRouter);
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

const PORT = process.env.PORT;
const port = PORT ? parseInt(PORT) : 3000;
app.set("port", port);

const server = app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

process.on("SIGINT", () => {
  closeConnection();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeConnection();
  process.exit(0);
});

export default server;
