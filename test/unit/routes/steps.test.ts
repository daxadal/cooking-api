import request from "supertest";

import { database as dbConfig } from "@/config/index";

import { Step } from "@/services/db";
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

describe("The /steps route", () => {
  beforeAll(async () => {
    await createConnection({
      autoCreate: dbConfig.autoCreate,
      autoPopulate: false,
    });

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
  });

  afterAll(async () => {
    await clearDatabase();
    closeConnection();
  });

  describe("GET /steps", () => {
    beforeAll(async () => {
      await createMockStep({ input: 101, utensil: 1, output: 102 });
      await createMockStep({ input: 102, utensil: 2, output: 103 });
      await createMockStep({ input: 102, utensil: 3, output: 104 });
    });

    afterAll(() => clearTable("step"));

    it.each`
      query                          | condition
      ${"?detailed=whatIsThisValue"} | ${"the detail parameter has an invalid value"}
      ${"?detailed"}                 | ${"the detail parameter has no value"}
    `("Returns 400 if $condition", async ({ query }) => {
      // given

      // when
      const response = await request(app).get("/steps" + query);

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
        const response = await request(app).get("/steps" + query);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Array);

        response.body.forEach((step: StepType) => {
          expect(step).toMatchObject({
            input: expect.any(Number),
            utensil: expect.any(Number),
            output: expect.any(Number),
          });
        });
      }
    );

    it("Returns 200 and an array of detailed steps if 'detailed=true'", async () => {
      // given

      // when
      const response = await request(app).get("/steps?detailed=true");

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
      });
    });
  });

  describe("POST /steps", () => {
    afterEach(() => clearTable("step"));

    it.each`
      body                           | message                    | reason
      ${undefined}                   | ${/is required/}           | ${"is undefined"}
      ${{}}                          | ${/is required/}           | ${"is empty"}
      ${{ utensil: 1, output: 102 }} | ${/"input" is required/}   | ${"has no input field"}
      ${{ input: 101, output: 102 }} | ${/"utensil" is required/} | ${"has no utensil field"}
      ${{ input: 101, utensil: 1 }}  | ${/"output" is required/}  | ${"has no output field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given

      // when
      const response = await request(app).post("/steps").send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 200 and the created step", async () => {
      // given
      const body = {
        input: 101,
        utensil: 1,
        output: 102,
      };

      // when
      const response = await request(app).post("/steps").send(body);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        input: { id: 101 },
        utensil: { id: 1 },
        output: { id: 102 },
      });
    });
  });

  describe("DELETE /steps", () => {
    afterEach(() => clearTable("step"));

    it.each`
      body                           | message                    | reason
      ${undefined}                   | ${/is required/}           | ${"is undefined"}
      ${{}}                          | ${/is required/}           | ${"is empty"}
      ${{ utensil: 1, output: 102 }} | ${/"input" is required/}   | ${"has no input field"}
      ${{ input: 101, output: 102 }} | ${/"utensil" is required/} | ${"has no utensil field"}
      ${{ input: 101, utensil: 1 }}  | ${/"output" is required/}  | ${"has no output field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given

      // when
      const response = await request(app).delete("/steps").send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 204 after deleting the step", async () => {
      // given
      const body = {
        input: 101,
        utensil: 1,
        output: 102,
      };
      await Step.create(body);

      // when
      const response = await request(app).delete("/steps").send(body);

      // then
      expect(response.status).toBe(204);
      expect(response.body).toStrictEqual({});

      expect(await Step.get(body)).toBeUndefined();
    });
  });
});
