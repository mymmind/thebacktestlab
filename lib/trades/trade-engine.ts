import type { Candle } from "@/lib/candles/candle-types";
import {
  calculateResultAmount,
  calculateRMultiple,
} from "@/lib/trades/r-multiple";
import { calculateRisk } from "@/lib/trades/risk-engine";
import {
  createEmptyRuleChecklist,
  createTradeId,
  type Trade,
  type TradeDirection,
  type TradeDraft,
  type TradeExitReason,
} from "@/lib/trades/trade-types";

export type TradeValidationError =
  | "missing_stop_loss"
  | "invalid_stop_loss"
  | "invalid_take_profit"
  | "risk_distance_zero";

export type TradeValidationResult =
  | { valid: true }
  | { valid: false; error: TradeValidationError; message: string };

export function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateTradeDraft(
  draft: TradeDraft,
): TradeValidationResult {
  const stopLoss = parsePrice(draft.stopLossPrice);
  if (stopLoss === null) {
    return {
      valid: false,
      error: "missing_stop_loss",
      message: "Stop loss is required",
    };
  }

  const takeProfitRaw = draft.takeProfitPrice.trim();
  const takeProfit = takeProfitRaw ? parsePrice(takeProfitRaw) : undefined;

  if (takeProfitRaw && takeProfit === null) {
    return {
      valid: false,
      error: "invalid_take_profit",
      message: "Take profit must be a valid number",
    };
  }

  return validateTradePrices(
    draft.direction,
    draft.entryPrice,
    stopLoss,
    takeProfit ?? undefined,
  );
}

export function validateTradePrices(
  direction: TradeDirection,
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice?: number,
): TradeValidationResult {
  if (direction === "long") {
    if (stopLossPrice >= entryPrice) {
      return {
        valid: false,
        error: "invalid_stop_loss",
        message: "Long stop loss must be below entry",
      };
    }

    if (
      takeProfitPrice !== undefined &&
      takeProfitPrice <= entryPrice
    ) {
      return {
        valid: false,
        error: "invalid_take_profit",
        message: "Long take profit must be above entry",
      };
    }
  } else {
    if (stopLossPrice <= entryPrice) {
      return {
        valid: false,
        error: "invalid_stop_loss",
        message: "Short stop loss must be above entry",
      };
    }

    if (
      takeProfitPrice !== undefined &&
      takeProfitPrice >= entryPrice
    ) {
      return {
        valid: false,
        error: "invalid_take_profit",
        message: "Short take profit must be below entry",
      };
    }
  }

  const riskDistance =
    direction === "long"
      ? entryPrice - stopLossPrice
      : stopLossPrice - entryPrice;

  if (riskDistance <= 0) {
    return {
      valid: false,
      error: "risk_distance_zero",
      message: "Risk distance must be greater than zero",
    };
  }

  return { valid: true };
}

export type CreateTradeInput = {
  draft: TradeDraft;
  replaySessionId: string;
  symbol: string;
  entryTimestamp: number;
  accountBalance: number;
  riskPercent: number;
};

export function createTradeFromDraft(input: CreateTradeInput): Trade {
  const validation = validateTradeDraft(input.draft);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const stopLossPrice = parsePrice(input.draft.stopLossPrice)!;
  const takeProfitRaw = input.draft.takeProfitPrice.trim();
  const takeProfitPrice = takeProfitRaw
    ? parsePrice(takeProfitRaw)!
    : undefined;

  const risk = calculateRisk({
    accountBalance: input.accountBalance,
    riskPercent: input.riskPercent,
    entryPrice: input.draft.entryPrice,
    stopLossPrice,
    direction: input.draft.direction,
  });

  const now = Date.now();

  return {
    id: createTradeId(now),
    replaySessionId: input.replaySessionId,
    symbol: input.symbol,
    direction: input.draft.direction,
    status: "open",
    entryTimestamp: input.entryTimestamp,
    entryPrice: input.draft.entryPrice,
    stopLossPrice,
    takeProfitPrice,
    accountBalanceAtEntry: input.accountBalance,
    riskPercent: input.riskPercent,
    riskAmount: risk.riskAmount,
    positionSize: risk.positionSizeApprox,
    setupTags: [],
    ruleChecklist: createEmptyRuleChecklist(),
    createdAt: now,
    updatedAt: now,
  };
}

export type CandleExitResult = {
  exitPrice: number;
  exitReason: TradeExitReason;
};

export function detectCandleExit(
  trade: Trade,
  candle: Candle,
): CandleExitResult | null {
  if (trade.status !== "open") {
    return null;
  }

  const sl = trade.stopLossPrice;
  const tp = trade.takeProfitPrice;

  if (trade.direction === "long") {
    const slHit = candle.low <= sl;
    const tpHit = tp !== undefined && candle.high >= tp;

    if (slHit && tpHit) {
      return { exitPrice: sl, exitReason: "sl" };
    }

    if (slHit) {
      return { exitPrice: sl, exitReason: "sl" };
    }

    if (tpHit) {
      return { exitPrice: tp, exitReason: "tp" };
    }

    return null;
  }

  const slHit = candle.high >= sl;
  const tpHit = tp !== undefined && candle.low <= tp;

  if (slHit && tpHit) {
    return { exitPrice: sl, exitReason: "sl" };
  }

  if (slHit) {
    return { exitPrice: sl, exitReason: "sl" };
  }

  if (tpHit) {
    return { exitPrice: tp, exitReason: "tp" };
  }

  return null;
}

export function closeTradeAtPrice(
  trade: Trade,
  exitPrice: number,
  exitTimestamp: number,
  exitReason: TradeExitReason,
): Trade {
  const resultR = calculateRMultiple(
    trade.direction,
    trade.entryPrice,
    trade.stopLossPrice,
    exitPrice,
  );
  const resultAmount = calculateResultAmount(trade.riskAmount, resultR);
  const now = Date.now();

  return {
    ...trade,
    status: "closed",
    exitTimestamp,
    exitPrice,
    exitReason,
    resultR,
    resultAmount,
    updatedAt: now,
  };
}

export function resolveTradeOnCandle(
  trade: Trade,
  candle: Candle,
): Trade | null {
  const exit = detectCandleExit(trade, candle);
  if (!exit) {
    return null;
  }

  return closeTradeAtPrice(
    trade,
    exit.exitPrice,
    candle.timestamp,
    exit.exitReason,
  );
}

export function resolveOpenTradesOnCandle(
  trades: Trade[],
  candle: Candle,
): { trades: Trade[]; closedTrades: Trade[] } {
  const closedTrades: Trade[] = [];
  const nextTrades = trades.map((trade) => {
    if (trade.status !== "open") {
      return trade;
    }

    const closed = resolveTradeOnCandle(trade, candle);
    if (!closed) {
      return trade;
    }

    closedTrades.push(closed);
    return closed;
  });

  return { trades: nextTrades, closedTrades };
}

export function getOpenTrade(trades: Trade[]): Trade | undefined {
  return trades.find((trade) => trade.status === "open");
}
