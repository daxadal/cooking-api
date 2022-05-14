# Cooking API

A cooking API based on time-management cooking games.

# Stack

This project uses these libraries for this purposes:

- `express`: API configuration
- `joi`: Parameter validation
- `mysql2/promise`: Implementing the database
- `winston`: Logging
- `module-alias`: Importing routes as absolutes instead of relatives
- `swagger-jsdoc`: Generating OpenAPI documentation
- `swagger-ui-express`: Serving OpenAPI documentation

This project also uses the following dev dependencies:

- `jest`/`ts-jest`: Testing
- `jest-unit`: Generating testing reports (compatible with Gitlab CI/CD)
- `supertest`: Making request to the express app

# Previous steps

Create a .env file based on sample.env file. Uncomment and fill all required environment variables. All variables are required except otherwise specified.

Install and start an MySQL service on the chosen host, and make sure that login is posible with the specified credentials.

# Installation and execution

To run the server, first you have to install the dependencies:

```bash
npm ci
```

The server can be started using the following command:

```bash
npm start
```

By default, the server mounts at `http://localhost:3000`, which will be referred as `{{basePath}}` from now on.

# Documentation

A documentation file is generated each time the server is started.
This documentation can also be manually generated executing:

```bash
npm run docs
```

Said file can be found at `<rootDir>/src/docs/cooking-api.openapi.json`.
This file can also be imported to applications like [Postman](https://www.postman.com/downloads/).

This documentation is also served at `{{basePath}}/docs`, which can be accessed using the browser.
Using that UI, the documented endpoints can be tested (if the server is running at the configured domain).

# Testing

Tests can be executed using the following command:

```bash
npm test
```

Tests are powered by `jest`, and a report file (compatible with Gitlab CI/CD) is generated on each execution.

Tests use the `mysql` service in the running machine.
A disposable database is generated on setup, and it's deleted on teardown.
