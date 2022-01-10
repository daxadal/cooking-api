import { readFileSync } from "fs";
import mysql, {
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import path from "path";
import { getLogger } from "@services/winston";
import { database as dbConfig } from "@config/index";

type Rows =
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader;

export interface QueryResult<T extends Rows> {
  rows: T;
  fields: string[];
}

let connection: mysql.Connection;
const logger = getLogger();

interface ConnectionOptions {
  autoPopulate?: boolean;
}

export function connectToMySQL(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
    namedPlaceholders: true,
  });
}

export async function createConnection({
  autoPopulate = true,
}: ConnectionOptions): Promise<void> {
  logger.info("Connecting to MySQL ...");
  connection = await connectToMySQL();
  logger.info("Connected to MySQL");

  const { rows: databases } = await query<RowDataPacket[]>("show databases;");
  const database = databases.find((row) => row.Database === dbConfig.name);
  if (database) {
    logger.info(`Database "${dbConfig.name}" found. Using existing database`);
    await query<OkPacket>(`use ${dbConfig.name};`);
  } else {
    logger.info(`Database "${dbConfig.name}" not found. Creating database...`);
    await query<OkPacket>(`create database ${dbConfig.name};`);
    await query<OkPacket>(`use ${dbConfig.name};`);
    await query<OkPacket[]>(readSqlScript("create-tables"));
    if (autoPopulate) {
      logger.info("Database created. Populating ...");
      await populateTables();
      logger.info("Tables populated");
    } else {
      logger.info("Database created. Population was skipped.");
    }
  }
}

export function populateTables(): Promise<QueryResult<mysql.OkPacket>[]> {
  return Promise.all([
    loadTable("ingredient"),
    loadTable("utensil"),
    loadTable("step"),
  ]);
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
  readFileSync(
    path.resolve(__dirname, `../../../sql/${filename}.sql`)
  ).toString();

export const loadTable = (
  tableName: string
): Promise<QueryResult<mysql.OkPacket>> => {
  const location = path.resolve(__dirname, `../../../sql/${tableName}.csv`);
  return query<OkPacket>(
    `LOAD DATA INFILE '${location}' INTO TABLE ${tableName}`
  );
};
