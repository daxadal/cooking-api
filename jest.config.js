/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  roots: ["test"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|js)"],
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  globalSetup: "<rootDir>/jest.setup.js",
  globalTeardown: "<rootDir>/jest.teardown.js",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  testTimeout: 10000,
};
