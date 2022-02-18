import { OkPacket, RowDataPacket } from "mysql2/promise";

import { query } from "@/services/db/setup";
import type { Ingredient } from "@/services/schemas";

export async function get(id: number): Promise<Ingredient | undefined> {
  const { rows } = await query<RowDataPacket[]>(
    "select * from ingredient where id = :id;",
    { id }
  );
  return rows.length > 0 ? (rows[0] as Ingredient) : undefined;
}

export async function getAll(): Promise<Ingredient[]> {
  const { rows } = await query<RowDataPacket[]>("select * from ingredient;");
  return rows as Ingredient[];
}

export async function create({
  name,
  type,
}: Omit<Ingredient, "id">): Promise<number> {
  const { rows } = await query<OkPacket>(
    "insert into ingredient (name, type) values (:name, :type);",
    { name, type }
  );
  return rows.insertId;
}

export async function update({ id, name, type }: Ingredient): Promise<number> {
  const { rows } = await query<OkPacket>(
    "replace into ingredient (id, name, type) values (:id, :name, :type);",
    { id, name, type }
  );
  return rows.insertId;
}

export async function destroy(id: number): Promise<number> {
  const { rows } = await query<OkPacket>(
    "delete from ingredient where id=:id",
    { id }
  );
  return rows.affectedRows;
}
