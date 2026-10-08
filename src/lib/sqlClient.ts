import type { WorkerRequest, WorkerResponse, WorkerResult } from "./types";
type Request = WorkerRequest extends infer R
  ? R extends WorkerRequest
    ? Omit<R, "id">
    : never
  : never;
export class SqlClient {
  private worker?: Worker;
  private sequence = 0;
  private pending = new Map<
    number,
    {
      resolve: (r: WorkerResult) => void;
      reject: (e: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private ready?: Promise<WorkerResult>;
  private databaseUrl: string;
  constructor(databaseUrl: string) {
    this.databaseUrl = databaseUrl;
  }
  private send(request: Request): Promise<WorkerResult> {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () =>
          this.stop(
            new Error(
              "Query timed out after five seconds. The engine was reset; try a smaller query.",
            ),
          ),
        5000,
      );
      this.pending.set(id, { resolve, reject, timer });
      this.worker!.postMessage({ ...request, id });
    });
  }
  initialize(): Promise<WorkerResult> {
    if (this.ready) return this.ready;
    this.worker = new Worker(
      new URL("../worker/sql.worker.ts", import.meta.url),
      { type: "module" },
    );
    const worker = this.worker;
    this.worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      const pending = this.pending.get(data.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(data.id);
      if ("error" in data) pending.reject(new Error(data.error));
      else pending.resolve(data.result);
    };
    this.worker.onerror = () => {
      if (this.worker === worker)
        this.stop(
          new Error("The SQL engine could not run. Reset the engine to retry."),
        );
    };
    this.ready = this.send({
      type: "init",
      databaseUrl: this.databaseUrl,
    }).catch((error) => {
      if (this.worker === worker) this.stop(error);
      throw error;
    });
    return this.ready;
  }
  async query(sql: string, referenceSql?: string) {
    await this.initialize();
    const result = await this.send({ type: "query", sql, referenceSql });
    if (!("actual" in result)) throw new Error("Unexpected SQL response.");
    return result;
  }
  stop(error = new Error("SQL engine reset.")) {
    this.worker?.terminate();
    this.worker = undefined;
    this.ready = undefined;
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(error);
    }
    this.pending.clear();
  }
}
