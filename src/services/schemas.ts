import Joi from "joi";

export const DetailedQuery = Joi.object({
  detailed: Joi.valid("true", "false"),
});

// #region --- Ingredient

export enum IngredientType {
  START = "start",
  MID = "mid",
  END = "end",
}

export interface IngredientData {
  name: string;
  type: IngredientType;
}

export const IngredientData = Joi.object({
  name: Joi.string(),
  type: Joi.valid(...Object.values(IngredientType)),
});

export interface Ingredient {
  id: number;
  name: string;
  type: IngredientType;
}

// #endregion --- Ingredient

// #region --- Utensil

export interface UtensilData {
  name: string;
  waitTimeInMillis: number;
}

export const UtensilData = Joi.object({
  name: Joi.string(),
  waitTimeInMillis: Joi.number().integer(),
});

export interface Utensil {
  id: number;
  name: string;
  waitTimeInMillis: number;
}

// #endregion --- Utensil

// #region --- Step

export interface SimpleStep {
  input: number;
  utensil: number;
  output: number;
}

export const SimpleStep = Joi.object({
  input: Joi.number().integer(),
  utensil: Joi.number().integer(),
  output: Joi.number().integer(),
});

export interface DetailedStep {
  input: Ingredient;
  utensil: Utensil;
  output: Ingredient;
}

export type Step = SimpleStep | DetailedStep;

// #endregion --- Step

// #region --- Recipe

export interface SimpleIncompleteRecipe {
  input: number;
  utensil1: number;
  mid1: number;
  utensil2?: number;
  mid2?: number;
  utensil3?: number;
  mid3?: number;
  utetsil4?: number;
  mid4?: number;
  utensil5?: number;
  mid5?: number;
}

export interface DetailedIncompleteRecipe {
  input: Ingredient;
  utensil1: Utensil;
  mid1: Ingredient;
  utensil2?: Utensil;
  mid2?: Ingredient;
  utensil3?: Utensil;
  mid3?: Ingredient;
  utetsil4?: Utensil;
  mid4?: Ingredient;
  utensil5?: Utensil;
  mid5?: Ingredient;
}

export interface SimpleRecipe extends SimpleIncompleteRecipe {
  steps: number;
  output: number;
}

export interface DetailedRecipe extends DetailedIncompleteRecipe {
  steps: number;
  output: Ingredient;
}

export type Recipe = SimpleRecipe | DetailedRecipe;

// #endregion --- Recipe
