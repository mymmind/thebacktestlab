"use client";

import { useEffect, type ReactNode } from "react";

import { SAMPLE_SYMBOLS, TIMEFRAMES } from "@/lib/candles/candle-types";
import { useReplayStore, useReplaySelectors } from "@/store/replay-store";

export function CandleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useReplayStore.getState().loadSymbol("EURUSD");

    return () => {
      useReplayStore.getState().stopPlayback();
    };
  }, []);

  return <>{children}</>;
}

export function useCandleContext() {
  const selectors = useReplaySelectors();
  const setSymbol = useReplayStore((state) => state.setSymbol);
  const setTimeframe = useReplayStore((state) => state.setActiveTimeframe);

  return {
    symbol: selectors.symbol,
    timeframe: selectors.timeframe,
    m1Candles: selectors.m1Candles,
    candles: selectors.candles,
    currentCandle: selectors.currentCandle,
    cursorIndex: selectors.cursorIndex,
    visibleCandleCount: selectors.visibleCandleCount,
    visibleCandles: selectors.visibleCandles,
    status: selectors.status,
    speed: selectors.speed,
    isLoading: selectors.isLoading,
    error: selectors.error,
    isComplete: selectors.isComplete,
    setSymbol,
    setTimeframe,
    stepForward: useReplayStore((state) => state.stepForward),
    stepBackward: useReplayStore((state) => state.stepBackward),
    togglePlayPause: useReplayStore((state) => state.togglePlayPause),
    playReplay: useReplayStore((state) => state.playReplay),
    pauseReplay: useReplayStore((state) => state.pauseReplay),
    setReplaySpeed: useReplayStore((state) => state.setReplaySpeed),
  };
}

export function formatCandleTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function formatCandlePrice(
  symbol: (typeof SAMPLE_SYMBOLS)[number],
  price: number,
): string {
  return price.toFixed(symbol === "XAUUSD" ? 2 : 5);
}

export { SAMPLE_SYMBOLS, TIMEFRAMES };
