import type { Output, Cell } from "./types.ts";
export type Grade = { correct: boolean; message: string };
const cellKey = (cell: Cell) =>
  cell instanceof Uint8Array ? ["blob", Array.from(cell)] : cell;
export function grade(
  actual: Output,
  expected: Output,
  orderMatters: boolean,
): Grade {
  const fail = (message: string): Grade => ({ correct: false, message });
  if (actual.truncated || expected.truncated)
    return fail(
      "The result exceeds 100 rows. Return the complete result requested by this mission.",
    );
  const remaining = [...actual.columns.keys()];
  const mapping = expected.columns.map((column) => {
    const position = remaining.findIndex((i) => actual.columns[i] === column);
    return position < 0 ? -1 : remaining.splice(position, 1)[0];
  });
  if (
    actual.columns.length !== expected.columns.length ||
    mapping.includes(-1)
  ) {
    return fail(
      `Check the columns: this mission asks for ${expected.columns.join(", ")}.`,
    );
  }
  if (actual.values.length !== expected.values.length) {
    return fail(
      `Your query returned ${actual.values.length} rows; this mission expects ${expected.values.length}.`,
    );
  }
  const a = actual.values.map((row) =>
    JSON.stringify(mapping.map((i) => cellKey(row[i]))),
  );
  const b = expected.values.map((row) => JSON.stringify(row.map(cellKey)));
  if (!orderMatters) {
    a.sort();
    b.sort();
  }
  if (a.some((row, i) => row !== b[i])) {
    return fail(
      orderMatters
        ? "Check the values and row order. Use the requested sample of the practice ledger."
        : "The columns and row count match; check which records and values your query returns.",
    );
  }
  return {
    correct: true,
    message: "Excellent! Your query produces the expected results.",
  };
}
