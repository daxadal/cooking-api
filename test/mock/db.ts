import { OkPacket } from "mysql2/promise";

import { query, QueryResult } from "@services/db/setup";
import { Ingredient } from "@services/db/ingredient";
import { Utensil } from "@services/db/utensil";
import { SimpleStep } from "@services/db/step";

export function clearDatabase(): Promise<QueryResult<OkPacket>[]> {
  return Promise.all([
    query<OkPacket>("delete from ingredient;"),
    query<OkPacket>("delete from utensil;"),
    query<OkPacket>("delete from step;"),
  ]);
}

export async function createMockIngredient({
  id,
  name,
  type,
}: Ingredient): Promise<number> {
  const { rows } = await query<OkPacket>(
    "insert into ingredient (id, name, type) values (:id, :name, :type);",
    { id, name, type }
  );
  return rows.insertId;
}

export async function createMockUtensil({
  id,
  name,
  waitTimeInMillis,
}: Utensil): Promise<number> {
  const { rows } = await query<OkPacket>(
    "insert into utensil (id, name, waitTimeInMillis) values (id, :name, :waitTimeInMillis);",
    { id, name, waitTimeInMillis }
  );
  return rows.insertId;
}

export async function createMockStep({
  input,
  utensil,
  output,
}: SimpleStep): Promise<number> {
  const { rows } = await query<OkPacket>(
    "insert into step (input, utensil, output) values (:input, :utensil, :output);",
    { input, utensil, output }
  );
  return rows.insertId;
}
