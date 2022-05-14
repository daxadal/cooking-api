import request from "supertest";

import { closeConnection, createConnection } from "@/services/db/setup";
import { IngredientType } from "@/services/schemas";
import app from "@/app";

import { clearDatabase, clearTable, createMockIngredient } from "test/mock/db";
import { Ingredient } from "@/services/db";

describe("The /ingredients route", () => {
  beforeAll(() => createConnection({ autoCreate: false, autoPopulate: false }));

  afterAll(async () => {
    await clearDatabase();
    closeConnection();
  });

  describe("GET /ingredients", () => {
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
    });
    afterAll(clearDatabase);

    it("Returns 200 and an array of detailed ingredients if 'detailed=true'", async () => {
      // given

      // when
      const response = await request(app).get("/ingredients?detailed=true");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);

      response.body.forEach((ingredient: IngredientType) => {
        expect(ingredient).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          type: expect.any(IngredientType),
        });
      });
    });
  });

  describe("POST /ingredients", () => {
    afterEach(() => clearTable("ingredient"));

    it.each`
      body                                             | message                 | reason
      ${undefined}                                     | ${/is required/}        | ${"is undefined"}
      ${{}}                                            | ${/is required/}        | ${"is empty"}
      ${{ name: "ing-1", type: IngredientType.START }} | ${/"id" is required/}   | ${"has no id field"}
      ${{ id: 101, type: IngredientType.START }}       | ${/"name" is required/} | ${"has no name field"}
      ${{ id: 101, name: "ing-1" }}                    | ${/"type" is required/} | ${"has no type field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given

      // when
      const response = await request(app).post("/ingredients").send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 200 and the created ingredient", async () => {
      // given
      const body = {
        id: 101,
        name: "ingredient-1",
        type: IngredientType.START,
      };

      // when
      const response = await request(app).post("/ingredients").send(body);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(body);
    });
  });

  describe("DELETE /ingredients", () => {
    afterEach(() => clearTable("ingredient"));

    it.each`
      body                      | message                 | reason
      ${undefined}              | ${/is required/}        | ${"is undefined"}
      ${{}}                     | ${/is required/}        | ${"is empty"}
      ${{ name: 1, type: 102 }} | ${/"id" is required/}   | ${"has no id field"}
      ${{ id: 101, type: 102 }} | ${/"name" is required/} | ${"has no name field"}
      ${{ id: 101, name: 1 }}   | ${/"type" is required/} | ${"has no type field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given

      // when
      const response = await request(app).delete("/ingredients").send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 204 after deleting the ingredient", async () => {
      // given
      const body = {
        id: 101,
        name: "ingredient-1",
        type: IngredientType.START,
      };
      await Ingredient.create(body);

      // when
      const response = await request(app).delete("/ingredients").send(body);

      // then
      expect(response.status).toBe(204);
      expect(response.body).toStrictEqual({});

      expect(await Ingredient.get(body.id)).toBeUndefined();
    });
  });
});
