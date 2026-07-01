"use client";

import { calculateStats } from "@/lib/stats/stats-engine";
import { useJournalStore } from "@/store/journal-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTradeStore } from "@/store/trade-store";

export function StatsCards() {
  const trades = useTradeStore((state) => state.trades);
  const journals = useJournalStore((state) => state.journals);
  const startingBalance = useSettingsStore(
    (state) => state.challenge.startingBalance,
  );
  const stats = calculateStats(trades, journals, startingBalance);

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="stats-cards"
    >
      <StatCard label="Total trades" value={String(stats.totalTrades)} testId="stat-total-trades" />
      <StatCard
        label="Win rate"
        value={`${(stats.winRate * 100).toFixed(1)}%`}
        testId="stat-win-rate"
      />
      <StatCard
        label="Average R"
        value={stats.averageR.toFixed(2)}
        testId="stat-average-r"
      />
      <StatCard
        label="Expectancy"
        value={stats.expectancy.toFixed(2)}
        testId="stat-expectancy"
      />
      <StatCard
        label="Max drawdown"
        value={stats.maxDrawdown.toFixed(2)}
        testId="stat-max-drawdown"
      />
      <StatCard
        label="Profit factor"
        value={
          Number.isFinite(stats.profitFactor)
            ? stats.profitFactor.toFixed(2)
            : "∞"
        }
        testId="stat-profit-factor"
      />
      <StatCard
        label="Followed rules"
        value={String(stats.ruleFollowedCount)}
        testId="stat-rule-followed"
      />
      <StatCard
        label="Broke rules"
        value={String(stats.ruleBrokenCount)}
        testId="stat-rule-broken"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="border-2 border-border p-4" data-testid={testId}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-bold">{value}</p>
    </div>
  );
}
