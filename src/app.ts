import express, { Request, Response, NextFunction } from "express";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";

const app = express();

app.use(express.json());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404
app.use(function (req, res, next) {
  res.status(404).send({ message: "Endpoint not found" });
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("500 Internal server error:", err);
  res.status(500).send({ message: "Internal server error" });
});

const PORT = process.env.PORT;
const port = PORT ? parseInt(PORT) : 3000;
app.set("port", port);

const server = app.listen(port, () => {
  console.info("Listening on port", port);
});

process.on("SIGINT", () => {
  console.warn("SIGINT sent");
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.warn("SIGTERM sent");
  process.exit(0)
})

export default server;
