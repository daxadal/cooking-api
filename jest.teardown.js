import mysql from "mysql2/promise";

/**
 * @param {string} dbName
 */
async function destroyDatabase(dbName) {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    multipleStatements: true,
    namedPlaceholders: true,
  });

  const [rows] = await connection.query(`drop database if exists ${dbName};`);

  connection.destroy();

  return rows;
}

module.exports = async () => {
  if (process.env.DB_NAME) {
    const result = await destroyDatabase(process.env.DB_NAME);
  }
};
