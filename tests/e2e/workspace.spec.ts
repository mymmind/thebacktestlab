import { expect, test } from "@playwright/test";

import { aggregateCandles } from "../../lib/candles/candle-aggregation";
import { normalizeCandlesFromCsv } from "../../lib/candles/candle-normalizer";
import fs from "node:fs";
import path from "node:path";

function loadExpectedFirstM15Candle() {
  const csv = fs.readFileSync(
    path.join(process.cwd(), "public/sample-data/EURUSD_M1_sample.csv"),
    "utf8",
  );
  const m1 = normalizeCandlesFromCsv(csv, "EURUSD", "M1");
  const m15 = aggregateCandles(m1, "M15");
  return m15[0]!;
}

test("workspace loads with default symbol and candle status", async ({
  page,
}) => {
  const expected = loadExpectedFirstM15Candle();

  await page.goto("/workspace");
  await expect(page.getByTestId("dev-footer")).toHaveText("Developed by Auto");
  await expect(
    page.getByRole("heading", { name: /workspace|backtesting/i }),
  ).toBeVisible();
  await expect(page.getByTestId("selected-symbol")).toHaveText("EURUSD");
  await expect(page.getByTestId("selected-timeframe")).toHaveText("M15");

  await expect(page.getByTestId("current-candle-timestamp")).toHaveText(
    new Date(expected.timestamp).toISOString(),
    { timeout: 10_000 },
  );
  await expect(page.getByTestId("current-candle-close")).toHaveText(
    expected.close.toFixed(5),
  );
  await expect(page.getByTestId("loaded-candle-count")).not.toHaveText("0");
});

test("symbol selector loads a different dataset", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByTestId("current-candle-close")).not.toBeEmpty({
    timeout: 10_000,
  });

  const eurusdClose = await page
    .getByTestId("current-candle-close")
    .textContent();

  await page.getByTestId("symbol-selector").selectOption("GBPUSD");
  await expect(page.getByTestId("selected-symbol")).toHaveText("GBPUSD");

  await expect(page.getByTestId("current-candle-close")).not.toHaveText(
    eurusdClose ?? "",
    { timeout: 10_000 },
  );
});

test("chart workspace loads and timeframe switching updates chart state", async ({
  page,
}) => {
  await page.goto("/workspace");
  await expect(page.getByTestId("candle-chart")).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByTestId("chart-ready")).toHaveText("ready", {
    timeout: 10_000,
  });
  await expect(page.getByTestId("candle-chart").locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("loaded-candle-count")).not.toHaveText("0");

  const m15Count = Number(
    await page.getByTestId("loaded-candle-count").textContent(),
  );
  const initialChartCount = Number(
    await page.getByTestId("chart-candle-count").textContent(),
  );
  expect(initialChartCount).toBeGreaterThan(0);

  await page.getByTestId("timeframe-selector").selectOption("H1");
  await expect(page.getByTestId("selected-timeframe")).toHaveText("H1");

  await expect(async () => {
    const h1Count = Number(
      await page.getByTestId("loaded-candle-count").textContent(),
    );
    expect(h1Count).toBeLessThan(m15Count);
  }).toPass();

  await expect(page.getByTestId("chart-ready")).toHaveText("ready");
  await expect(page.getByTestId("chart-candle-count")).toHaveText("1");
});

test("ArrowRight advances current candle with stable visible window", async ({
  page,
}) => {
  await page.goto("/workspace");
  await expect(page.getByTestId("current-candle-timestamp")).not.toBeEmpty({
    timeout: 10_000,
  });

  const initialTimestamp = await page
    .getByTestId("current-candle-timestamp")
    .textContent();
  const initialVisible = Number(
    await page.getByTestId("visible-candle-count").textContent(),
  );

  await page.keyboard.press("ArrowRight");

  await expect(page.getByTestId("current-candle-timestamp")).not.toHaveText(
    initialTimestamp ?? "",
  );
  await expect(page.getByTestId("visible-candle-count")).toHaveText(
    String(initialVisible + 1),
  );

  await page.goto("/workspace");
  await expect(page.getByTestId("current-candle-timestamp")).not.toBeEmpty({
    timeout: 10_000,
  });
  await page.getByTestId("timeframe-selector").selectOption("M1");

  for (let step = 0; step < 119; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page.getByTestId("visible-candle-count")).toHaveText("120");
});

test("Space toggles play and pause", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByTestId("current-candle-timestamp")).not.toBeEmpty({
    timeout: 10_000,
  });
  await expect(page.getByTestId("replay-status")).toHaveText("idle");

  await page.locator("main").click();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("replay-status")).toHaveText("playing");

  await page.keyboard.press("Space");
  await expect(page.getByTestId("replay-status")).toHaveText("paused");
});
