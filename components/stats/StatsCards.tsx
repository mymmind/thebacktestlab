"use client";

import { calculateStats } from "@/lib/stats/stats-engine";
import { useJournalStore } from "@/store/journal-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTradeStore } from "@/store/trade-store";
import { cn } from "@/lib/utils";

export function StatsCards() {
  const trades = useTradeStore((state) => state.trades);
  const journals = useJournalStore((state) => state.journals);
  const startingBalance = useSettingsStore(
    (state) => state.challenge.startingBalance,
  );
  const stats = calculateStats(trades, journals, startingBalance);

  return (
    <div className="space-y-6" data-testid="stats-cards">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total trades"
          value={String(stats.totalTrades)}
          testId="stat-total-trades"
        />
        <StatCard
          label="Win rate"
          value={`${(stats.winRate * 100).toFixed(1)}%`}
          testId="stat-win-rate"
          highlight={stats.winRate >= 0.5 ? "success" : undefined}
        />
        <StatCard
          label="Average R"
          value={stats.averageR.toFixed(2)}
          testId="stat-average-r"
          highlight={stats.averageR >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Expectancy"
          value={stats.expectancy.toFixed(2)}
          testId="stat-expectancy"
          highlight={stats.expectancy >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="panel-frame overflow-hidden">
        <div className="panel-header">
          <span className="panel-header-title text-foreground">
            Performance Ledger
          </span>
        </div>
        <div className="divide-y divide-border">
          <StatRow
            label="Max drawdown"
            value={stats.maxDrawdown.toFixed(2)}
            testId="stat-max-drawdown"
          />
          <StatRow
            label="Profit factor"
            value={
              Number.isFinite(stats.profitFactor)
                ? stats.profitFactor.toFixed(2)
                : "∞"
            }
            testId="stat-profit-factor"
          />
          <StatRow
            label="Followed rules"
            value={String(stats.ruleFollowedCount)}
            testId="stat-rule-followed"
          />
          <StatRow
            label="Broke rules"
            value={String(stats.ruleBrokenCount)}
            testId="stat-rule-broken"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  testId,
  highlight,
}: {
  label: string;
  value: string;
  testId: string;
  highlight?: "success" | "danger";
}) {
  return (
    <div
      className="panel-frame bg-card p-4 transition-colors hover:bg-surface-elevated"
      data-testid={testId}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-3xl font-semibold tracking-tight",
          highlight === "success" && "text-success",
          highlight === "danger" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatRow({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 font-mono text-sm"
      data-testid={testId}
    >
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
