import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Next mission reveals the new lesson on a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("./");
    await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();

    // Complete the first mission to make the Next mission action available.
    await page.getByLabel("SQL query", { exact: true }).fill(
      "SELECT * FROM passengers LIMIT 5;",
    );
    await page.getByRole("button", { name: "✓ Check answer" }).click();
    await expect(page.getByRole("button", { name: "Next mission →" })).toBeVisible();

    await page.getByRole("button", { name: "Next mission →" }).click();

    // The content changes AND the learner is brought back to its beginning.
    await expect(page.locator("#lesson h2")).toHaveText("Your First Query");
    await expect(page.locator("#lesson h2")).toBeFocused();
    await expect.poll(
      () => page.locator("#lesson").evaluate(
        (node) => node.getBoundingClientRect().top,
      ),
      { timeout: 5_000 },
    ).toBeGreaterThanOrEqual(0);
    const lessonTop = await page.locator("#lesson").evaluate(
      (node) => node.getBoundingClientRect().top,
    );
    expect(lessonTop).toBeLessThan(80);
    await expect(page.getByRole("button", { name: "Your First Query", exact: false }))
      .toHaveAttribute("aria-current", "step");
  });
}
