import {
  createCandleId,
  TIMEFRAME_MS,
  type Candle,
  type Timeframe,
} from "@/lib/candles/candle-types";
import { isValidCandle, sortCandles } from "@/lib/candles/candle-normalizer";
import {
  alignTimestampToTimeframe,
  canAggregateToTimeframe,
} from "@/lib/candles/timeframe-utils";

export class CandleAggregationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandleAggregationError";
  }
}

function belongsToBucket(
  candle: Candle,
  bucketStart: number,
  targetTimeframe: Timeframe,
): boolean {
  const bucketEnd = bucketStart + TIMEFRAME_MS[targetTimeframe] - 1;
  return (
    candle.timestamp >= bucketStart &&
    candle.timestamp <= bucketEnd &&
    alignTimestampToTimeframe(candle.timestamp, targetTimeframe) ===
      bucketStart
  );
}

function aggregateBucket(
  candles: Candle[],
  symbol: string,
  targetTimeframe: Timeframe,
  bucketStart: number,
): Candle {
  const sorted = sortCandles(candles);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  const aggregated: Candle = {
    id: createCandleId(symbol, targetTimeframe, bucketStart),
    symbol,
    timeframe: targetTimeframe,
    timestamp: bucketStart,
    open: first.open,
    high: Math.max(...sorted.map((c) => c.high)),
    low: Math.min(...sorted.map((c) => c.low)),
    close: last.close,
  };

  const hasVolume = sorted.some((c) => c.volume !== undefined);
  if (hasVolume) {
    aggregated.volume = sorted.reduce((sum, c) => sum + (c.volume ?? 0), 0);
  }

  return aggregated;
}

export function aggregateCandles(
  candles: Candle[],
  targetTimeframe: Timeframe,
): Candle[] {
  if (candles.length === 0) {
    return [];
  }

  const sourceTimeframe = candles[0]!.timeframe;

  if (!canAggregateToTimeframe(sourceTimeframe, targetTimeframe)) {
    throw new CandleAggregationError(
      `Cannot aggregate from ${sourceTimeframe} to ${targetTimeframe}`,
    );
  }

  const symbol = candles[0]!.symbol;
  const validCandles = sortCandles(candles.filter(isValidCandle));

  if (validCandles.length === 0) {
    return [];
  }

  if (sourceTimeframe === targetTimeframe) {
    return validCandles;
  }

  const buckets = new Map<number, Candle[]>();

  for (const candle of validCandles) {
    if (candle.symbol !== symbol) {
      continue;
    }

    const bucketStart = alignTimestampToTimeframe(
      candle.timestamp,
      targetTimeframe,
    );

    if (!belongsToBucket(candle, bucketStart, targetTimeframe)) {
      continue;
    }

    const bucket = buckets.get(bucketStart) ?? [];
    bucket.push(candle);
    buckets.set(bucketStart, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bucketStart, bucketCandles]) =>
      aggregateBucket(bucketCandles, symbol, targetTimeframe, bucketStart),
    );
}
