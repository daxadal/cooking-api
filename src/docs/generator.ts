/* global __dirname */
import swaggerJsdoc, { OAS3Options } from "swagger-jsdoc";
import fs from "fs";
import path from "path";

import Converter from "openapi-to-postmanv2";

function convertToPostman(openapiSpecification: OAS3Options) {
  return new Promise((resolve, reject) => {
    Converter.convert(
      { type: "json", data: openapiSpecification },
      {},
      (err: any, conversionResult: any) => {
        if (err) reject(err);
        else if (!conversionResult.result)
          reject(new Error(conversionResult.reason));
        else resolve(conversionResult.output[0].data);
      }
    );
  });
}

async function generateDocsForVersion(
  options: OAS3Options,
  fileName: string,
  apiName: string
) {
  console.info(`Generating docs for ${apiName}...`);

  const openapiSpecification = swaggerJsdoc(options);

  fs.writeFileSync(
    path.join(__dirname, `${fileName}.openapi.json`),
    JSON.stringify(openapiSpecification, null, 2)
  );

  console.info(`Docs generated for ${apiName}`);

  console.info(`Generating Postman collection for ${apiName}...`);
  try {
    const collection = await convertToPostman(openapiSpecification);
    fs.writeFileSync(
      path.join(__dirname, `${fileName}.postman_collection.json`),
      JSON.stringify(collection, null, 2)
    );
    console.info(`Postman collection generated for ${apiName}`);
  } catch (error) {
    console.error(`Could not convert ${apiName} to Postman collection:`, error);
  }
  console.info(`---------------------------`);
}

export async function generate(): Promise<void> {
  const servers = [{ url: "http://localhost:3000", description: "Local API" }];

  const options: OAS3Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Cooking API",
        description: "Documentation for Cooking API",
        contact: { email: "e.garciadececa@gmail.com" },
        version: "1.0.0",
      },
      servers,
    },
    apis: [
      "./src/docs/*.yml",

      "./src/routes/**/*.js",
      "./src/routes/**/*.ts",
    ],
  };

  await generateDocsForVersion(options, "cooking-api", "Cooking API");
}

generate();
