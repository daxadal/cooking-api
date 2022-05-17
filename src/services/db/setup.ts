import { readFileSync } from "fs";
import mysql, {
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import path from "path";
import { getLogger } from "@/services/winston";
import { database as dbConfig } from "@/config/index";

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
  autoCreate: boolean;
  autoPopulate: boolean;
}

export function connectToMySQL(
  config: mysql.ConnectionOptions = {}
): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
    namedPlaceholders: true,
    ...config,
  });
}

export async function createConnection({
  autoCreate,
  autoPopulate,
}: ConnectionOptions): Promise<void> {
  if (autoCreate) {
    logger.info("Connecting to MySQL ...");
    connection = await connectToMySQL();
    logger.info("Connected to MySQL");

    const { rows: databases } = await query<RowDataPacket[]>("show databases;");
    const database = databases.find((row) => row.Database === dbConfig.name);
    if (database) {
      logger.info(`Database "${dbConfig.name}" found. Using existing database`);
      await query<OkPacket>(`use ${dbConfig.name};`);
    } else {
      logger.info(
        `Database "${dbConfig.name}" not found. Creating database...`
      );
      await query<OkPacket>(`create database ${dbConfig.name};`);
      await query<OkPacket>(`use ${dbConfig.name};`);
      logger.info("Database created.");
    }
  } else {
    logger.info(`Connecting to MySQL, database "${dbConfig.name}"...`);
    connection = await connectToMySQL({ database: dbConfig.name });
    logger.info(`Connected to MySQL, database "${dbConfig.name}"...`);
  }

  const { rows: tables } = await query<RowDataPacket[]>("show tables;");
  if (tables.length > 0) {
    logger.info(
      `Database contains ${tables.length} tables already. No population needed`
    );
  } else if (autoPopulate) {
    logger.info("Creating and populating tables...");
    await query<OkPacket[]>(readSqlScript("create-tables"));
    await populateTables();
    logger.info("Tables created and populated.");
  } else {
    logger.info("Creating tables...");
    await query<OkPacket[]>(readSqlScript("create-tables"));
    logger.info("Tables created. Population was skipped.");
  }
}

export function populateTables(): Promise<number[][]> {
  return Promise.all([
    loadTable(
      "ingredient",
      "insert into ingredient (id, name, type) values (:id, :name, :type);"
    ),
    loadTable(
      "utensil",
      "insert into utensil (id, name, waitTimeInMillis) values (:id, :name, :waitTimeInMillis);"
    ),
    loadTable(
      "step",
      "insert into step (input, utensil, output) values (:input, :utensil, :output);"
    ),
  ]);
}

export function closeConnection(): void {
  logger.info("Disconnecting from MySQL ...");
  connection.end();
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

async function asyncBulkInsert(
  query: string,
  paramsArray: Array<Record<string, unknown>>
) {
  const promises = paramsArray.map((params) =>
    connection.query<OkPacket>(query, params)
  );
  const results = await Promise.all(promises);
  return results.map(([rows, fields]) => {
    const fieldNames = fields && fields.filter((f) => f).map((f) => f.name);
    logger.debug("MySQL: > " + query, { rows, fields: fieldNames });
    return rows.insertId;
  });
}

const readSqlScript = (filename: string) =>
  readFileSync(
    path.resolve(__dirname, `../../../sql/${filename}.sql`)
  ).toString();

function loadTable(tableName: string, insertionQuery: string) {
  const location = path.resolve(__dirname, `../../../sql/${tableName}.json`);
  const rows: any[] = JSON.parse(readFileSync(location).toString());
  return asyncBulkInsert(insertionQuery, rows);
}
