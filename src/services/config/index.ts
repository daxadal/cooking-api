import { config } from "dotenv";

import { parseEnvString } from "./helpers";

const { error, parsed } = config();

const parsingErrors: string[] = [];

export const database = {
  name: parseEnvString("DB_NAME", parsingErrors),
};

export const configDebug = { dotenv: { error, parsed }, parsingErrors };
