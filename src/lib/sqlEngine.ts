import type { Database } from "sql.js";
import type { Output, SchemaColumn } from "./types.ts";

export const ROW_LIMIT = 100;
// SQLite still enforces query_only. This filter also excludes configuration PRAGMAs.
function withoutComments(sql: string): string {
  return sql.replace(/^(?:\s+|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/, "");
}
export function prepareDatabase(db: Database): SchemaColumn[] {
  db.run("PRAGMA query_only = ON");
  const check = db.exec("PRAGMA quick_check")[0];
  if (check?.values[0]?.[0] !== "ok")
    throw new Error("The practice database is damaged.");
  return db.exec("PRAGMA table_info(passengers)")[0].values.map((row) => ({
    name: String(row[1]),
    type: String(row[2]),
    primaryKey: Boolean(row[5]),
  }));
}
export function executeQuery(db: Database, sql: string): Output {
  if (!/^(SELECT|WITH)\b/i.test(withoutComments(sql))) {
    throw new Error(
      "Use a single SELECT query (or WITH … SELECT). This practice database is read only.",
    );
  }
  const statement = db.prepare(sql);
  try {
    // SQLite reports the exact text of the first prepared statement. Never
    // prepare or execute a second statement, including configuration PRAGMAs.
    const remainder = withoutComments(sql.slice(statement.getSQL().length));
    if (remainder.trim())
      throw new Error("Run one query at a time; remove the extra statement.");
    const columns = statement.getColumnNames();
    const values: Output["values"] = [];
    while (statement.step()) {
      if (values.length === ROW_LIMIT)
        return { columns, values, truncated: true };
      values.push(statement.get());
    }
    return { columns, values, truncated: false };
  } finally {
    statement.free();
  }
}
