import { RowDataPacket } from "mysql2/promise";
import { deepen } from "@services/manipulation";
import { query } from "@services/db/setup";
import { Ingredient } from "@services/db/ingredient";
import { Utensil } from "@services/db/utensil";

export interface SimpleStep {
  input: number;
  utensil: number;
  output: number;
}

export interface DetailedStep {
  input: Ingredient;
  utensil: Utensil;
  output: Ingredient;
}

export type Step = SimpleStep | DetailedStep;

export async function getAll(): Promise<Step[]> {
  const { rows } = await query<RowDataPacket[]>("select * from step;");
  return rows as Step[];
}

export async function getAllDetailed(): Promise<DetailedStep[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_step;"
  );
  const deepRows = rows.map((row) => deepen(row, fields));
  return deepRows as DetailedStep[];
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
