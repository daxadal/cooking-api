import request from "supertest";

import { closeConnection, createConnection } from "@/services/db/setup";
import { IngredientType, Recipe } from "@/services/schemas";
import app from "@/app";

import {
  clearDatabase,
  createMockIngredient,
  createMockStep,
  createMockUtensil,
} from "test/mock/db";

describe("The /recipes route", () => {
  beforeAll(async () => {
    await createConnection({ autoPopulate: false });

    await createMockIngredient({
      id: 101,
      name: "start",
      type: IngredientType.START,
    });
    await createMockIngredient({
      id: 102,
      name: "mid",
      type: IngredientType.MID,
    });
    await createMockIngredient({
      id: 103,
      name: "end-1",
      type: IngredientType.END,
    });
    await createMockIngredient({
      id: 104,
      name: "end-2",
      type: IngredientType.END,
    });

    await createMockUtensil({
      id: 1,
      name: "utensil-1",
      waitTimeInMillis: 100,
    });
    await createMockUtensil({
      id: 2,
      name: "utensil-2",
      waitTimeInMillis: 200,
    });
    await createMockUtensil({
      id: 3,
      name: "utensil-3",
      waitTimeInMillis: 300,
    });

    await createMockStep({ input: 101, utensil: 1, output: 102 });
    await createMockStep({ input: 102, utensil: 2, output: 103 });
    await createMockStep({ input: 102, utensil: 3, output: 104 });
  });

  afterAll(async () => {
    await clearDatabase();
    closeConnection();
  });

  describe("GET /recipes", () => {
    it.each`
      query                          | condition
      ${"?detailed=whatIsThisValue"} | ${"the detail parameter has an invalid value"}
      ${"?detailed"}                 | ${"the detail parameter has no value"}
    `("Returns 400 if $condition", async ({ query }) => {
      // given

      // when
      const response = await request(app).get("/recipes" + query);

      // then
      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toEqual('"detailed" must be a boolean');
    });

    it.each`
      query                | condition
      ${""}                | ${"the detailed parameter is not present"}
      ${"?detailed=false"} | ${"'detailed=false'"}
    `(
      "Returns 200 and an array of simple steps if $condition",
      async ({ query }) => {
        // given

        // when
        const response = await request(app).get("/recipes" + query);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(2);

        response.body.forEach((recipe: Recipe) => {
          expect(recipe).toHaveProperty("input");
          expect(recipe).toHaveProperty("utensil1");
          expect(recipe).toHaveProperty("mid1");
          expect(recipe).toHaveProperty("output");

          expect(typeof recipe.input).toBe("number");
          expect(typeof recipe.utensil1).toBe("number");
          expect(typeof recipe.mid1).toBe("number");
          expect(typeof recipe.output).toBe("number");
        });
      }
    );

    it("Returns 200 and an array of detailed steps if 'detailed=true'", async () => {
      // given

      // when
      const response = await request(app).get("/recipes?detailed=true");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);

      response.body.forEach((recipe: Recipe) => {
        expect(recipe).toHaveProperty("input");
        expect(recipe).toHaveProperty("utensil1");
        expect(recipe).toHaveProperty("mid1");
        expect(recipe).toHaveProperty("output");

        expect(typeof recipe.input).toBe("object");
        expect(typeof recipe.utensil1).toBe("object");
        expect(typeof recipe.mid1).toBe("object");
        expect(typeof recipe.output).toBe("object");
      });
    });
  });
});
