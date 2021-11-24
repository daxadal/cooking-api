import request from "supertest";

import {
  closeConnection,
  createConnection,
  populateTables,
} from "@services/db/setup";
import app from "../../../src/app";

import { clearDatabase } from "../../mock/db";

describe("The /recipes route", () => {
  beforeAll(async () => { try {
    await createConnection({ autoPopulate: false })
    console.info(`${new Date().toISOString()}: DB created`)

  } catch (error) {
    console.error(`${new Date().toISOString()}: DB cretion error`, error)
  }
  });

  beforeEach(populateTables);

  afterEach(clearDatabase);

  afterAll(closeConnection);

  describe("GET /recipes", () => {
    it("Returns an array of recipes", async () => {
      // given

      // when
      const response = await request(app).get("/recipes");

      // then
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
