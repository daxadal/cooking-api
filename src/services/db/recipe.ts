import { RowDataPacket } from "mysql2/promise";
import { deepen, filterNullValues } from "@services/manipulation";
import { query } from "@services/db/setup";
import { Ingredient } from "@services/db/ingredient";
import { Utensil } from "@services/db/utensil";

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

export async function getAll(): Promise<Recipe[]> {
  const { rows, fields } = await query<RowDataPacket[]>(
    "select * from recipe;"
  );
  const cleanRows = rows.map((row) =>
    filterNullValues(row, fields)
  ) as IncompleteRecipe[];
  const completeRows = cleanRows.map((row) => completeRecipe(row));
  return completeRows as Recipe[];
}

export async function getAllDetailed(): Promise<DetailedRecipe[]> {
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
