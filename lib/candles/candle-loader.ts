import {
  normalizeCandlesFromCsv,
  type CandleParseError,
} from "@/lib/candles/candle-normalizer";
import {
  SAMPLE_SYMBOLS,
  type Candle,
  type SampleSymbol,
  type Timeframe,
} from "@/lib/candles/candle-types";

export function getSampleDataPath(symbol: SampleSymbol): string {
  return `/sample-data/${symbol}_M1_sample.csv`;
}

export async function loadCandlesFromUrl(
  url: string,
  symbol: string,
  timeframe: Timeframe = "M1",
): Promise<Candle[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load candles from ${url}: ${response.status}`);
  }

  const csv = await response.text();
  return normalizeCandlesFromCsv(csv, symbol, timeframe);
}

export async function loadSampleCandles(
  symbol: SampleSymbol,
  timeframe: Timeframe = "M1",
): Promise<Candle[]> {
  return loadCandlesFromUrl(getSampleDataPath(symbol), symbol, timeframe);
}

export function isSampleSymbol(value: string): value is SampleSymbol {
  return (SAMPLE_SYMBOLS as readonly string[]).includes(value);
}

export type { CandleParseError };
