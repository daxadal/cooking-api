/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/",
});
module.exports = {
  globalSetup: "<rootDir>/jest.setup.js",
  globalTeardown: "<rootDir>/jest.teardown.js",

  reporters: ["default", "jest-junit"],

  roots: ["test"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|js)"],
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },

  moduleNameMapper: {
    ...moduleNameMapper,
    "^test/(.*)$": "<rootDir>/test/$1",
  },
  testTimeout: 10000,
};
