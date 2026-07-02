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
      <div className="data-readout">
        <span className="text-muted-foreground">Loading candle stream…</span>
      </div>
    );
  }

  if (error || !currentCandle) {
    return (
      <div className="data-readout">
        <span className="text-destructive" data-testid="candle-load-error">
          {error ?? "No candle data"}
        </span>
      </div>
    );
  }

  return (
    <div className="data-readout">
      <Readout label="Timestamp" testId="current-candle-timestamp">
        {formatCandleTimestamp(currentCandle.timestamp)}
      </Readout>
      <Readout label="Close" testId="current-candle-close">
        {formatCandlePrice(symbol, currentCandle.close)}
      </Readout>
      <Readout label="Visible" testId="visible-candle-count">
        {visibleCandleCount}
      </Readout>
      <Readout label="Loaded" testId="loaded-candle-count">
        {candles.length}
      </Readout>
      <Readout label="Open trade" testId="open-trade-status">
        <span className="uppercase">
          {openTrade ? `${openTrade.direction} open` : "none"}
        </span>
      </Readout>
    </div>
  );
}

function Readout({
  label,
  testId,
  children,
}: {
  label: string;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <span className="data-readout-item">
      <span className="data-readout-label">{label}</span>
      <span data-testid={testId}>{children}</span>
    </span>
  );
}
