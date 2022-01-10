import { OkPacket } from "mysql2/promise";

import { query, QueryResult } from "@services/db/setup";

export function clearDatabase(): Promise<QueryResult<OkPacket>[]> {
  return Promise.all([
    query<OkPacket>("delete from ingredient;"),
    query<OkPacket>("delete from utensil;"),
    query<OkPacket>("delete from step;"),
  ]);
}
