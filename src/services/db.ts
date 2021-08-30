// get the client
import mysql from "mysql2/promise";
import { getLogger } from "./winston";

let connection: mysql.Connection;

const logger = getLogger("api");

export async function createConnection(): Promise<void> {
  logger.info("Connecting to MySQL ...");
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
  });
  logger.info("Connected to MySQL");
}

export async function testQuery({
  name,
  age,
}: {
  name: string;
  age: number;
}): Promise<void> {
  const [rows, fields] = await connection.execute(
    "SELECT * FROM `table` WHERE `name` = ? AND `age` > ?",
    [name, age]
  );
}
