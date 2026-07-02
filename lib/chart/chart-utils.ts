import type { Candle } from "@/lib/candles/candle-types";
import type {
  CandlestickData,
  ChartOptions,
  DeepPartial,
  UTCTimestamp,
} from "lightweight-charts";
import { ColorType } from "lightweight-charts";

const CURRENT_CANDLE_COLOR = "#fbbf24";

export function candleTimestampToChartTime(timestamp: number): UTCTimestamp {
  return (timestamp / 1000) as UTCTimestamp;
}

export function toChartCandle(
  candle: Candle,
  highlight = false,
): CandlestickData {
  const data: CandlestickData = {
    time: candleTimestampToChartTime(candle.timestamp),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };

  if (highlight) {
    data.color = CURRENT_CANDLE_COLOR;
    data.borderColor = CURRENT_CANDLE_COLOR;
    data.wickColor = CURRENT_CANDLE_COLOR;
  }

  return data;
}

export function toChartCandles(candles: Candle[]): CandlestickData[] {
  if (candles.length === 0) {
    return [];
  }

  const lastIndex = candles.length - 1;
  return candles.map((candle, index) =>
    toChartCandle(candle, index === lastIndex),
  );
}

export function getChartTheme(): DeepPartial<ChartOptions> {
  return {
    autoSize: true,
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: "#a3a3a3",
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    },
    grid: {
      vertLines: { color: "rgba(255, 255, 255, 0.06)" },
      horzLines: { color: "rgba(255, 255, 255, 0.06)" },
    },
    crosshair: {
      vertLine: {
        color: "rgba(255, 255, 255, 0.25)",
        labelBackgroundColor: "#262626",
      },
      horzLine: {
        color: "rgba(255, 255, 255, 0.25)",
        labelBackgroundColor: "#262626",
      },
    },
    rightPriceScale: {
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    timeScale: {
      borderColor: "rgba(255, 255, 255, 0.1)",
      timeVisible: true,
      secondsVisible: false,
    },
  };
}

export function getCandlestickSeriesOptions() {
  return {
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  };
}

export { CURRENT_CANDLE_COLOR };
