# Cooking API

A cooking API based on time-management cooking games.
Create the **utensils** that are present in your fictional kitchen.
Create the **ingredients** that will be cooked, as well as the half-cooked and final byproducts.
Create **recipes** by creating the individual **steps** necessary to transform the raw ingredient into a fully cooked byproduct.

# Repositories

- Main repo: https://gitlab.com/egarciadececa/cooking-api
- Backup repo: https://github.com/daxadal/cooking-api

# Availability

_(This server is not currently being served on the Internet)_

# Previous steps

Create a `.env` file based on `sample.env` file.
Uncomment and fill all required environment variables.
All variables are required, except otherwise specified.

Install and start an MySQL service on the chosen host, and make sure that login is possible with the specified credentials.

On Ubuntu, that would mean installing `mysql-server` and executing it in `sudo` mode (no password required with `sudo`):

```sh
apt install -y mysql-server
sudo mysql
```

Now in the MySQL console, create a user, a database, and grant permission to the user:

```sql
CREATE USER '<username>'@'localhost' IDENTIFIED BY '<password_of_choice>';
CREATE DATABASE <db_name>;
GRANT ALL PRIVILEGES ON <db_name>. * TO '<username>'@'localhost';
```

_(**NOTE**: If the `.env` variable `DB_AUTO_CREATE` is set to `true`, there's no need to create the database beforehand.
But, in this case, the configured user must have permission to create databases)_

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
A test database must exist, and the configured user must have all permissions in it

_(**NOTE**: If the variable `DB_AUTO_CREATE` is set to true, there's no need to create the database beforehand.
But, in this case, the configured user must have permission to create databases)_

## CI Testing

Tests can be performed on Gitlab CD/CI using the `mysql` docker, which is configured to use the `root` user.
In this scenario, a disposable database will be created on the fly.
