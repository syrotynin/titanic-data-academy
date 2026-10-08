import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Mission } from "../../src/lib/types";

const lessons: Mission[] = JSON.parse(
  readFileSync(new URL("../../content/chapter-01.json", import.meta.url), "utf8"),
).lessons;

test("every lesson teaches syntax, shows a distinct worked example, then asks a task", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("./");
  await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();

  for (const mission of lessons) {
    await page.getByRole("navigation", { name: "Your missions" })
      .getByRole("button", { name: mission.title, exact: false }).click();
    const lesson = page.locator("#lesson");
    await expect(lesson.getByRole("heading", { name: "1. Learn the idea" })).toBeVisible();
    await expect(lesson.getByText(mission.explanation, { exact: true })).toBeVisible();
    await expect(lesson.locator(".sql-vocabulary dt")).toHaveCount(mission.keyTerms.length);
    await expect(lesson.getByRole("heading", { name: "2. Follow a worked example" })).toBeVisible();
    await expect(lesson.locator(".example-code")).toContainText(mission.example.sql);
    await expect(lesson.locator(".example-steps li")).toHaveCount(mission.example.walkthrough.length);
    await expect(lesson.getByRole("heading", { name: "3. Your turn — the archive task" })).toBeVisible();
    await expect(lesson.locator(".practice-step")).toContainText(mission.task);

    const draftBefore = await page.locator(".cm-content").innerText();
    await lesson.getByRole("button", { name: "▶ Run this example" }).click();
    await expect(lesson.getByRole("region", { name: "Example SQL results" })).toBeVisible();
    await expect(lesson.locator(".example-output tbody tr").first()).toBeVisible();
    await expect(page.locator(".cm-content")).toHaveText(draftBefore, { useInnerText: true });
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  }
});

test("first lesson explains SELECT, star, FROM, LIMIT and semicolon on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();

  const lesson = page.locator("#lesson");
  const terms = lesson.locator(".sql-vocabulary dt code");
  await expect(terms).toHaveText(["SELECT", "*", "FROM", "LIMIT", ";"]);
  await expect(lesson.locator(".example-code")).toContainText("LIMIT 2;");
  await expect(lesson.locator(".practice-step")).toContainText("FIVE rows");
  const draft = page.getByLabel("SQL query", { exact: true });
  await expect(draft).toHaveValue(lessons[0].starterSql);

  await lesson.getByRole("button", { name: "▶ Run this example" }).click();
  await expect(lesson.locator(".example-output tbody tr")).toHaveCount(2);
  await expect(draft).toHaveValue(lessons[0].starterSql);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
