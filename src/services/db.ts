// get the client
import mysql from "mysql2";
import { getLogger } from "./winston";

let connection: mysql.Connection;

const logger = getLogger("api");

export function createConnection(): void {
  logger.info("Connecting to MySQL ...");
  connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
  });
  logger.info("Connected to MySQL");
}

export function testQuery({
  name,
  age,
}: {
  name: string;
  age: number;
}): mysql.Query {
  return connection.execute(
    "SELECT * FROM `table` WHERE `name` = ? AND `age` > ?",
    [name, age]
  );
}
