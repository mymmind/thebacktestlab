import { expect, test } from "@playwright/test";

import { STORAGE_KEY } from "@/lib/storage/local-storage";

async function resetLocalData(page: import("@playwright/test").Page) {
  await page.goto("/workspace");
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
}

async function waitForWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/workspace");
  await expect(page.getByTestId("current-candle-close")).not.toBeEmpty({
    timeout: 10_000,
  });
}

async function placeLongTrade(
  page: import("@playwright/test").Page,
  stopLoss: string,
  takeProfit: string,
) {
  await page.locator("main").click();
  await page.keyboard.press("l");
  await expect(page.getByTestId("trade-ticket")).toBeVisible();
  await page.getByTestId("trade-ticket-sl").fill(stopLoss);
  await page.getByTestId("trade-ticket-tp").fill(takeProfit);
  await page.keyboard.press("Enter");
}

test("user can place a long trade", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);
  await page.getByTestId("timeframe-selector").selectOption("M1");

  await page.locator("main").click();
  await page.keyboard.press("l");
  await expect(page.getByTestId("trade-ticket")).toBeVisible();
  await page.getByTestId("trade-ticket-sl").fill("1.08600");
  await page.getByTestId("trade-ticket-tp").fill("1.08800");
  await expect(page.getByTestId("trade-ticket-risk-amount")).toHaveText("500.00");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("open-trade-status")).toContainText("long open");
  await expect(page.getByTestId("trade-log-count")).toHaveText("1");
});

test("invalid long stop loss is blocked", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);
  await page.getByTestId("timeframe-selector").selectOption("M1");

  await page.locator("main").click();
  await page.keyboard.press("l");
  await page.getByTestId("trade-ticket-sl").fill("1.20000");
  await page.getByTestId("trade-ticket-tp").fill("1.30000");

  await expect(page.getByTestId("trade-ticket-error")).toContainText(
    "below entry",
  );
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("trade-log-count")).toHaveText("0");
});

test("long trade closes at TP", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);
  await page.getByTestId("symbol-selector").selectOption("FIXTP");
  await page.getByTestId("timeframe-selector").selectOption("M1");
  await expect(page.getByTestId("current-candle-close")).toHaveText("1.10000", {
    timeout: 10_000,
  });

  const balanceBefore = Number(
    (await page.getByTestId("account-balance").textContent()) ?? "0",
  );

  await placeLongTrade(page, "1.09900", "1.10500");
  await expect(page.getByTestId("open-trade-status")).toContainText("long open");

  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page.getByTestId("open-trade-status")).toHaveText("none");
  await expect(page.getByTestId("trade-log-count")).toHaveText("1");

  const balanceAfter = Number(
    (await page.getByTestId("account-balance").textContent()) ?? "0",
  );
  expect(balanceAfter).toBeGreaterThan(balanceBefore);
});

test("long trade closes at SL with -1R", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);
  await page.getByTestId("symbol-selector").selectOption("FIXSL");
  await page.getByTestId("timeframe-selector").selectOption("M1");

  const balanceBefore = Number(
    (await page.getByTestId("account-balance").textContent()) ?? "0",
  );

  await placeLongTrade(page, "1.09900", "1.10500");

  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page.getByTestId("open-trade-status")).toHaveText("none");

  const balanceAfter = Number(
    (await page.getByTestId("account-balance").textContent()) ?? "0",
  );
  expect(balanceAfter).toBeCloseTo(balanceBefore - 500, 0);
});

test("prop challenge fails on drawdown", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);

  await page.evaluate((key) => {
    const state = {
      version: 1,
      settings: { accountBalance: 180_100, riskPercent: 0.0025 },
      trades: [],
      journals: [],
      challenge: {
        startingBalance: 200_000,
        profitTargetPercent: 0.1,
        maxDailyLossPercent: 0.05,
        maxOverallDrawdownPercent: 0.1,
        status: "active",
        peakBalance: 200_000,
        dailyLossByDate: {},
      },
      exportedAt: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);

  await page.reload();
  await expect(page.getByTestId("account-balance")).toHaveText("180100.00", {
    timeout: 10_000,
  });

  await page.getByTestId("symbol-selector").selectOption("FIXSL");
  await page.getByTestId("timeframe-selector").selectOption("M1");
  await placeLongTrade(page, "1.09900", "1.10500");

  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page.getByTestId("challenge-status")).toHaveText("failed");
  await expect(page.getByTestId("challenge-failure-reason")).toContainText(
    "drawdown",
  );
});

test("journal saves rule checklist after reload", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);
  await page.getByTestId("symbol-selector").selectOption("FIXSL");
  await page.getByTestId("timeframe-selector").selectOption("M1");
  await placeLongTrade(page, "1.09900", "1.10500");

  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await page.goto("/journal");
  await expect(page.getByTestId("journal-panel")).toBeVisible();
  await page.getByTestId("journal-post-trade-note").fill("Clean BOS retest");
  await page.getByTestId("journal-followed-rules").check();

  await page.reload();
  await expect(page.getByTestId("journal-post-trade-note")).toHaveValue(
    "Clean BOS retest",
  );
  await expect(page.getByTestId("journal-followed-rules")).toBeChecked();
});

test("export and import restores state", async ({ page }) => {
  await resetLocalData(page);
  await waitForWorkspace(page);
  await page.getByTestId("timeframe-selector").selectOption("M1");
  await placeLongTrade(page, "1.08600", "1.08800");

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-button").click();
  const download = await downloadPromise;
  const exportPath = await download.path();
  expect(exportPath).toBeTruthy();

  await page.getByTestId("reset-button").click();
  await expect(page.getByTestId("trade-log-count")).toHaveText("0");

  await page.getByTestId("import-input").setInputFiles(exportPath!);
  await expect(page.getByTestId("trade-log-count")).toHaveText("1", {
    timeout: 10_000,
  });
});
