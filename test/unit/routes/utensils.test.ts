import request from "supertest";

import { database as dbConfig } from "@/config/index";

import { Utensil } from "@/services/db";
import { closeConnection, createConnection } from "@/services/db/setup";
import {
  IngredientType,
  Utensil as UtensilType,
  Step as StepType,
} from "@/services/schemas";

import app from "@/app";

import {
  clearDatabase,
  clearTable,
  createMockIngredient,
  createMockStep,
  createMockUtensil,
} from "test/mock/db";

describe("The /utensils route", () => {
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

  describe("GET /utensils", () => {
    beforeAll(async () => {
      await createMockUtensil({
        id: 1,
        name: "utensil-1",
        waitTimeInMillis: 1000,
      });
      await createMockUtensil({
        id: 2,
        name: "utensil-2",
        waitTimeInMillis: 2000,
      });
      await createMockUtensil({
        id: 3,
        name: "utensil-1",
        waitTimeInMillis: 3000,
      });
      await createMockUtensil({
        id: 4,
        name: "utensil-2",
        waitTimeInMillis: 4000,
      });
    });

    afterAll(() => clearTable("utensil"));

    it("Returns 200 and an array of utensils", async () => {
      // given

      // when
      const response = await request(app).get("/utensils");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);

      response.body.forEach((utensil: UtensilType) => {
        expect(utensil).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          waitTimeInMillis: expect.any(Number),
        });
      });
    });
  });

  describe("POST /utensils", () => {
    afterEach(() => clearTable("utensil"));

    it.each`
      body                          | message                             | reason
      ${undefined}                  | ${/is required/}                    | ${"is undefined"}
      ${{}}                         | ${/is required/}                    | ${"is empty"}
      ${{ waitTimeInMillis: 1000 }} | ${/"name" is required/}             | ${"has no name field"}
      ${{ name: "utensil-1" }}      | ${/"waitTimeInMillis" is required/} | ${"has no waitTimeInMillis field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given

      // when
      const response = await request(app).post("/utensils").send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 200 and the created utensil", async () => {
      // given
      const body = {
        name: "utensil-1",
        waitTimeInMillis: 1000,
      };

      // when
      const response = await request(app).post("/utensils").send(body);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toMatchObject(body);
    });
  });

  describe("GET /utensils/{id}", () => {
    const EXISTING_ID = 1;

    beforeAll(() =>
      createMockUtensil({
        id: EXISTING_ID,
        name: "utensil-name",
        waitTimeInMillis: 1000,
      })
    );

    afterAll(() => clearTable("utensil"));

    it("Returns 400 if the id is not a number", async () => {
      // given
      const ID = "INVALID";

      // when
      const response = await request(app).get(`/utensils/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Endpoint not found");
    });

    it("Returns 400 if the utensil doesn't exist", async () => {
      // given
      const ID = 9999;

      // when
      const response = await request(app).get(`/utensils/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Utensil not found");
    });

    it("Returns 200 and the utensil if the id is valid and exists", async () => {
      // given
      const ID = EXISTING_ID;

      // when
      const response = await request(app).get(`/utensils/${ID}`);

      // then
      const utensil = await Utensil.get(ID);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(utensil);
    });
  });

  describe("PUT /utensils/{id}", () => {
    const EXISTING_ID = 1;

    beforeEach(() =>
      createMockUtensil({
        id: EXISTING_ID,
        name: "utensil-name",
        waitTimeInMillis: 1000,
      })
    );

    afterEach(() => clearTable("utensil"));

    it("Returns 400 if the id is not a number", async () => {
      // given
      const ID = "INVALID";
      const body = {};

      // when
      const response = await request(app).put(`/utensils/${ID}`).send(body);

      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Endpoint not found");
    });

    it("Returns 400 if the utensil doesn't exist", async () => {
      // given
      const ID = 9999;
      const body = {};

      // when
      const response = await request(app).put(`/utensils/${ID}`).send(body);

      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Utensil not found");
    });

    it.each`
      body                          | message                             | reason
      ${undefined}                  | ${/is required/}                    | ${"is undefined"}
      ${{}}                         | ${/is required/}                    | ${"is empty"}
      ${{ waitTimeInMillis: 1000 }} | ${/"name" is required/}             | ${"has no name field"}
      ${{ name: "name-updated" }}   | ${/"waitTimeInMillis" is required/} | ${"has no waitTimeInMillis field"}
    `("Returns 400 if the body $reason", async ({ body, message }) => {
      // given
      const ID = EXISTING_ID;

      // when
      const response = await request(app).put(`/utensils/${ID}`).send(body);

      // then
      expect(response.status).toEqual(400);
      expect(response.body).toBeDefined();
      expect(response.body.message).toMatch(message);
    });

    it("Returns 200 and the updated utensil if the id is valid and exists, and the body is valid", async () => {
      // given
      const ID = EXISTING_ID;
      const body = { name: "name-updated", waitTimeInMillis: 1000 };

      // when
      const response = await request(app).put(`/utensils/${ID}`).send(body);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toStrictEqual({
        id: EXISTING_ID,
        ...body,
      });
    });
  });

  describe("DELETE /utensils/{id}", () => {
    afterEach(() => clearTable("utensil"));

    it("Returns 400 if the id is not a number", async () => {
      // given
      const ID = "INVALID";

      // when
      const response = await request(app).delete(`/utensils/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Endpoint not found");
    });

    it("Returns 400 if the utensil doesn't exist", async () => {
      // given
      const ID = 101;

      // when
      const response = await request(app).delete(`/utensils/${ID}`);
      // then
      expect(response.status).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Utensil not found");
    });

    it("Returns 204 after deleting the utensil", async () => {
      // given
      const id = await Utensil.create({
        name: "utensil-1",
        waitTimeInMillis: 1000,
      });

      // when
      const response = await request(app).delete(`/utensils/${id}`);

      // then
      expect(response.status).toBe(204);
      expect(response.body).toStrictEqual({});

      expect(await Utensil.get(id)).toBeUndefined();
    });
  });

  describe("Queries on steps", () => {
    const UTENSIL_ID = 1;

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

      await createMockUtensil({
        id: UTENSIL_ID,
        name: "utensil-1",
        waitTimeInMillis: 100,
      });

      await createMockStep({ input: 101, utensil: UTENSIL_ID, output: 102 });
      await createMockStep({ input: 102, utensil: UTENSIL_ID, output: 103 });
    });

    afterAll(clearDatabase);

    describe("GET /utensils/{id}/uses", () => {
      it("Returns 400 if the id is not a number", async () => {
        // given
        const ID = "INVALID";

        // when
        const response = await request(app).get(`/utensils/${ID}/uses`);
        // then
        expect(response.status).toEqual(404);
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe("Endpoint not found");
      });

      it("Returns 400 if the ingredient doesn't exist", async () => {
        // given
        const ID = 9999;

        // when
        const response = await request(app).get(`/utensils/${ID}/uses`);

        // then
        expect(response.status).toEqual(404);
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe("Utensil not found");
      });

      it("Returns 200 and the list of detailed steps that use the utensil", async () => {
        // given
        const ID = UTENSIL_ID;

        // when
        const response = await request(app).get(`/utensils/${ID}/uses`);

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
          expect(step.utensil).toMatchObject({ id: UTENSIL_ID });
        });
      });
    });
  });
});
