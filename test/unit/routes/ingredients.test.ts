import request from "supertest";

import { database as dbConfig } from "@/config/index";
import { closeConnection, createConnection } from "@/services/db/setup";
import { IngredientType } from "@/services/schemas";
import app from "@/app";

import { clearDatabase, clearTable, createMockIngredient } from "test/mock/db";
import { Ingredient } from "@/services/db";

describe("The /ingredients route", () => {
  beforeAll(() =>
    createConnection({
      autoCreate: dbConfig.autoCreate,
      autoPopulate: false,
    })
  );

  afterAll(async () => {
    await clearDatabase();
    closeConnection();
  });

  describe("GET /ingredients", () => {
    beforeAll(async () => {
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

    afterAll(() => clearTable("ingredient"));

    it("Returns 200 and an array of ingredients", async () => {
      // given

      // when
      const response = await request(app).get("/ingredients");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(4);

      response.body.forEach((ingredient: IngredientType) => {
        expect(ingredient).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          type: expect.any(String),
        });
      });
    });
  });

  describe("POST /ingredients", () => {
    afterEach(() => clearTable("ingredient"));

    it.each`
      body                              | message                 | reason
      ${undefined}                      | ${/is required/}        | ${"is undefined"}
      ${{}}                             | ${/is required/}        | ${"is empty"}
      ${{ type: IngredientType.START }} | ${/"name" is required/} | ${"has no name field"}
      ${{ name: "ing-1" }}              | ${/"type" is required/} | ${"has no type field"}
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

  describe("GET /ingredients/{id}", () => {
    const EXISTING_ID = 101;

    beforeAll(() =>
      createMockIngredient({
        id: EXISTING_ID,
        name: "ingredient-name",
        type: IngredientType.START,
      })
    );

    afterAll(() => clearTable("ingredient"));

    it("Returns 400 if the id is invalid", async () => {
      // given
      const ID = "INVALID";

      // when
      const response = await request(app).get(`/ingredients/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Endpoint not found");
    });

    it("Returns 400 if the ingredient doesn't exist", async () => {
      // given
      const ID = 9999;

      // when
      const response = await request(app).get(`/ingredients/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Ingredient not found");
    });

    it("Returns 200 and the ingredient if the id is valid and exists", async () => {
      // given
      const ID = EXISTING_ID;

      // when
      const response = await request(app).get(`/ingredients/${ID}`);

      // then
      const ingredient = await Ingredient.get(ID);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(ingredient);
    });
  });

  describe("PUT /ingredients/{id}", () => {
    const EXISTING_ID = 101;

    beforeEach(() =>
      createMockIngredient({
        id: EXISTING_ID,
        name: "ingredient-name",
        type: IngredientType.START,
      })
    );

    afterEach(() => clearTable("ingredient"));

    it("Returns 400 if the id is invalid", async () => {
      // given
      const ID = "INVALID";
      const body = {};

      // when
      const response = await request(app).put(`/ingredients/${ID}`).send(body);

      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Endpoint not found");
    });

    it("Returns 400 if the ingredient doesn't exist", async () => {
      // given
      const ID = 9999;
      const body = {};

      // when
      const response = await request(app).put(`/ingredients/${ID}`).send(body);

      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Ingredient not found");
    });

    it.each`
      body                            | message                 | reason
      ${undefined}                    | ${/is required/}        | ${"is undefined"}
      ${{}}                           | ${/is required/}        | ${"is empty"}
      ${{ type: IngredientType.END }} | ${/"name" is required/} | ${"has no name field"}
      ${{ name: "name-updated" }}     | ${/"type" is required/} | ${"has no type field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given
      const ID = EXISTING_ID;

      // when
      const response = await request(app).put(`/ingredients/${ID}`).send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 200 and the updated ingredient if the id is valid and exists, and the body is valid", async () => {
      // given
      const ID = EXISTING_ID;
      const body = { name: "name-updated", type: IngredientType.END };

      // when
      const response = await request(app).put(`/ingredients/${ID}`).send(body);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toStrictEqual({
        id: EXISTING_ID,
        ...body,
      });
    });
  });

  describe("DELETE /ingredients/{id}", () => {
    afterEach(() => clearTable("ingredient"));

    it("Returns 400 if the id is invalid", async () => {
      // given
      const ID = "INVALID";

      // when
      const response = await request(app).delete(`/ingredients/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Endpoint not found");
    });

    it("Returns 400 if the ingredient doesn't exist", async () => {
      // given
      const ID = 101;

      // when
      const response = await request(app).delete(`/ingredients/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Ingredient not found");
    });

    it("Returns 204 after deleting the ingredient", async () => {
      // given
      const id = await Ingredient.create({
        name: "ingredient-1",
        type: IngredientType.START,
      });

      // when
      const response = await request(app).delete(`/ingredients/${id}`);

      // then
      expect(response.status).toBe(204);
      expect(response.body).toStrictEqual({});

      expect(await Ingredient.get(id)).toBeUndefined();
    });
  });
});
