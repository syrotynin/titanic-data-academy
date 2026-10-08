import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanProgress,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
} from "../src/lib/progress.ts";
const ids = ["ch01-01", "ch01-02"];
function mockStorage(t, value) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value,
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  });
}
test("corrupt progress is sanitized and unknown mission IDs are ignored", () => {
  assert.deepEqual(cleanProgress(null, ids), {
    version: 1,
    updatedAt: 0,
    selected: ids[0],
    done: [],
    drafts: {},
  });
  const actual = cleanProgress(
    {
      selected: "missing",
      done: [ids[0], ids[0], "missing"],
      drafts: { [ids[0]]: "", [ids[1]]: 42, missing: "SELECT 1" },
    },
    ids,
  );
  assert.deepEqual(actual.done, [ids[0]]);
  assert.deepEqual(actual.drafts, { [ids[0]]: "" });
  assert.equal(actual.selected, ids[0]);
});
test("storage fallback restores the selected mission and distinct drafts immediately", async (t) => {
  const store = new Map();
  mockStorage(t, {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  });
  const progress = cleanProgress(
    {
      selected: ids[1],
      done: [ids[0]],
      drafts: {
        [ids[0]]: "SELECT name FROM passengers",
        [ids[1]]: "SELECT age FROM passengers",
      },
    },
    ids,
  );
  const pending = saveProgress(progress);
  assert.ok(store.has(STORAGE_KEY));
  assert.equal(await pending, true);
  const loaded = await loadProgress(ids);
  assert.equal(loaded.selected, ids[1]);
  assert.deepEqual(loaded.drafts, progress.drafts);
});
test("original starter drafts and completion survive migration", async (t) => {
  const store = new Map([
    ["titanic-done", JSON.stringify([ids[1]])],
    ["titanic-query-" + ids[0], "SELECT * FROM passengers"],
  ]);
  mockStorage(t, { getItem: (key) => store.get(key) ?? null });
  const loaded = await loadProgress(ids);
  assert.deepEqual(loaded.done, [ids[1]]);
  assert.equal(loaded.drafts[ids[0]], "SELECT * FROM passengers");
});
test("blocked storage never prevents learning and reports that saving failed", async (t) => {
  mockStorage(t, {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
  });
  assert.deepEqual((await loadProgress(ids)).done, []);
  assert.equal(await saveProgress(cleanProgress(null, ids)), false);
});
