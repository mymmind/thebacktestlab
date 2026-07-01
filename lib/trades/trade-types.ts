export type TradeDirection = "long" | "short";

export type TradeStatus = "planned" | "open" | "closed" | "cancelled";

export type TradeExitReason = "sl" | "tp" | "manual";

export type SetupTag =
  | "M15_BOS"
  | "M15_OB"
  | "M15_RETRACEMENT"
  | "IMPULSE"
  | "A_PLUS";

export type RuleChecklist = {
  hasBos: boolean;
  hasOrderBlock: boolean;
  retracedToValidZone: boolean;
  entryOnPlannedTimeframe: boolean;
  stopLossBeyondInvalidation: boolean;
  targetAtLogicalLiquidity: boolean;
  riskWithinLimit: boolean;
  noHighImpactNewsConflict: boolean;
  withinTradingSession: boolean;
  followedPlan: boolean;
};

export type Trade = {
  id: string;
  replaySessionId: string;
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;

  entryTimestamp: number;
  entryPrice: number;

  stopLossPrice: number;
  takeProfitPrice?: number;

  exitTimestamp?: number;
  exitPrice?: number;
  exitReason?: TradeExitReason;

  accountBalanceAtEntry: number;
  riskPercent: number;
  riskAmount: number;

  positionSize?: number;

  resultR?: number;
  resultAmount?: number;

  setupTags: SetupTag[];
  ruleChecklist: RuleChecklist;
  notes?: string;

  createdAt: number;
  updatedAt: number;
};

export type TradeDraft = {
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice: string;
  takeProfitPrice: string;
};

export const DEFAULT_ACCOUNT_BALANCE = 200_000;
export const DEFAULT_RISK_PERCENT = 0.0025;
export const MAX_RISK_PERCENT = 0.005;

export const RISK_PRESETS = [0.001, 0.0025, 0.0035, 0.005] as const;

export function createEmptyRuleChecklist(): RuleChecklist {
  return {
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
  };
}

export function createTradeId(now = Date.now()): string {
  return `trade-${now}-${Math.random().toString(36).slice(2, 8)}`;
}
