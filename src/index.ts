import "module-alias/register";

import { getLogger } from "@services/winston";
import { closeConnection, createConnection } from "@services/db/setup";
import { configDebug, database as dbConfig } from "@config/index";
import app from "./app";

const logger = getLogger();

logger.info("=== SERVER STARTUP ===");

if (configDebug.dotenv.error)
  logger.warn(`Could NOT parse .env, Error:`, configDebug.dotenv.error);
else if (!configDebug.dotenv.parsed)
  logger.info(`Parsing .env produced no result`);
else
  logger.info(
    `.env parsed. ${
      Object.keys(configDebug.dotenv.parsed).length
    } variables found.`
  );

if (configDebug.parsingErrors.length > 0) {
  logger.error(`@config initialization failed`, {
    errors: configDebug.parsingErrors,
  });
  logger.info("Exiting on error...\n");
  process.exit(1);
}

createConnection({ autoPopulate: dbConfig.autoPopulate }).catch((error) => {
  logger.error("Error creating connection to DB:", error);
  process.exit(1);
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
