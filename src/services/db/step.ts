import { OkPacket, RowDataPacket } from "mysql2/promise";

import { deepen } from "@/services/manipulation";
import { query } from "@/services/db/setup";
import type { DetailedStep, SimpleStep } from "@/services/schemas";

export async function get({
  input,
  utensil,
  output,
}: SimpleStep): Promise<SimpleStep | undefined> {
  const { rows } = await query<RowDataPacket[]>(
    "select * from step where input = :input and utensil = :utensil and output = :output;",
    { input, utensil, output }
  );
  return rows.length > 0 ? (rows[0] as SimpleStep) : undefined;
}

export async function getDetailed({
  input,
  utensil,
  output,
}: SimpleStep): Promise<DetailedStep | undefined> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where input_id = :input and utensil_id = :utensil and output_id = :output;",
    { input, utensil, output }
  );
  return rows.length > 0
    ? (deepen(rows[0], fields) as DetailedStep)
    : undefined;
}

export async function search({
  input,
  utensil,
  output,
}: Partial<SimpleStep>): Promise<SimpleStep[]> {
  const constraints = [];
  if (input) constraints.push("input = :input");
  if (utensil) constraints.push("utensil = :utensil");
  if (output) constraints.push("output = :output");

  const { rows } = await query<RowDataPacket[]>(
    `select * from step where ${constraints.join(" and ")};`,
    { input, utensil, output }
  );
  return rows as SimpleStep[];
}

export async function searchDetailed({
  input,
  utensil,
  output,
}: Partial<SimpleStep>): Promise<DetailedStep[]> {
  const constraints = [];
  if (input) constraints.push("input_id = :input");
  if (utensil) constraints.push("utensil_id = :utensil");
  if (output) constraints.push("output_id = :output");

  const { rows, fields } = await query<RowDataPacket[]>(
    `select * from detailed_step where ${constraints.join(" and ")};`,
    { input, utensil, output }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function getAll(): Promise<SimpleStep[]> {
  const { rows } = await query<RowDataPacket[]>("select * from step;");
  return rows as SimpleStep[];
}

export async function getAllDetailed(): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step;"
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function count(): Promise<number> {
  const { rows } = await query<RowDataPacket[]>("select count(*) from step;");
  return rows?.[0]?.["count(*)"];
}

export async function create({
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

export async function queryDetailedFromInput(
  input: number
): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where input_id= :input;",
    { input }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function queryDetailedFromOutput(
  output: number
): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where output_id= :output;",
    { output }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function queryDetailedFromUtensil(
  utensil: number
): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step where utensil_id= :utensil;",
    { utensil }
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
}

export async function destroy({
  input,
  utensil,
  output,
}: SimpleStep): Promise<number> {
  const { rows } = await query<OkPacket>(
    "delete from step where input = :input and utensil = :utensil and output = :output;",
    { input, utensil, output }
  );
  return rows.affectedRows;
}
