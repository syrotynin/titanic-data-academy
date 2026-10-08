import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Next mission reveals the new lesson on a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("./");
    await expect(page.getByRole("button", { name: "▶ Run query" })).toBeEnabled();

    const sql = "SELECT * FROM passengers LIMIT 5;";
    if (width <= 750) {
      // Match the mobile learning flow: grade inside the expanded editor,
      // then return to the lesson before advancing.
      await page.getByRole("button", { name: "Expand editor" }).click();
      const dialog = page.getByRole("dialog", { name: "Your SQL query" });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel("SQL query", { exact: true }).fill(sql);
      await dialog.getByRole("button", { name: "✓ Check answer" }).click();
      await expect(dialog.getByRole("status")).toContainText("Excellent!");
      await dialog.getByRole("button", { name: "Done editing" }).click();
      await expect(dialog).toHaveCount(0);
    } else {
      await page.getByLabel("SQL query", { exact: true }).fill(sql);
      await page.getByRole("button", { name: "✓ Check answer" }).click();
      await expect(
        page.getByText("Excellent! Your query produces the expected results.", {
          exact: true,
        }),
      ).toBeVisible();
    }

    // Confirm the first mission really completed before checking navigation.
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    const next = page.getByRole("button", { name: "Next mission →" });
    await expect(next).toBeVisible();
    await next.click();

    await expect(page.locator("#lesson h2")).toHaveText("Your First Query");
    await expect(page.locator("#lesson h2")).toBeFocused();

    // Smooth scrolling is asynchronous, so poll until it reaches the lesson.
    await expect
      .poll(
        () =>
          page.locator("#lesson").evaluate(
            (node) => node.getBoundingClientRect().top,
          ),
        { timeout: 5_000 },
      )
      .toBeGreaterThanOrEqual(0);
    const lessonTop = await page.locator("#lesson").evaluate(
      (node) => node.getBoundingClientRect().top,
    );
    expect(lessonTop).toBeLessThan(80);
    await expect(
      page.getByRole("button", { name: "Your First Query", exact: false }),
    ).toHaveAttribute("aria-current", "step");
  });
}
