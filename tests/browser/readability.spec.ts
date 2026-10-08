import { expect, test } from "@playwright/test";

test("lesson text, navigation, and SQL editor have readable desktop text", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("./");
  const size = async (selector: string) =>
    page.locator(selector).first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));

  expect(await size(".lesson-goal")).toBeGreaterThanOrEqual(16);
  expect(await size(".concept p")).toBeGreaterThanOrEqual(15);
  expect(await size(".mission-label")).toBeGreaterThanOrEqual(15);
  expect(await size(".editor-frame .cm-scroller")).toBeGreaterThanOrEqual(16);
  expect(await size(".schema summary")).toBeGreaterThanOrEqual(15);
});

test("mobile missions are all visible without a horizontal scrolling strip", async ({ page }) => {
  for (const width of [320, 390, 600, 750]) {
    await page.setViewportSize({ width, height: 850 });
    if (width === 320) await page.goto("./");

    const nav = page.getByRole("navigation", { name: "Your missions" });
    await expect(nav).toBeVisible();
    await expect(nav.locator("button")).toHaveCount(5);

    const layout = await nav.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        display: style.display,
        columns: style.gridTemplateColumns.split(" ").length,
        contentWidth: node.scrollWidth,
        visibleWidth: node.clientWidth,
      };
    });
    expect(layout.display).toBe("grid");
    expect(layout.columns).toBe(width <= 450 ? 1 : 2);
    expect(layout.contentWidth).toBeLessThanOrEqual(layout.visibleWidth);
    expect(await page.locator(".mission-label").first().evaluate(
      (node) => parseFloat(getComputedStyle(node).fontSize),
    )).toBeGreaterThanOrEqual(14);
    expect(await page.locator(".lesson-goal").evaluate(
      (node) => parseFloat(getComputedStyle(node).fontSize),
    )).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
