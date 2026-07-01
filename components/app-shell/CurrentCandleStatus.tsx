"use client";

import {
  formatCandlePrice,
  formatCandleTimestamp,
  useCandleContext,
} from "@/components/app-shell/CandleProvider";
import { useOpenTrade } from "@/store/trade-store";

export function CurrentCandleStatus() {
  const {
    currentCandle,
    candles,
    visibleCandleCount,
    isLoading,
    error,
    symbol,
  } = useCandleContext();
  const openTrade = useOpenTrade();

  if (isLoading) {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-border bg-card/80 px-4 py-2 text-xs">
        <span className="text-muted-foreground">Loading candles…</span>
      </div>
    );
  }

  if (error || !currentCandle) {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-border bg-card/80 px-4 py-2 text-xs">
        <span className="text-destructive" data-testid="candle-load-error">
          {error ?? "No candle data"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-border bg-card/80 px-4 py-2 text-xs">
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Timestamp</span>
        <span className="font-mono" data-testid="current-candle-timestamp">
          {formatCandleTimestamp(currentCandle.timestamp)}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Close</span>
        <span className="font-mono" data-testid="current-candle-close">
          {formatCandlePrice(symbol, currentCandle.close)}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Visible</span>
        <span className="font-mono" data-testid="visible-candle-count">
          {visibleCandleCount}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Loaded</span>
        <span className="font-mono" data-testid="loaded-candle-count">
          {candles.length}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Open trade</span>
        <span className="font-mono uppercase" data-testid="open-trade-status">
          {openTrade ? `${openTrade.direction} open` : "none"}
        </span>
      </span>
    </div>
  );
}
