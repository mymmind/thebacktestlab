import { describe, expect, it } from "vitest";

import { calculateStats } from "@/lib/stats/stats-engine";
import type { Trade } from "@/lib/trades/trade-types";

function makeClosedTrade(
  overrides: Partial<Trade> & Pick<Trade, "resultR" | "resultAmount"> & { id: string },
): Trade {
  return {
    replaySessionId: "session-1",
    symbol: "EURUSD",
    direction: "long",
    status: "closed",
    entryTimestamp: 1,
    entryPrice: 1.1,
    stopLossPrice: 1.099,
    exitTimestamp: 2,
    exitPrice: 1.101,
    accountBalanceAtEntry: 200_000,
    riskPercent: 0.0025,
    riskAmount: 500,
    setupTags: [],
    ruleChecklist: {
      hasBos: false,
      hasOrderBlock: false,
      retracedToValidZone: false,
      entryOnPlannedTimeframe: false,
      stopLossBeyondInvalidation: false,
      targetAtLogicalLiquidity: false,
      riskWithinLimit: false,
      noHighImpactNewsConflict: false,
      withinTradingSession: false,
      followedPlan: false,
    },
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}

describe("stats-engine", () => {
  it("returns zeroed stats for empty trades", () => {
    const stats = calculateStats([], [], 200_000);
    expect(stats.totalTrades).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.averageR).toBe(0);
  });

  it("calculates win rate and average R", () => {
    const trades = [
      makeClosedTrade({ id: "1", resultR: 2, resultAmount: 1000 }),
      makeClosedTrade({ id: "2", resultR: -1, resultAmount: -500 }),
    ];

    const stats = calculateStats(trades, [], 200_000);
    expect(stats.winRate).toBe(0.5);
    expect(stats.averageR).toBeCloseTo(0.5);
    expect(stats.profitFactor).toBeCloseTo(2);
  });

  it("handles divide-by-zero safely", () => {
    const stats = calculateStats(
      [makeClosedTrade({ id: "1", resultR: 0, resultAmount: 0 })],
      [],
      200_000,
    );
    expect(stats.profitFactor).toBe(0);
  });
});
