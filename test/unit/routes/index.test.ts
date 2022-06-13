import request from "supertest";

import { database as dbConfig, environment } from "@/config/index";

import { closeConnection, createConnection } from "@/services/db/setup";

import app from "@/app";

describe("The / route", () => {
  beforeAll(() =>
    createConnection({
      autoCreate: dbConfig.autoCreate,
      autoPopulate: false,
    })
  );

  afterAll(closeConnection);

  describe("GET /", () => {
    it("Returns 200, the environment and DB stats", async () => {
      // given

      // when
      const response = await request(app).get("/");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.environment).toEqual(environment);
      expect(response.body.stats).toMatchObject({
        ingredients: expect.any(Number),
        utensils: expect.any(Number),
        steps: expect.any(Number),
        recipes: expect.any(Number),
      });
    });
  });
});
