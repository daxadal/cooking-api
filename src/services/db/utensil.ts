import { OkPacket, RowDataPacket } from "mysql2/promise";

import { query } from "@/services/db/setup";
import type { Utensil } from "@/services/schemas";

export async function get(id: number): Promise<Utensil | undefined> {
  const { rows } = await query<RowDataPacket[]>(
    "select * from utensil where id = :id;",
    { id }
  );
  return rows.length > 0 ? (rows[0] as Utensil) : undefined;
}

export async function getAll(): Promise<Utensil[]> {
  const { rows } = await query<RowDataPacket[]>("select * from utensil;");
  return rows as Utensil[];
}

export async function create({
  name,
  waitTimeInMillis,
}: Omit<Utensil, "id">): Promise<number> {
  const { rows } = await query<OkPacket>(
    "insert into utensil (name, waitTimeInMillis) values (:name, :waitTimeInMillis);",
    { name, waitTimeInMillis }
  );
  return rows.insertId;
}

export async function update({
  id,
  name,
  waitTimeInMillis,
}: Utensil): Promise<number> {
  const { rows } = await query<OkPacket>(
    "replace into utensil (id, name, waitTimeInMillis) values (:id, :name, :waitTimeInMillis);",
    { id, name, waitTimeInMillis }
  );
  return rows.insertId;
}

export async function destroy(id: number): Promise<number> {
  const { rows } = await query<OkPacket>("delete from utensil where id=:id", {
    id,
  });
  return rows.affectedRows;
}
