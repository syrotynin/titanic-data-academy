export type Progress = {
  version: 1;
  updatedAt: number;
  selected: string;
  done: string[];
  drafts: Record<string, string>;
};
export const STORAGE_KEY = "titanic-progress-v1";
export function cleanProgress(value: unknown, ids: string[]): Progress {
  const source =
    value && typeof value === "object" ? (value as Partial<Progress>) : {};
  const drafts: Record<string, string> = {};
  for (const id of ids) {
    const draft = source.drafts?.[id];
    if (typeof draft === "string") drafts[id] = draft;
  }
  return {
    version: 1,
    updatedAt:
      typeof source.updatedAt === "number" && Number.isFinite(source.updatedAt)
        ? source.updatedAt
        : 0,
    selected: ids.includes(source.selected ?? "") ? source.selected! : ids[0],
    done: Array.isArray(source.done)
      ? [...new Set(source.done.filter((id) => ids.includes(id)))]
      : [],
    drafts,
  };
}
function openStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("titanic-academy", 1);
    let finished = false;
    const timeout = setTimeout(() => {
      finished = true;
      reject(new Error("Progress storage timed out."));
    }, 1500);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("progress");
    request.onsuccess = () => {
      clearTimeout(timeout);
      if (finished) request.result.close();
      else {
        finished = true;
        resolve(request.result);
      }
    };
    request.onerror = () => {
      clearTimeout(timeout);
      finished = true;
      reject(request.error);
    };
    request.onblocked = () => {
      clearTimeout(timeout);
      finished = true;
      reject(new Error("Progress storage is blocked."));
    };
  });
}
async function databaseOperation(value?: Progress): Promise<unknown> {
  const db = await openStore();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        "progress",
        value ? "readwrite" : "readonly",
      );
      const store = transaction.objectStore("progress");
      const request = value
        ? store.put(value, "chapter-01")
        : store.get("chapter-01");
      const timeout = setTimeout(() => {
        transaction.abort();
        reject(new Error("Progress storage timed out."));
      }, 1500);
      transaction.oncomplete = () => {
        clearTimeout(timeout);
        resolve(request.result);
      };
      transaction.onerror = transaction.onabort = () => {
        clearTimeout(timeout);
        reject(transaction.error ?? new Error("Progress could not be saved."));
      };
    });
  } finally {
    db.close();
  }
}
function readLocal(ids: string[]): Progress {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) return cleanProgress(JSON.parse(current), ids);
  // Preserve drafts and completions made with the original starter.
  return cleanProgress(
    {
      done: JSON.parse(localStorage.getItem("titanic-done") ?? "[]"),
      drafts: Object.fromEntries(
        ids.flatMap((id) => {
          const draft = localStorage.getItem("titanic-query-" + id);
          return draft === null ? [] : [[id, draft]];
        }),
      ),
    },
    ids,
  );
}
export async function loadProgress(ids: string[]): Promise<Progress> {
  let local: Progress | undefined;
  try {
    local = readLocal(ids);
  } catch {
    /* storage blocked or corrupt */
  }
  try {
    const value = await databaseOperation();
    if (value) {
      const stored = cleanProgress(value, ids);
      return local && local.updatedAt >= stored.updatedAt ? local : stored;
    }
  } catch {
    /* local fallback */
  }
  return local ?? cleanProgress(null, ids);
}
let saves: Promise<boolean> = Promise.resolve(true);
let lastSavedAt = 0;
export function saveProgress(progress: Progress): Promise<boolean> {
  // Write the fallback synchronously, including keystrokes immediately before reload.
  lastSavedAt = Math.max(Date.now(), progress.updatedAt + 1, lastSavedAt + 1);
  const snapshot = { ...progress, updatedAt: lastSavedAt };
  let localSaved = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    localSaved = true;
  } catch {
    /* private mode/quota */
  }
  saves = saves
    .catch(() => false)
    .then(async () => {
      try {
        await databaseOperation(snapshot);
        return true;
      } catch {
        return localSaved;
      }
    });
  return saves;
}
