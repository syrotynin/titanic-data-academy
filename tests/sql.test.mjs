import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import initSqlJs from "sql.js";
import { executeQuery, prepareDatabase } from "../src/lib/sqlEngine.ts";
import { grade } from "../src/lib/grading.ts";
const SQL = await initSqlJs();
const bytes = readFileSync(
  new URL("../public/data/titanic-ch01.sqlite", import.meta.url),
);
const chapter = JSON.parse(
  readFileSync(new URL("../content/chapter-01.json", import.meta.url)),
);
function database(t) {
  const db = new SQL.Database(bytes);
  prepareDatabase(db);
  t.after(() => db.close());
  return db;
}
const output = (columns, values, truncated = false) => ({
  columns,
  values,
  truncated,
});

test("all five missions have complete teaching content and valid reference answers", (t) => {
  assert.equal(chapter.lessons.length, 5);
  assert.equal(new Set(chapter.lessons.map((m) => m.id)).size, 5);
  const db = database(t);
  chapter.lessons.forEach((mission, index) => {
    for (const key of [
      "id",
      "title",
      "story",
      "objective",
      "explanation",
      "task",
      "starterSql",
      "referenceSql",
      "solutionExplanation",
    ])
      assert.ok(mission[key]?.trim(), `${mission.id}.${key}`);
    assert.equal(mission.number, index + 1);
    assert.ok(mission.hints.length >= 2);
    assert.equal(typeof mission.orderMatters, "boolean");
    const actual = executeQuery(db, mission.referenceSql);
    assert.equal(actual.values.length, [5, 24, 24, 5, 10][index]);
    assert.ok(grade(actual, actual, mission.orderMatters).correct);
  });
});
test("engine loads actual schema and accepts comments, CTEs and trailing comments", (t) => {
  const db = database(t);
  assert.deepEqual(
    prepareDatabase(db).map((c) => c.name),
    [
      "passenger_id",
      "name",
      "age",
      "passenger_class",
      "embarked_port",
      "ticket_fare",
    ],
  );
  assert.equal(
    executeQuery(
      db,
      "-- assignment\n/* hello */ WITH sample AS (SELECT name FROM passengers) SELECT * FROM sample LIMIT 5; -- done",
    ).values.length,
    5,
  );
  assert.deepEqual(executeQuery(db, "SELECT ';' AS punctuation;").values, [
    [";"],
  ]);
});
test("read-only engine rejects mutations, configuration changes and multiple statements", (t) => {
  const db = database(t);
  for (const sql of [
    "DELETE FROM passengers",
    "PRAGMA query_only=OFF",
    'ATTACH DATABASE ":memory:" AS other',
    "SELECT 1; PRAGMA query_only=OFF;",
    "SELECT 1; DELETE FROM passengers;",
    "SELECT 1; SELECT 2;",
    "WITH t AS (SELECT 1) DELETE FROM passengers",
  ])
    assert.throws(() => executeQuery(db, sql));
  assert.throws(() => db.run("DELETE FROM passengers"), /readonly/);
  assert.equal(executeQuery(db, "SELECT * FROM passengers").values.length, 24);
});
test("empty results preserve columns and oversized results are capped and cannot pass grading", (t) => {
  const db = database(t);
  assert.deepEqual(
    executeQuery(db, "SELECT name FROM passengers WHERE 0"),
    output(["name"], []),
  );
  const result = executeQuery(
    db,
    "SELECT p.name FROM passengers p CROSS JOIN passengers q",
  );
  assert.equal(result.values.length, 100);
  assert.equal(result.truncated, true);
  assert.equal(grade(result, result, false).correct, false);
  assert.equal(
    executeQuery(
      db,
      "SELECT p.name FROM passengers p CROSS JOIN passengers q LIMIT 100",
    ).truncated,
    false,
  );
});
test("syntax and unknown-column errors remain useful and do not poison the database", (t) => {
  const db = database(t);
  assert.throws(
    () => executeQuery(db, "SELECT missing FROM passengers"),
    /no such column/,
  );
  assert.throws(
    () => executeQuery(db, "SELECT FROM passengers"),
    /syntax error/,
  );
  assert.equal(
    executeQuery(db, "SELECT name FROM passengers LIMIT 1").values.length,
    1,
  );
});
test("grading accepts equivalent SQL and reordered columns while retaining duplicate multiplicity", (t) => {
  const db = database(t);
  const expected = executeQuery(db, "SELECT name, age FROM passengers");
  const actual = executeQuery(
    db,
    "SELECT age, name FROM passengers ORDER BY name DESC",
  );
  assert.equal(grade(actual, expected, false).correct, true);
  assert.equal(grade(actual, expected, true).correct, false);
  assert.equal(
    grade(output(["n"], [[1], [1], [2]]), output(["n"], [[1], [2], [2]]), false)
      .correct,
    false,
  );
  assert.equal(
    grade(output(["n"], [[null], [1]]), output(["n"], [[1], [null]]), false)
      .correct,
    true,
  );
  assert.equal(
    grade(output(["n"], [["1"]]), output(["n"], [[1]]), false).correct,
    false,
  );
});
test("grading explains wrong columns, row counts and values", () => {
  const expected = output(["name"], [["Alice"]]);
  assert.match(
    grade(output(["age"], [[20]]), expected, false).message,
    /columns/,
  );
  assert.match(
    grade(output(["name"], []), expected, false).message,
    /expects 1/,
  );
  assert.match(
    grade(output(["name"], [["Other"]]), expected, false).message,
    /values/,
  );
});
