export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1";

export type Candle = {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export const TIMEFRAMES: Timeframe[] = [
  "M1",
  "M5",
  "M15",
  "M30",
  "H1",
  "H4",
  "D1",
];

export const TIMEFRAME_MS: Record<Timeframe, number> = {
  M1: 60_000,
  M5: 5 * 60_000,
  M15: 15 * 60_000,
  M30: 30 * 60_000,
  H1: 60 * 60_000,
  H4: 4 * 60 * 60_000,
  D1: 24 * 60 * 60_000,
};

export const SAMPLE_SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "XAUUSD",
  "FIXTP",
  "FIXSL",
  "FIXDD",
] as const;

export type SampleSymbol = (typeof SAMPLE_SYMBOLS)[number];

export function createCandleId(
  symbol: string,
  timeframe: Timeframe,
  timestamp: number,
): string {
  return `${symbol}-${timeframe}-${timestamp}`;
}
