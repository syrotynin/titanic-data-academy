import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Mission } from "../../src/lib/types";
const chapter: { lessons: Mission[] } = JSON.parse(
  readFileSync(
    new URL("../../content/chapter-01.json", import.meta.url),
    "utf8",
  ),
);

async function openArchive(page: Page) {
  // Fonts are optional: validate the app with no external runtime dependencies.
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("./");
  await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();
}
async function query(page: Page, sql: string, assessment = false) {
  await page.locator(".cm-content").fill(sql);
  await page
    .getByRole("button", {
      name: assessment ? "✓ Check answer" : "▶ Run query",
    })
    .click();
}

test("all five missions can be solved and progress survives refresh", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openArchive(page);
  await expect(
    page.getByText("integer · primary key", { exact: false }),
  ).toBeVisible();
  for (const [index, mission] of chapter.lessons.entries()) {
    if (index)
      await page.getByRole("button", { name: "Next mission →" }).click();
    await expect(page.locator("#lesson h2")).toHaveText(mission.title);
    await expect(
      page.getByText(mission.explanation, { exact: true }),
    ).toBeVisible();
    await query(
      page,
      index === 2
        ? "SELECT age, name FROM passengers ORDER BY name DESC;"
        : mission.referenceSql,
      true,
    );
    await expect(
      page.getByText("Excellent! Your query produces the expected results.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(index + 1),
    );
  }
  await expect(
    page.getByRole("heading", { name: "Chapter 1 complete" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("#lesson h2")).toHaveText(chapter.lessons[4].title);
  await expect(page.locator(".cm-content")).toHaveText(
    chapter.lessons[4].referenceSql,
  );
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "5",
  );
  expect(errors).toEqual([]);
});

test("exploration, grading feedback, hints and optional solutions are separate", async ({
  page,
}) => {
  await openArchive(page);
  await query(page, chapter.lessons[0].referenceSql);
  await expect(
    page.getByRole("region", { name: "SQL result table" }).locator("tbody tr"),
  ).toHaveCount(5);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await query(page, "SELECT name FROM passengers LIMIT 5;", true);
  await expect(page.getByText(/Check the columns:/)).toBeVisible();
  await query(page, "SELECT * FROM passengers LIMIT 4;", true);
  await expect(page.getByText(/expects 5/)).toBeVisible();
  await query(page, "SELECT missing FROM passengers;");
  await expect(page.getByRole("alert")).toContainText("no such column");
  await page.getByRole("button", { name: "Reveal hint (0/3)" }).click();
  await page.getByRole("button", { name: "Reveal hint (1/3)" }).click();
  await expect(page.locator("ol.hint li")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Show solution", exact: true })
    .click();
  await page.getByRole("button", { name: "Use this query" }).click();
  await expect(page.locator(".cm-content")).toHaveText(
    chapter.lessons[0].referenceSql,
  );
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await page.getByRole("button", { name: "✓ Check answer" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
});

test("navigation restores independent drafts without overwriting either mission", async ({
  page,
}) => {
  await openArchive(page);
  const first = "-- draft one\nSELECT name FROM passengers LIMIT 3;";
  const second = "-- draft two\nSELECT age FROM passengers;";
  await page.locator(".cm-content").fill(first);
  await page
    .getByRole("button", { name: "Your First Query", exact: false })
    .click();
  await page.locator(".cm-content").fill(second);
  await page
    .getByRole("button", { name: "Meet the Database", exact: false })
    .click();
  await expect(page.locator(".cm-content")).toHaveText(first, {
    useInnerText: true,
  });
  await page
    .getByRole("button", { name: "Your First Query", exact: false })
    .click();
  await page.reload();
  await expect(page.locator("#lesson h2")).toHaveText("Your First Query");
  await expect(page.locator(".cm-content")).toHaveText(second, {
    useInnerText: true,
  });
  await page.getByRole("button", { name: "Reset query" }).click();
  await expect(page.locator(".cm-content")).toHaveText(
    chapter.lessons[1].starterSql,
    { useInnerText: true },
  );
  await page
    .getByRole("button", { name: "Meet the Database", exact: false })
    .click();
  await expect(page.locator(".cm-content")).toHaveText(first, {
    useInnerText: true,
  });
});

test("read-only restrictions and result caps survive engine reset", async ({
  page,
}) => {
  await openArchive(page);
  for (const sql of [
    "PRAGMA query_only=OFF;",
    "SELECT 1; DELETE FROM passengers;",
  ]) {
    await query(page, sql);
    await expect(page.getByRole("alert")).toBeVisible();
  }
  await query(page, "SELECT p.name FROM passengers p CROSS JOIN passengers q;");
  await expect(
    page.getByText("Showing the first 100 rows.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "SQL result table" }).locator("tbody tr"),
  ).toHaveCount(100);
  await page.getByRole("button", { name: "Reset engine" }).click();
  await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();
  await query(page, "SELECT count(*) AS passengers FROM passengers;");
  await expect(page.locator("tbody td")).toHaveText("24");
});

test("a long query times out without freezing the UI and the next query succeeds", async ({
  page,
}) => {
  await openArchive(page);
  await query(
    page,
    "WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<1000000000) SELECT sum(n) FROM numbers;",
  );
  // This button remains responsive while computation runs in the worker.
  await page
    .getByRole("button", { name: "Show solution", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Hide solution" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "timed out after five seconds",
    { timeout: 8000 },
  );
  await query(page, "SELECT name FROM passengers LIMIT 1;");
  await expect(page.locator("tbody td")).toHaveText("Eleanor Whitmore");
});

test("localStorage fallback works when IndexedDB is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new Error("blocked");
      },
    }),
  );
  await openArchive(page);
  await page.locator(".cm-content").fill("SELECT age FROM passengers;");
  await page.reload();
  await expect(page.locator(".cm-content")).toHaveText(
    "SELECT age FROM passengers;",
  );
  await expect(
    page.getByText("Browser storage is unavailable.", { exact: false }),
  ).toHaveCount(0);
});

test("IndexedDB restores progress when localStorage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    }),
  );
  await openArchive(page);
  await query(page, chapter.lessons[0].referenceSql, true);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const request = indexedDB.open("titanic-academy", 1);
            request.onsuccess = () => {
              const db = request.result;
              const result = db
                .transaction("progress")
                .objectStore("progress")
                .get("chapter-01");
              result.onsuccess = () => {
                resolve(result.result?.done.length ?? 0);
                db.close();
              };
            };
          }),
      ),
    )
    .toBe(1);
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
});

test("blocked storage warns the learner and the mobile layout stays within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    for (const name of ["localStorage", "indexedDB"])
      Object.defineProperty(window, name, {
        get() {
          throw new Error("blocked");
        },
      });
  });
  await openArchive(page);
  await query(page, chapter.lessons[0].referenceSql, true);
  await expect(page.getByRole("alert")).toContainText(
    "Browser storage is unavailable",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".cm-content").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "▶ Run query" })).toBeFocused();
});

test("database load failure can be recovered with Reset engine", async ({
  page,
}) => {
  let first = true;
  await page.route("**/data/titanic-ch01.sqlite", (route) => {
    if (first) {
      first = false;
      return route.fulfill({ status: 503, body: "unavailable" });
    }
    return route.continue();
  });
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("./");
  await expect(page.getByRole("alert")).toContainText("HTTP 503");
  await expect(
    page.getByRole("button", { name: "▶ Run query" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Your First Query", exact: false })
    .click();
  await expect(page.getByRole("alert")).toContainText("HTTP 503");
  await page.getByRole("button", { name: "Reset engine" }).click();
  await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();
  await query(page, "SELECT name FROM passengers LIMIT 1;");
  await expect(page.locator("tbody td")).toHaveText("Eleanor Whitmore");
});
