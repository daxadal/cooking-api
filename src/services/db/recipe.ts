import { RowDataPacket } from "mysql2/promise";

import { deepen, filterNullValues } from "@/services/manipulation";
import { query } from "@/services/db/setup";
import { DetailedRecipe, SimpleRecipe } from "@/services/schemas";

export async function getAll(): Promise<SimpleRecipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from recipe;"
  );
  return rows.map((row) => filterNullValues(row, fields)) as SimpleRecipe[];
}

export async function getAllDetailed(): Promise<DetailedRecipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_recipe;"
  );
  return rows
    .map((row) => filterNullValues(row, fields))
    .map((row) => deepen(row, Object.keys(row))) as DetailedRecipe[];
}

export async function count(): Promise<number> {
  const { rows } = await query<RowDataPacket[]>("select count(*) from recipe;");
  return rows?.[0]?.["count(*)"];
}
