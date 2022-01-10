import mysql from "mysql2/promise";

import { database as dbConfig } from "./src/config/index";

/**
 * @param {string} dbName
 */
async function destroyDatabase(dbName) {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
    namedPlaceholders: true,
  });

  const [variables] = await connection.query(`SHOW VARIABLES LIKE "secure_file_priv";`);

  console.info("variables", variables);

  const [rows] = await connection.query(`drop database if exists ${dbName};`);

  connection.destroy();

  return rows;
}

module.exports = async () => {
  if (process.env.DB_NAME) {
    await destroyDatabase(process.env.DB_NAME);
  }
};
