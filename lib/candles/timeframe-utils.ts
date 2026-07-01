import {
  TIMEFRAME_MS,
  type Timeframe,
} from "@/lib/candles/candle-types";

export function alignTimestampToTimeframe(
  timestamp: number,
  timeframe: Timeframe,
): number {
  const bucketMs = TIMEFRAME_MS[timeframe];
  return Math.floor(timestamp / bucketMs) * bucketMs;
}

export function getTimeframeRank(timeframe: Timeframe): number {
  const order: Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];
  return order.indexOf(timeframe);
}

export function canAggregateToTimeframe(
  source: Timeframe,
  target: Timeframe,
): boolean {
  if (getTimeframeRank(target) < getTimeframeRank(source)) {
    return false;
  }

  return TIMEFRAME_MS[target] % TIMEFRAME_MS[source] === 0;
}
