import request from "supertest";

import { closeConnection, createConnection } from "@/services/db/setup";
import { IngredientType } from "@/services/db/ingredient";
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

    it("Returns an array of steps", async () => {
      // given

      // when
      const response = await request(app).get("/steps");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);
    });

    it("Returns an array of detailed steps", async () => {
      // given

      // when
      const response = await request(app).get("/steps?detailed=true");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);
    });
  });

  describe("POST /steps", () => {
    afterEach(() => clearTable("step"));

    xit.each`
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

    it("Returns 200 and the creted step", async () => {
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
});
