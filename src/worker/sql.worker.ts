import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { Database } from "sql.js";
import { executeQuery, prepareDatabase } from "../lib/sqlEngine";
import type { WorkerRequest, WorkerResponse, WorkerResult } from "../lib/types";
let db: Database | undefined;
self.onmessage = async ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    let result: WorkerResult;
    if (data.type === "init") {
      const SQL = await initSqlJs({ locateFile: () => wasmUrl });
      const response = await fetch(data.databaseUrl);
      if (!response.ok)
        throw new Error(`Database could not load (HTTP ${response.status}).`);
      db = new SQL.Database(new Uint8Array(await response.arrayBuffer()));
      result = { schema: prepareDatabase(db) };
    } else {
      if (!db)
        throw new Error(
          "Database is not ready. Reset the engine and try again.",
        );
      result = {
        actual: executeQuery(db, data.sql),
        expected: data.referenceSql
          ? executeQuery(db, data.referenceSql)
          : undefined,
      };
    }
    self.postMessage({ id: data.id, result } satisfies WorkerResponse);
  } catch (error) {
    self.postMessage({
      id: data.id,
      error: error instanceof Error ? error.message : String(error),
    } satisfies WorkerResponse);
  }
};
