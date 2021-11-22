import { OkPacket } from "mysql2/promise";

import { query } from "@services/db/setup";

export function clearDatabase() {
  return Promise.all([
    query<OkPacket>("delete from ingredient;"),
    query<OkPacket>("delete from utensil;"),
    query<OkPacket>("delete from step;"),
  ]);
}
