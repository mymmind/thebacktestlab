import {
  createCandleId,
  type Candle,
  type Timeframe,
} from "@/lib/candles/candle-types";
import { candleRowSchema, candleSchema } from "@/lib/validation/schemas";

export class CandleParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandleParseError";
  }
}

function parseTimestamp(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new CandleParseError(`Invalid timestamp: ${value}`);
  }

  return parsed;
}

function parseCsvLine(line: string): string[] {
  return line.split(",").map((cell) => cell.trim());
}

export function parseCsvRows(csv: string): Record<string, string>[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 2) {
    throw new CandleParseError("CSV must include a header row and data rows");
  }

  const headers = parseCsvLine(lines[0]!);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);

    if (values.length !== headers.length) {
      throw new CandleParseError(
        `Row ${index + 2} has ${values.length} columns, expected ${headers.length}`,
      );
    }

    return Object.fromEntries(headers.map((header, i) => [header, values[i]!]));
  });
}

export function normalizeCandleRow(
  row: Record<string, string>,
  symbol: string,
  timeframe: Timeframe,
  rowIndex: number,
): Candle {
  const parsed = candleRowSchema.safeParse(row);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new CandleParseError(`Row ${rowIndex + 2} invalid: ${details}`);
  }

  const timestamp = parseTimestamp(parsed.data.timestamp);
  const candle: Candle = {
    id: createCandleId(symbol, timeframe, timestamp),
    symbol,
    timeframe,
    timestamp,
    open: parsed.data.open,
    high: parsed.data.high,
    low: parsed.data.low,
    close: parsed.data.close,
  };

  if (parsed.data.volume !== undefined) {
    candle.volume = parsed.data.volume;
  }

  const validated = candleSchema.safeParse(candle);
  if (!validated.success) {
    const details = validated.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new CandleParseError(`Row ${rowIndex + 2} invalid candle: ${details}`);
  }

  return validated.data;
}

export function normalizeCandlesFromCsv(
  csv: string,
  symbol: string,
  timeframe: Timeframe,
): Candle[] {
  const rows = parseCsvRows(csv);
  const candles = rows.map((row, index) =>
    normalizeCandleRow(row, symbol, timeframe, index),
  );

  return sortCandles(candles);
}

export function sortCandles(candles: Candle[]): Candle[] {
  return [...candles].sort((a, b) => a.timestamp - b.timestamp);
}

export function isValidCandle(candle: Candle): boolean {
  return candleSchema.safeParse(candle).success;
}
