import { describe, expect, it } from "vitest";

import {
  aggregateCandles,
  CandleAggregationError,
} from "@/lib/candles/candle-aggregation";
import { loadFixtureFromDisk } from "@/lib/candles/candle-fixtures";
import {
  CandleParseError,
  normalizeCandlesFromCsv,
  parseCsvRows,
  sortCandles,
} from "@/lib/candles/candle-normalizer";
import type { Candle } from "@/lib/candles/candle-types";
import { alignTimestampToTimeframe } from "@/lib/candles/timeframe-utils";
import { candleRowSchema } from "@/lib/validation/schemas";

const BASE_ROW = {
  timestamp: "2024-01-15T10:00:00.000Z",
  open: "1.0",
  high: "1.1",
  low: "0.9",
  close: "1.05",
  volume: "10",
};

describe("candle parsing", () => {
  it("parses CSV rows with header", () => {
    const csv = `timestamp,open,high,low,close,volume
2024-01-15T10:00:00.000Z,1.0,1.1,0.9,1.05,10`;

    const rows = parseCsvRows(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject(BASE_ROW);
  });

  it("rejects CSV without data rows", () => {
    expect(() => parseCsvRows("timestamp,open,high,low,close")).toThrow(
      CandleParseError,
    );
  });

  it("rejects rows with column count mismatch", () => {
    const csv = `timestamp,open,high,low,close,volume
2024-01-15T10:00:00.000Z,1.0,1.1,0.9`;

    expect(() => parseCsvRows(csv)).toThrow(CandleParseError);
  });
});

describe("candle validation", () => {
  it("accepts valid OHLC rows", () => {
    const result = candleRowSchema.safeParse(BASE_ROW);
    expect(result.success).toBe(true);
  });

  it("rejects high below low", () => {
    const result = candleRowSchema.safeParse({
      ...BASE_ROW,
      high: "0.8",
      low: "0.9",
    });
    expect(result.success).toBe(false);
  });

  it("rejects open outside high/low range", () => {
    const result = candleRowSchema.safeParse({
      ...BASE_ROW,
      open: "2.0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed CSV during normalization", () => {
    const csv = `timestamp,open,high,low,close,volume
2024-01-15T10:00:00.000Z,1.0,0.8,0.9,1.05,10`;

    expect(() => normalizeCandlesFromCsv(csv, "EURUSD", "M1")).toThrow(
      CandleParseError,
    );
  });
});

describe("candle sorting", () => {
  it("sorts candles by timestamp ascending", () => {
    const candles: Candle[] = [
      {
        id: "b",
        symbol: "EURUSD",
        timeframe: "M1",
        timestamp: 200,
        open: 1,
        high: 1,
        low: 1,
        close: 1,
      },
      {
        id: "a",
        symbol: "EURUSD",
        timeframe: "M1",
        timestamp: 100,
        open: 1,
        high: 1,
        low: 1,
        close: 1,
      },
    ];

    const sorted = sortCandles(candles);
    expect(sorted.map((c) => c.timestamp)).toEqual([100, 200]);
  });

  it("normalizes unordered CSV input", () => {
    const csv = `timestamp,open,high,low,close,volume
2024-01-15T10:02:00.000Z,1.10,1.20,1.05,1.15,30
2024-01-15T10:00:00.000Z,1.0,1.1,0.9,1.05,10
2024-01-15T10:01:00.000Z,1.05,1.15,1.0,1.10,20`;

    const candles = normalizeCandlesFromCsv(csv, "EURUSD", "M1");
    expect(candles.map((c) => c.timestamp)).toEqual([
      Date.parse("2024-01-15T10:00:00.000Z"),
      Date.parse("2024-01-15T10:01:00.000Z"),
      Date.parse("2024-01-15T10:02:00.000Z"),
    ]);
  });
});

describe("candle aggregation", () => {
  const m1Candles = loadFixtureFromDisk("aggregationM5", "EURUSD", "M1");

  it("aggregates M1 to M5 with OHLCV rules", () => {
    const firstBucket = m1Candles.filter(
      (c) =>
        alignTimestampToTimeframe(c.timestamp, "M5") ===
        Date.parse("2024-01-15T10:00:00.000Z"),
    );

    const aggregated = aggregateCandles(firstBucket, "M5");

    expect(aggregated).toHaveLength(1);
    expect(aggregated[0]).toMatchObject({
      symbol: "EURUSD",
      timeframe: "M5",
      timestamp: Date.parse("2024-01-15T10:00:00.000Z"),
      open: 1.0,
      high: 1.03,
      low: 0.99,
      close: 1.025,
      volume: 150,
    });
  });

  it("aggregates full fixture M1 to M5", () => {
    const aggregated = aggregateCandles(m1Candles, "M5");
    expect(aggregated).toHaveLength(2);
    expect(aggregated[0]!.timestamp).toBe(
      Date.parse("2024-01-15T10:00:00.000Z"),
    );
    expect(aggregated[1]!.timestamp).toBe(
      Date.parse("2024-01-15T10:05:00.000Z"),
    );
  });

  it("aggregates M1 to M15", () => {
    const trendUp = loadFixtureFromDisk("trendUp", "EURUSD", "M1");
    const aggregated = aggregateCandles(trendUp, "M15");

    expect(aggregated).toHaveLength(1);
    expect(aggregated[0]).toMatchObject({
      open: 1.1,
      close: 1.105,
      high: 1.1055,
      low: 1.099,
    });
  });

  it("aggregates M1 to H1", () => {
    const aggregated = aggregateCandles(m1Candles, "H1");
    expect(aggregated).toHaveLength(1);
    expect(aggregated[0]!.open).toBe(1.0);
    expect(aggregated[0]!.close).toBe(1.03);
  });

  it("handles missing candles within a bucket", () => {
    const csv = `timestamp,open,high,low,close,volume
2024-01-15T10:00:00.000Z,1.0,1.1,0.9,1.05,10
2024-01-15T10:02:00.000Z,1.10,1.20,1.05,1.15,30
2024-01-15T10:04:00.000Z,1.20,1.30,1.15,1.25,50`;

    const candles = normalizeCandlesFromCsv(csv, "EURUSD", "M1");
    const aggregated = aggregateCandles(candles, "M5");

    expect(aggregated).toHaveLength(1);
    expect(aggregated[0]).toMatchObject({
      open: 1.0,
      close: 1.25,
      volume: 90,
    });
  });

  it("sorts unordered input before aggregating", () => {
    const shuffled = [...m1Candles].reverse();
    const aggregated = aggregateCandles(shuffled, "M5");
    expect(aggregated[0]!.open).toBe(1.0);
    expect(aggregated[0]!.close).toBe(1.025);
  });

  it("skips invalid candles during aggregation", () => {
    const invalid: Candle = {
      id: "bad",
      symbol: "EURUSD",
      timeframe: "M1",
      timestamp: Date.parse("2024-01-15T10:01:00.000Z"),
      open: 5,
      high: 1,
      low: 2,
      close: 3,
    };

    const aggregated = aggregateCandles([...m1Candles, invalid], "M5");
    expect(aggregated[0]!.volume).toBe(150);
  });

  it("returns empty array for empty input", () => {
    expect(aggregateCandles([], "M5")).toEqual([]);
  });

  it("throws when target timeframe is smaller than source", () => {
    const m5Candle: Candle = {
      id: "m5",
      symbol: "EURUSD",
      timeframe: "M5",
      timestamp: Date.parse("2024-01-15T10:00:00.000Z"),
      open: 1,
      high: 1.1,
      low: 0.9,
      close: 1.05,
    };

    expect(() => aggregateCandles([m5Candle], "M1")).toThrow(
      CandleAggregationError,
    );
  });
});

describe("fixture catalog", () => {
  it("loads all required scenario fixtures", () => {
    const names = [
      "trendUp",
      "trendDown",
      "longTpHit",
      "longSlHit",
      "shortTpHit",
      "shortSlHit",
      "sameCandleSlTp",
      "challengeDrawdownFail",
    ] as const;

    for (const name of names) {
      const candles = loadFixtureFromDisk(name);
      expect(candles.length).toBeGreaterThan(0);
    }
  });
});
