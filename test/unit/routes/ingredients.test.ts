import request from "supertest";

import { database as dbConfig } from "@/config/index";

import { Ingredient } from "@/services/db";
import { closeConnection, createConnection } from "@/services/db/setup";
import { IngredientType, Step as StepType } from "@/services/schemas";

import app from "@/app";

import {
  clearDatabase,
  clearTable,
  createMockIngredient,
  createMockStep,
  createMockUtensil,
} from "test/mock/db";

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
      expect(response.body).toHaveProperty("id");
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

  describe("Queries on steps", () => {
    const START_ID = 101;
    const TARGET_ID = 102;
    const END_ID = 103;

    beforeAll(async () => {
      await createMockIngredient({
        id: START_ID,
        name: "start",
        type: IngredientType.START,
      });
      await createMockIngredient({
        id: TARGET_ID,
        name: "mid",
        type: IngredientType.MID,
      });
      await createMockIngredient({
        id: END_ID,
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

      await createMockStep({ input: START_ID, utensil: 1, output: TARGET_ID });
      await createMockStep({ input: TARGET_ID, utensil: 2, output: END_ID });
      await createMockStep({ input: TARGET_ID, utensil: 3, output: 104 });
    });

    afterAll(clearDatabase);

    describe("GET /ingredients/{id}/outcomes", () => {
      it("Returns 400 if the id is invalid", async () => {
        // given
        const ID = "INVALID";

        // when
        const response = await request(app).get(`/ingredients/${ID}/outcomes`);
        // then
        expect(response.status).toEqual(404);
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe("Endpoint not found");
      });

      it("Returns 400 if the ingredient doesn't exist", async () => {
        // given
        const ID = 9999;

        // when
        const response = await request(app).get(`/ingredients/${ID}/outcomes`);

        // then
        expect(response.status).toEqual(404);
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe("Ingredient not found");
      });

      it("Returns 400 if the ingredient type is 'end'", async () => {
        // given
        const ID = END_ID;

        // when
        const response = await request(app).get(`/ingredients/${ID}/outcomes`);

        // then
        expect(response.status).toEqual(400);
        expect(response.body).toBeDefined();
        expect(response.body.message).toStrictEqual(
          expect.stringContaining("This is an end ingredient")
        );
      });

      it("Returns 200 and the list of detailed steps with the specified ingredient as input", async () => {
        // given
        const ID = TARGET_ID;

        // when
        const response = await request(app).get(`/ingredients/${ID}/outcomes`);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Array);

        response.body.forEach((step: StepType) => {
          expect(step).toMatchObject({
            input: expect.any(Object),
            utensil: expect.any(Object),
            output: expect.any(Object),
          });
          expect(step.input).toMatchObject({ id: TARGET_ID });
        });
      });
    });

    describe("GET /ingredients/{id}/sources", () => {
      it("Returns 400 if the id is invalid", async () => {
        // given
        const ID = "INVALID";

        // when
        const response = await request(app).get(`/ingredients/${ID}/sources`);
        // then
        expect(response.status).toEqual(404);
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe("Endpoint not found");
      });

      it("Returns 400 if the ingredient doesn't exist", async () => {
        // given
        const ID = 9999;

        // when
        const response = await request(app).get(`/ingredients/${ID}/sources`);

        // then
        expect(response.status).toEqual(404);
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe("Ingredient not found");
      });

      it("Returns 400 if the ingredient type is 'start'", async () => {
        // given
        const ID = START_ID;

        // when
        const response = await request(app).get(`/ingredients/${ID}/sources`);

        // then
        expect(response.status).toEqual(400);
        expect(response.body).toBeDefined();
        expect(response.body.message).toStrictEqual(
          expect.stringContaining("This is a start ingredient")
        );
      });

      it("Returns 200 and the list of detailed steps with the specified ingredient as output", async () => {
        // given
        const ID = TARGET_ID;

        // when
        const response = await request(app).get(`/ingredients/${ID}/sources`);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Array);

        response.body.forEach((step: StepType) => {
          expect(step).toMatchObject({
            input: expect.any(Object),
            utensil: expect.any(Object),
            output: expect.any(Object),
          });
          expect(step.output).toMatchObject({ id: TARGET_ID });
        });
      });
    });
  });
});
