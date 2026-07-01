"use client";

import { Separator } from "@/components/ui/separator";
import {
  SAMPLE_SYMBOLS,
  TIMEFRAMES,
  useCandleContext,
} from "@/components/app-shell/CandleProvider";
import type { SampleSymbol, Timeframe } from "@/lib/candles/candle-types";
import { useSettingsStore } from "@/store/settings-store";

const DEFAULT_DATE = "2024-01-15";

export function TopStatusBar() {
  const { symbol, timeframe, setSymbol, setTimeframe, isLoading } =
    useCandleContext();
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const challenge = useSettingsStore((state) => state.challenge);

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b-2 border-border bg-card px-4">
      <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
        Backtesting Lab
      </h1>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Symbol</span>
          <select
            aria-label="Symbol"
            className="rounded border border-border bg-background px-2 py-0.5 font-mono font-semibold"
            data-testid="symbol-selector"
            disabled={isLoading}
            value={symbol}
            onChange={(event) => setSymbol(event.target.value as SampleSymbol)}
          >
            {SAMPLE_SYMBOLS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="sr-only" data-testid="selected-symbol">
            {symbol}
          </span>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">TF</span>
          <select
            aria-label="Timeframe"
            className="rounded border border-border bg-background px-2 py-0.5 font-mono font-semibold"
            data-testid="timeframe-selector"
            disabled={isLoading}
            value={timeframe}
            onChange={(event) => setTimeframe(event.target.value as Timeframe)}
          >
            {TIMEFRAMES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="sr-only" data-testid="selected-timeframe">
            {timeframe}
          </span>
        </label>
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Date</span>
          <span className="font-mono">{DEFAULT_DATE}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Balance</span>
          <span className="font-mono" data-testid="account-balance">
            {accountBalance.toFixed(2)}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Challenge</span>
          <span
            className="font-mono uppercase"
            data-testid="challenge-status"
          >
            {challenge.status}
          </span>
        </span>
      </div>
    </header>
  );
}
