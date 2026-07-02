import { describe, expect, it } from "vitest";

import type { Candle } from "@/lib/candles/candle-types";
import {
  candleTimestampToChartTime,
  toChartCandle,
  toChartCandles,
} from "@/lib/chart/chart-utils";

function makeCandle(timestamp: number): Candle {
  return {
    id: `EURUSD-M15-${timestamp}`,
    symbol: "EURUSD",
    timeframe: "M15",
    timestamp,
    open: 1.1,
    high: 1.2,
    low: 1.0,
    close: 1.15,
  };
}

describe("chart utils", () => {
  it("converts candle timestamps to chart seconds", () => {
    expect(candleTimestampToChartTime(1_700_000_000_000)).toBe(1_700_000_000);
  });

  it("maps candles to lightweight-charts data", () => {
    const candle = makeCandle(1_700_000_000_000);
    expect(toChartCandle(candle)).toEqual({
      time: 1_700_000_000,
      open: 1.1,
      high: 1.2,
      low: 1.0,
      close: 1.15,
    });
  });

  it("highlights only the last visible candle", () => {
    const candles = [makeCandle(1), makeCandle(2), makeCandle(3)];
    const chartData = toChartCandles(candles);

    expect(chartData[0]).not.toHaveProperty("color");
    expect(chartData[1]).not.toHaveProperty("color");
    expect(chartData[2]).toMatchObject({
      color: "#e5e5e5",
      borderColor: "#e5e5e5",
      wickColor: "#e5e5e5",
    });
  });
});
