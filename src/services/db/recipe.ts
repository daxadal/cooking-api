import { RowDataPacket } from "mysql2/promise";

import { deepen, filterNullValues } from "@/services/manipulation";
import { query } from "@/services/db/setup";
import type {
  DetailedIncompleteRecipe,
  DetailedRecipe,
  SimpleIncompleteRecipe,
  SimpleRecipe,
} from "@/services/schemas";

function completeRecipe(recipe: SimpleIncompleteRecipe): SimpleRecipe;
function completeRecipe(recipe: DetailedIncompleteRecipe): DetailedRecipe;
function completeRecipe(
  recipe: SimpleIncompleteRecipe | DetailedIncompleteRecipe
): SimpleRecipe | DetailedRecipe {
  let steps: number, output: any;
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
}

export async function getAll(): Promise<SimpleRecipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from recipe;"
  );
  const cleanRows = rows.map((row) =>
    filterNullValues(row, fields)
  ) as SimpleIncompleteRecipe[];
  const completeRows = cleanRows.map((row) => completeRecipe(row));
  return completeRows as SimpleRecipe[];
}

export async function getAllDetailed(): Promise<DetailedRecipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from detailed_recipe;"
  );
  const cleanRows = rows.map((row) => filterNullValues(row, fields));
  const deepRows = cleanRows.map((row) =>
    deepen(row, Object.keys(row))
  ) as DetailedIncompleteRecipe[];
  const completeRows = deepRows.map((row) => completeRecipe(row));
  return completeRows as DetailedRecipe[];
}

export async function count(): Promise<number> {
  const { rows } = await query<RowDataPacket[]>("select count(*) from recipe;");
  return rows?.[0]?.["count(*)"];
}
