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

A documentation file is generated each time the server is started. Said file can be found at `src/docs/cooking-api.openapi.json`. This documentation is also served at `{{basePath}}/docs`, which can be accessed using the browser. Using that UI, the documented endpoints can be tested (if the server is running at the configured domain).

This file can also be imported to applications like [Postman](https://www.postman.com/downloads/). _(An explicit transformation to a Postman collection is pending)_

# Testing

_(Coming soon)_
