export type Cell = string | number | null | Uint8Array;
export type Output = {
  columns: string[];
  values: Cell[][];
  truncated: boolean;
};
export type SchemaColumn = { name: string; type: string; primaryKey: boolean };
export type Mission = {
  id: string;
  number: number;
  title: string;
  kind: string;
  objective: string;
  story: string;
  explanation: string;
  keyTerms: { term: string; meaning: string }[];
  example: {
    context: string;
    sql: string;
    walkthrough: string[];
    takeaway: string;
  };
  task: string;
  starterSql: string;
  referenceSql: string;
  hints: string[];
  solutionExplanation: string;
  orderMatters: boolean;
};
export type WorkerRequest =
  | { id: number; type: "init"; databaseUrl: string }
  | { id: number; type: "query"; sql: string; referenceSql?: string };
export type WorkerResult =
  { schema: SchemaColumn[] } | { actual: Output; expected?: Output };
export type WorkerResponse = { id: number } & (
  { result: WorkerResult } | { error: string }
);
