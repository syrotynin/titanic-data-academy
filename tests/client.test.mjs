import test from "node:test";
import assert from "node:assert/strict";
import { SqlClient } from "../src/lib/sqlClient.ts";

function fakeWorker(t) {
  const original = globalThis.Worker;
  const instances = [];
  class Worker {
    messages = [];
    terminated = false;
    constructor() {
      instances.push(this);
    }
    postMessage(message) {
      this.messages.push(message);
    }
    terminate() {
      this.terminated = true;
    }
    respond(result, index = this.messages.length - 1) {
      this.onmessage({ data: { id: this.messages[index].id, result } });
    }
  }
  globalThis.Worker = Worker;
  t.after(() => {
    if (original) globalThis.Worker = original;
    else delete globalThis.Worker;
  });
  return instances;
}

test("initialization cleanup cannot terminate a newly initialized worker", async (t) => {
  const workers = fakeWorker(t);
  const client = new SqlClient("https://example.test/data.sqlite");
  t.after(() => client.stop());
  const cancelled = client.initialize();
  const rejection = assert.rejects(cancelled, /reset/);
  client.stop();
  const initialized = client.initialize();
  await rejection;
  assert.equal(workers[0].terminated, true);
  assert.equal(workers[1].terminated, false);
  workers[1].respond({ schema: [] });
  await initialized;
});
test("a timeout terminates computation and the following query starts a fresh worker", async (t) => {
  const workers = fakeWorker(t);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const client = new SqlClient("https://example.test/data.sqlite");
  t.after(() => client.stop());
  const ready = client.initialize();
  workers[0].respond({ schema: [] });
  await ready;
  const query = client.query("SELECT 1");
  await Promise.resolve();
  const rejection = assert.rejects(query, /timed out after five seconds/);
  t.mock.timers.tick(5000);
  await rejection;
  assert.equal(workers[0].terminated, true);
  const next = client.query("SELECT 2");
  workers[1].respond({ schema: [] });
  await Promise.resolve();
  await Promise.resolve();
  const actual = { columns: ["2"], values: [[2]], truncated: false };
  workers[1].respond({ actual });
  assert.deepEqual((await next).actual, actual);
});
test("worker failures reject outstanding requests instead of leaving them hanging", async (t) => {
  const workers = fakeWorker(t);
  const client = new SqlClient("https://example.test/data.sqlite");
  t.after(() => client.stop());
  const pending = client.initialize();
  const rejection = assert.rejects(pending, /could not run/);
  workers[0].onerror();
  await rejection;
  assert.equal(workers[0].terminated, true);
});
