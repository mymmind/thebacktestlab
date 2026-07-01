import type { Candle } from "@/lib/candles/candle-types";

type TradeResolutionHandler = (candle: Candle) => void;

let handler: TradeResolutionHandler | null = null;

export function registerTradeResolution(next: TradeResolutionHandler): void {
  handler = next;
}

export function resolveTradesForCandle(candle: Candle): void {
  handler?.(candle);
}
