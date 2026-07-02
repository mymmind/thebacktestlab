"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  SAMPLE_SYMBOLS,
  TIMEFRAMES,
  useCandleContext,
} from "@/components/app-shell/CandleProvider";
import type { SampleSymbol, Timeframe } from "@/lib/candles/candle-types";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";

const DEFAULT_DATE = "2024-01-15";

type TopStatusBarProps = {
  compact?: boolean;
};

export function TopStatusBar({ compact = false }: TopStatusBarProps) {
  const { symbol, timeframe, setSymbol, setTimeframe, isLoading } =
    useCandleContext();
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const challenge = useSettingsStore((state) => state.challenge);

  const challengeVariant =
    challenge.status === "failed"
      ? "danger"
      : challenge.status === "passed"
        ? "success"
        : "outline";

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur-sm lg:gap-4 lg:px-4",
        compact ? "h-11" : "h-12",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-sm font-bold uppercase tracking-[0.15em] text-foreground lg:text-base">
          Backtesting Lab
        </h1>
        {!compact ? (
          <span className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            Replay Cockpit
          </span>
        ) : null}
      </div>

      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:gap-3">
        <HudChip label="Symbol">
          <select
            aria-label="Symbol"
            className="terminal-select border-0 bg-transparent p-0"
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
        </HudChip>

        <HudChip label="TF">
          <select
            aria-label="Timeframe"
            className="terminal-select border-0 bg-transparent p-0"
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
        </HudChip>

        <HudChip label="Date" value={DEFAULT_DATE} className="hidden md:inline-flex" />

        <HudChip label="Balance">
          <span className="hud-chip-value" data-testid="account-balance">
            {accountBalance.toFixed(2)}
          </span>
        </HudChip>

        <HudChip label="Challenge">
          <Badge variant={challengeVariant} data-testid="challenge-status">
            {challenge.status}
          </Badge>
        </HudChip>
      </div>
    </header>
  );
}

function HudChip({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("hud-chip", className)}>
      <span className="hud-chip-label">{label}</span>
      {value ? <span className="hud-chip-value font-mono">{value}</span> : children}
    </span>
  );
}
