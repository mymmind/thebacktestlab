import fs from "node:fs";
import path from "node:path";

import { normalizeCandlesFromCsv } from "@/lib/candles/candle-normalizer";
import type { Candle, Timeframe } from "@/lib/candles/candle-types";

export const FIXTURE_FILES = {
  trendUp: "fixture_trend_up_m1.csv",
  trendDown: "fixture_trend_down_m1.csv",
  longTpHit: "fixture_long_tp_hit_m1.csv",
  longSlHit: "fixture_long_sl_hit_m1.csv",
  shortTpHit: "fixture_short_tp_hit_m1.csv",
  shortSlHit: "fixture_short_sl_hit_m1.csv",
  sameCandleSlTp: "fixture_same_candle_sl_tp_m1.csv",
  challengeDrawdownFail: "fixture_challenge_drawdown_fail_m1.csv",
  aggregationM5: "fixture_aggregation_m5_m1.csv",
} as const;

export type FixtureName = keyof typeof FIXTURE_FILES;

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures");

export function getFixturePath(name: FixtureName): string {
  return path.join(FIXTURES_DIR, FIXTURE_FILES[name]);
}

export function loadFixtureFromDisk(
  name: FixtureName,
  symbol = "TEST",
  timeframe: Timeframe = "M1",
): Candle[] {
  const filePath = getFixturePath(name);
  const csv = fs.readFileSync(filePath, "utf8");
  return normalizeCandlesFromCsv(csv, symbol, timeframe);
}

export function loadFixtureCsvFromDisk(name: FixtureName): string {
  return fs.readFileSync(getFixturePath(name), "utf8");
}
