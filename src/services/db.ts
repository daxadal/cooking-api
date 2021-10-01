// get the client
import { readFileSync } from "fs";
import mysql, {
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import path from "path";
import { deepen } from "./deepen";
import { getLogger } from "./winston";

export enum IngredientType {
  START = "start",
  MID = "mid",
  END = "end",
}

export interface Ingredient {
  id: number;
  name: string;
  type: IngredientType;
}

export interface Utensil {
  id: number;
  name: string;
  waitTimeInMillis: number;
}

export interface Step<
  Input extends Ingredient | number = number,
  Ut extends Utensil | number = number,
  Output extends Ingredient | number = number
> {
  input: Input;
  utensil: Ut;
  output: Output;
}

export type DetailedStep = Step<Ingredient, Utensil, Ingredient>;

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

const DB_NAME = "kitchen_js";

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
  const database = databases.find((row) => row.Database === DB_NAME);
  if (database) {
    logger.info("Database found. Using existing database");
    await query<OkPacket>(`use ${DB_NAME};`);
  } else {
    logger.info("Database not found. Creating database...");
    await query<OkPacket>(`create database ${DB_NAME};`);
    await query<OkPacket>(`use ${DB_NAME};`);
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

async function query<T extends Rows>(
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

export async function getAllIngredients(): Promise<Ingredient[]> {
  const { rows } = await query<RowDataPacket[]>("select * from ingredient;");
  return rows as Ingredient[];
}

export async function getIngredient(
  id: number
): Promise<Ingredient | undefined> {
  const { rows } = await query<RowDataPacket[]>(
    "select * from ingredient where id = :id;",
    { id }
  );
  return rows.length > 0 ? (rows[0] as Ingredient) : undefined;
}

export async function getAllUtensils(): Promise<Utensil[]> {
  const { rows } = await query<RowDataPacket[]>("select * from utensil;");
  return rows as Utensil[];
}

export async function getUtensil(id: number): Promise<Utensil | undefined> {
  const { rows } = await query<RowDataPacket[]>(
    "select * from utensil where id = :id;",
    { id }
  );
  return rows.length > 0 ? (rows[0] as Utensil) : undefined;
}

export async function getAllSteps(): Promise<Step[]> {
  const { rows } = await query<RowDataPacket[]>("select * from step;");
  return rows as Step[];
}

export async function getAllDetailedSteps(): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step;"
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function getDetailedStepsFromInput(
  input: number
): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where input_id= :input;",
    { input }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}
