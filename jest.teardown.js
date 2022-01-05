import { connectToMySQL } from "./src/services/db/setup";

/**
 * @param {string} dbName
 */
async function destroyDatabase(dbName) {
  const connection = await connectToMySQL();

  const [rows] = await connection.query(`drop database if exists ${dbName};`);

  connection.destroy();

  return rows;
}

module.exports = async () => {
  if (process.env.DB_NAME) {
    const result = await destroyDatabase(process.env.DB_NAME);
  }
};
