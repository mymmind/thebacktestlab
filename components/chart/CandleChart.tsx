"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type Time,
} from "lightweight-charts";

import { useCandleContext } from "@/components/app-shell/CandleProvider";
import {
  candleTimestampToChartTime,
  getCandlestickSeriesOptions,
  getChartTheme,
  toChartCandles,
  CURRENT_CANDLE_COLOR,
} from "@/lib/chart/chart-utils";

export function CandleChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const {
    visibleCandles,
    currentCandle,
    isLoading,
    error,
    timeframe,
    symbol,
  } = useCandleContext();

  const shouldFitContentRef = useRef(true);
  const chartReady =
    !isLoading && !error && visibleCandles.length > 0;

  useEffect(() => {
    shouldFitContentRef.current = true;
  }, [timeframe, symbol]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const chart = createChart(container, getChartTheme());
    const series = chart.addSeries(CandlestickSeries, getCandlestickSeriesOptions());
    const markers = createSeriesMarkers(series, []);

    chartRef.current = chart;
    seriesRef.current = series;
    markersRef.current = markers;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        chart.resize(Math.floor(width), Math.floor(height));
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      markers.detach();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const markers = markersRef.current;
    const chart = chartRef.current;

    if (!series || !markers || !chart) {
      return;
    }

    const data = toChartCandles(visibleCandles);
    series.setData(data);

    if (currentCandle) {
      markers.setMarkers([
        {
          time: candleTimestampToChartTime(currentCandle.timestamp),
          position: "aboveBar",
          color: CURRENT_CANDLE_COLOR,
          shape: "circle",
          text: "Replay",
        },
      ]);
    } else {
      markers.setMarkers([]);
    }

    if (data.length > 0 && shouldFitContentRef.current) {
      chart.timeScale().fitContent();
      shouldFitContentRef.current = false;
    }
  }, [visibleCandles, currentCandle]);

  return (
    <div
      className="relative min-h-0 min-w-0 flex-1 bg-background"
      data-testid="candle-chart"
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Loading chart…
        </div>
      ) : null}
      {!isLoading && error ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div ref={containerRef} className="absolute inset-0" />
      <span className="sr-only" data-testid="chart-candle-count">
        {visibleCandles.length}
      </span>
      <span className="sr-only" data-testid="chart-ready">
        {chartReady ? "ready" : "pending"}
      </span>
    </div>
  );
}
