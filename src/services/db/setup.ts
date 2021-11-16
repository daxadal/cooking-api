import { readFileSync } from "fs";
import mysql, {
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import path from "path";
import { getLogger } from "@services/winston";
import { database as dbConfig } from "@services/config";

type Rows =
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader;
interface QueryResult<T extends Rows> {
  rows: T;
  fields: string[];
}
let connection: mysql.Connection;
const logger = getLogger();

export async function createConnection(): Promise<void> {
  logger.info("Connecting to MySQL ...");
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    multipleStatements: true,
    namedPlaceholders: true,
  });
  logger.info("Connected to MySQL");

  const { rows: databases } = await query<RowDataPacket[]>("show databases;");
  const database = databases.find((row) => row.Database === dbConfig.name);
  if (database) {
    logger.info("Database found. Using existing database");
    await query<OkPacket>(`use ${dbConfig.name};`);
  } else {
    logger.info("Database not found. Creating database...");
    await query<OkPacket>(`create database ${dbConfig.name};`);
    await query<OkPacket>(`use ${dbConfig.name};`);
    await query<OkPacket[]>(readSqlScript("create-tables"));
    logger.info("Database created. Populating ...");
    await loadTable("utensil");
    await loadTable("ingredient");
    await loadTable("step");
    logger.info("Tables populated");
  }
}

export function closeConnection(): void {
  logger.info("Disconnecting from MySQL ...");
  connection.destroy();
}

export async function query<T extends Rows>(
  query: string,
  params?: Record<string, unknown>
): Promise<QueryResult<T>> {
  const [rows, fields] = await connection.query<T>(query, params);
  const fieldNames = fields && fields.filter((f) => f).map((f) => f.name);
  logger.debug("MySQL: > " + query, { rows, fields: fieldNames });
  return { rows, fields: fieldNames || [] };
}

const readSqlScript = (filename: string) =>
  readFileSync(path.resolve(__dirname, `../../sql/${filename}.sql`)).toString();

const loadTable = (tableName: string) => {
  const location = path.resolve(__dirname, `../../sql/${tableName}.csv`);
  return query<OkPacket>(
    `LOAD DATA INFILE '${location}' INTO TABLE ${tableName}`
  );
};
