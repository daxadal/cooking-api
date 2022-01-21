import request from "supertest";

import { closeConnection, createConnection } from "@services/db/setup";
import { IngredientType } from "@services/db/ingredient";
import app from "../../../src/app";

import { clearDatabase, createMockIngredient, createMockStep, createMockUtensil } from "../../mock/db";

describe("The /recipes route", () => {
  beforeAll(async () => {
    await createConnection({ autoPopulate: false });

    await createMockIngredient({id: 101, name: "start", type: IngredientType.START})
    await createMockIngredient({id: 102, name: "mid", type: IngredientType.MID})
    await createMockIngredient({id: 103, name: "end-1", type: IngredientType.END})
    await createMockIngredient({id: 104, name: "end-2", type: IngredientType.END})

    await createMockUtensil({id: 1, name: "utensil-1", waitTimeInMillis: 100})
    await createMockUtensil({id: 2, name: "utensil-2", waitTimeInMillis: 200})
    await createMockUtensil({id: 3, name: "utensil-3", waitTimeInMillis: 300})

    await createMockStep({input: 101, utensil: 1, output: 102})
    await createMockStep({input: 102, utensil: 2, output: 103})
    await createMockStep({input: 102, utensil: 3, output: 104})
  });

  afterAll(async () => {
    await clearDatabase();
    closeConnection();
  });

  describe("GET /recipes", () => {
    it("Returns an array of recipes", async () => {
      // given

      // when
      const response = await request(app).get("/recipes");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
    });

    it("Returns an array of detailed recipes", async () => {
      // given

      // when
      const response = await request(app).get("/recipes?detailed=true");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
    });
  });
});
