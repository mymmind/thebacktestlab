import { describe, expect, it } from "vitest";

import {
  createPropFirmChallenge,
  evaluateChallenge,
} from "@/lib/trades/prop-firm-engine";
import type { Trade } from "@/lib/trades/trade-types";

describe("prop-firm-engine", () => {
  it("fails when balance breaches max overall drawdown", () => {
    const challenge = createPropFirmChallenge();
    const evaluation = evaluateChallenge(challenge, 179_000);
    expect(evaluation.challenge.status).toBe("failed");
    expect(evaluation.challenge.failureReason).toContain("drawdown");
  });

  it("passes when profit target reached", () => {
    const challenge = createPropFirmChallenge();
    const evaluation = evaluateChallenge(challenge, 220_500);
    expect(evaluation.challenge.status).toBe("passed");
  });

  it("tracks daily loss from closed trades", () => {
    const challenge = createPropFirmChallenge();
    const trade: Trade = {
      id: "t1",
      replaySessionId: "s1",
      symbol: "EURUSD",
      direction: "long",
      status: "closed",
      entryTimestamp: Date.now(),
      entryPrice: 1.1,
      stopLossPrice: 1.099,
      accountBalanceAtEntry: 200_000,
      riskPercent: 0.0025,
      riskAmount: 500,
      resultR: -1,
      resultAmount: -500,
      exitTimestamp: Date.now(),
      exitPrice: 1.099,
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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const evaluation = evaluateChallenge(challenge, 199_500, [trade]);
    expect(evaluation.dailyLossUsed).toBe(500);
  });
});
