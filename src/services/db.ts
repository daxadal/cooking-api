// get the client
import { readFileSync } from "fs";
import mysql, {
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import path from "path";
import { deepen, filterNullValues } from "./manipulation";
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

export interface IncompleteRecipe<
  I extends Ingredient | number = number,
  Ut extends Utensil | number = number
> {
  input: I;
  utensil1: Ut;
  mid1: I;
  utensil2?: Ut;
  mid2?: I;
  utensil3?: Ut;
  mid3?: I;
  utetsil4?: Ut;
  mid4?: I;
  utensil5?: Ut;
  mid5?: I;
}

export interface Recipe<
  I extends Ingredient | number = number,
  Ut extends Utensil | number = number
> extends IncompleteRecipe<I, Ut> {
  steps: number;
  output: I;
}

export type DetailedRecipe = Recipe<Ingredient, Utensil>;

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

export async function createIngredient({
  name,
  type,
}: Omit<Ingredient, "id">): Promise<void> {
  await query<OkPacket>(
    "insert into ingredient (name, type) values (:name, :type);",
    { name, type }
  );
}

export async function updateIngredient({
  id,
  name,
  type,
}: Ingredient): Promise<void> {
  await query<OkPacket>(
    "replace into ingredient (id, name, type) values (:id, :name, :type);",
    { id, name, type }
  );
}

export async function deleteIngredient(id: string): Promise<void> {
  await query<OkPacket>("delete from ingredient where id=:id", { id });
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

export async function createUtensil({
  name,
  waitTimeInMillis,
}: Omit<Utensil, "id">): Promise<void> {
  await query<OkPacket>(
    "insert into utensil (name, waitTimeInMillis) values (:name, :waitTimeInMillis);",
    { name, waitTimeInMillis }
  );
}

export async function updateUtensil({
  id,
  name,
  waitTimeInMillis,
}: Utensil): Promise<void> {
  await query<OkPacket>(
    "replace into utensil (id, name, waitTimeInMillis) values (:id, :name, :waitTimeInMillis);",
    { id, name, waitTimeInMillis }
  );
}

export async function deleteUtensil(id: string): Promise<void> {
  await query<OkPacket>("delete from utensil where id=:id", { id });
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

export async function getDetailedStepsFromOutput(
  output: number
): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where output_id= :output;",
    { output }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function getDetailedStepsFromUtensil(
  utensil: number
): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where utensil_id= :utensil;",
    { utensil }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

const completeRecipe = <
  I extends Ingredient | number,
  Ut extends Utensil | number
>(
  recipe: IncompleteRecipe<I, Ut>
): Recipe<I, Ut> => {
  let steps: number, output: I;
  if (recipe.mid5) {
    steps = 5;
    output = recipe.mid5;
  } else if (recipe.mid4) {
    steps = 4;
    output = recipe.mid4;
  } else if (recipe.mid3) {
    steps = 3;
    output = recipe.mid3;
  } else if (recipe.mid2) {
    steps = 2;
    output = recipe.mid2;
  } else {
    steps = 1;
    output = recipe.mid1;
  }
  return { steps, ...recipe, output };
};

export async function getAllRecipes(): Promise<Recipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from recipe;"
  );
  const cleanRows = rows.map((row) =>
    filterNullValues(row, fields)
  ) as IncompleteRecipe[];
  const completeRows = cleanRows.map((row) => completeRecipe(row));
  return completeRows as Recipe[];
}

export async function getAllDetailedRecipes(): Promise<DetailedRecipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_recipe;"
  );
  const cleanRows = rows.map((row) => filterNullValues(row, fields));
  const deepRows = cleanRows.map((row) =>
    deepen(row, Object.keys(row))
  ) as IncompleteRecipe<Ingredient, Utensil>[];
  const completeRows = deepRows.map((row) => completeRecipe(row));
  return completeRows as DetailedRecipe[];
}
