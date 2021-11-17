/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  preset: "jest-mysql",
  roots: ["test"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|js)"],
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  globalSetup: "<rootDir>/jest.setup.js",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  testTimeout: 10000,
};
