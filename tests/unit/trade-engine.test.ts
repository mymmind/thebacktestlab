import { describe, expect, it } from "vitest";

import { loadFixtureFromDisk } from "@/lib/candles/candle-fixtures";
import {
  calculatePotentialR,
  calculateRMultiple,
  calculateResultAmount,
} from "@/lib/trades/r-multiple";
import { calculateRisk } from "@/lib/trades/risk-engine";
import {
  closeTradeAtPrice,
  createTradeFromDraft,
  detectCandleExit,
  resolveOpenTradesOnCandle,
  validateTradePrices,
} from "@/lib/trades/trade-engine";
import { DEFAULT_ACCOUNT_BALANCE, DEFAULT_RISK_PERCENT } from "@/lib/trades/trade-types";

describe("r-multiple", () => {
  it("calculates long R-multiple", () => {
    expect(calculateRMultiple("long", 1.1, 1.099, 1.105)).toBeCloseTo(5);
  });

  it("calculates short R-multiple", () => {
    expect(calculateRMultiple("short", 1.1, 1.101, 1.095)).toBeCloseTo(5);
  });

  it("calculates potential R", () => {
    expect(calculatePotentialR("long", 1.1, 1.099, 1.104)).toBeCloseTo(4);
  });

  it("calculates result amount from R", () => {
    expect(calculateResultAmount(500, 2)).toBe(1000);
  });
});

describe("risk-engine", () => {
  it("calculates default risk amount", () => {
    const risk = calculateRisk({
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
      entryPrice: 1.1,
      stopLossPrice: 1.099,
      direction: "long",
    });

    expect(risk.riskAmount).toBe(500);
    expect(risk.riskDistance).toBeCloseTo(0.001);
    expect(risk.positionSizeApprox).toBeCloseTo(500_000);
  });
});

describe("trade-engine validation", () => {
  it("rejects long stop loss above entry", () => {
    const result = validateTradePrices("long", 1.1, 1.1005);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("invalid_stop_loss");
    }
  });

  it("rejects long take profit below entry", () => {
    const result = validateTradePrices("long", 1.1, 1.099, 1.0995);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("invalid_take_profit");
    }
  });

  it("rejects short stop loss below entry", () => {
    const result = validateTradePrices("short", 1.1, 1.099);
    expect(result.valid).toBe(false);
  });

  it("rejects short take profit above entry", () => {
    const result = validateTradePrices("short", 1.1, 1.101, 1.1005);
    expect(result.valid).toBe(false);
  });
});

describe("trade resolution", () => {
  it("closes long trade at TP", () => {
    const candles = loadFixtureFromDisk("longTpHit");
    const trade = createTradeFromDraft({
      draft: {
        direction: "long",
        entryPrice: 1.1,
        stopLossPrice: "1.09900",
        takeProfitPrice: "1.10500",
      },
      replaySessionId: "session-1",
      symbol: "TEST",
      entryTimestamp: candles[0]!.timestamp,
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
    });

    let current = trade;
    for (const candle of candles.slice(1)) {
      const resolved = resolveOpenTradesOnCandle([current], candle);
      current = resolved.trades[0]!;
      if (resolved.closedTrades.length > 0) {
        expect(resolved.closedTrades[0]!.exitReason).toBe("tp");
        expect(resolved.closedTrades[0]!.resultR).toBeCloseTo(5);
        return;
      }
    }

    throw new Error("Trade did not close at TP");
  });

  it("closes long trade at SL with -1R", () => {
    const candles = loadFixtureFromDisk("longSlHit");
    const trade = createTradeFromDraft({
      draft: {
        direction: "long",
        entryPrice: 1.1,
        stopLossPrice: "1.09900",
        takeProfitPrice: "1.10500",
      },
      replaySessionId: "session-1",
      symbol: "TEST",
      entryTimestamp: candles[0]!.timestamp,
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
    });

    for (const candle of candles.slice(1)) {
      const resolved = resolveOpenTradesOnCandle([trade], candle);
      if (resolved.closedTrades.length > 0) {
        expect(resolved.closedTrades[0]!.exitReason).toBe("sl");
        expect(resolved.closedTrades[0]!.resultR).toBeCloseTo(-1);
        return;
      }
    }

    throw new Error("Trade did not close at SL");
  });

  it("uses SL-first on same-candle SL and TP touch", () => {
    const candles = loadFixtureFromDisk("sameCandleSlTp");
    const trade = createTradeFromDraft({
      draft: {
        direction: "long",
        entryPrice: 1.1,
        stopLossPrice: "1.09900",
        takeProfitPrice: "1.10100",
      },
      replaySessionId: "session-1",
      symbol: "TEST",
      entryTimestamp: candles[0]!.timestamp,
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
    });

    const exit = detectCandleExit(trade, candles[0]!);
    expect(exit?.exitReason).toBe("sl");
    expect(exit?.exitPrice).toBe(1.099);
  });

  it("supports manual close", () => {
    const trade = createTradeFromDraft({
      draft: {
        direction: "long",
        entryPrice: 1.1,
        stopLossPrice: "1.09900",
        takeProfitPrice: "1.10500",
      },
      replaySessionId: "session-1",
      symbol: "TEST",
      entryTimestamp: Date.now(),
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
    });

    const closed = closeTradeAtPrice(trade, 1.102, Date.now(), "manual");
    expect(closed.status).toBe("closed");
    expect(closed.resultR).toBeCloseTo(2);
  });
});
