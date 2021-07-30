/* global describe it afterAll */
import request from "supertest";
import server from "../src/app";

describe("App", function () {
  it("has the default page", function (done) {
    request(server)
      .get("/")
      .expect(/Welcome to Express/, done);
  });
  afterAll(() => {
    server.close();
  });
});
