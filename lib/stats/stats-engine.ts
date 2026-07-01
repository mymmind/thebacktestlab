import type { Trade } from "@/lib/trades/trade-types";
import type { TradeJournal } from "@/lib/journal/journal-types";

export type StatsSummary = {
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  averageR: number;
  expectancy: number;
  maxDrawdown: number;
  profitFactor: number;
  ruleFollowedCount: number;
  ruleBrokenCount: number;
  bySymbol: Record<string, { count: number; averageR: number }>;
};

export type BalancePoint = {
  timestamp: number;
  balance: number;
};

function isWin(trade: Trade): boolean {
  return (trade.resultR ?? 0) > 0;
}

function isLoss(trade: Trade): boolean {
  return (trade.resultR ?? 0) < 0;
}

export function calculateStats(
  trades: Trade[],
  journals: TradeJournal[],
  startingBalance: number,
): StatsSummary {
  const closedTrades = trades.filter((trade) => trade.status === "closed");
  const openTrades = trades.filter((trade) => trade.status === "open");

  if (closedTrades.length === 0) {
    return {
      totalTrades: trades.length,
      closedTrades: 0,
      openTrades: openTrades.length,
      wins: 0,
      losses: 0,
      breakeven: 0,
      winRate: 0,
      averageR: 0,
      expectancy: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      ruleFollowedCount: 0,
      ruleBrokenCount: 0,
      bySymbol: {},
    };
  }

  const wins = closedTrades.filter(isWin);
  const losses = closedTrades.filter(isLoss);
  const breakeven = closedTrades.filter(
    (trade) => (trade.resultR ?? 0) === 0,
  );

  const resultRs = closedTrades.map((trade) => trade.resultR ?? 0);
  const averageR =
    resultRs.reduce((sum, value) => sum + value, 0) / closedTrades.length;

  const winRate = wins.length / closedTrades.length;
  const avgWin =
    wins.length > 0
      ? wins.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0) /
        wins.length
      : 0;
  const avgLoss =
    losses.length > 0
      ? losses.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0) /
        losses.length
      : 0;
  const expectancy =
    winRate * avgWin + (1 - winRate) * avgLoss;

  const grossProfit = closedTrades
    .filter((trade) => (trade.resultAmount ?? 0) > 0)
    .reduce((sum, trade) => sum + (trade.resultAmount ?? 0), 0);
  const grossLoss = Math.abs(
    closedTrades
      .filter((trade) => (trade.resultAmount ?? 0) < 0)
      .reduce((sum, trade) => sum + (trade.resultAmount ?? 0), 0),
  );
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const balanceSeries = buildBalanceSeries(closedTrades, startingBalance);
  const maxDrawdown = calculateMaxDrawdown(balanceSeries);

  const journalByTradeId = new Map(
    journals.map((journal) => [journal.tradeId, journal]),
  );
  let ruleFollowedCount = 0;
  let ruleBrokenCount = 0;

  for (const trade of closedTrades) {
    const journal = journalByTradeId.get(trade.id);
    if (!journal) {
      continue;
    }

    if (journal.followedRules) {
      ruleFollowedCount += 1;
    } else {
      ruleBrokenCount += 1;
    }
  }

  const bySymbol: StatsSummary["bySymbol"] = {};
  for (const trade of closedTrades) {
    const bucket = bySymbol[trade.symbol] ?? { count: 0, averageR: 0 };
    bucket.count += 1;
    bucket.averageR += trade.resultR ?? 0;
    bySymbol[trade.symbol] = bucket;
  }

  for (const symbol of Object.keys(bySymbol)) {
    const bucket = bySymbol[symbol]!;
    bucket.averageR = bucket.averageR / bucket.count;
  }

  return {
    totalTrades: trades.length,
    closedTrades: closedTrades.length,
    openTrades: openTrades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    winRate,
    averageR,
    expectancy,
    maxDrawdown,
    profitFactor,
    ruleFollowedCount,
    ruleBrokenCount,
    bySymbol,
  };
}

export function buildBalanceSeries(
  closedTrades: Trade[],
  startingBalance: number,
): BalancePoint[] {
  const sorted = [...closedTrades].sort(
    (left, right) =>
      (left.exitTimestamp ?? 0) - (right.exitTimestamp ?? 0),
  );

  let balance = startingBalance;
  const series: BalancePoint[] = [{ timestamp: 0, balance }];

  for (const trade of sorted) {
    balance += trade.resultAmount ?? 0;
    series.push({
      timestamp: trade.exitTimestamp ?? Date.now(),
      balance,
    });
  }

  return series;
}

export function calculateMaxDrawdown(series: BalancePoint[]): number {
  if (series.length === 0) {
    return 0;
  }

  let peak = series[0]!.balance;
  let maxDrawdown = 0;

  for (const point of series) {
    peak = Math.max(peak, point.balance);
    maxDrawdown = Math.max(maxDrawdown, peak - point.balance);
  }

  return maxDrawdown;
}
