import type { Trade } from "@/lib/trades/trade-types";
import { DEFAULT_ACCOUNT_BALANCE } from "@/lib/trades/trade-types";

export type ChallengeStatus = "active" | "passed" | "failed";

export type PropFirmChallenge = {
  startingBalance: number;
  profitTargetPercent: number;
  maxDailyLossPercent: number;
  maxOverallDrawdownPercent: number;
  status: ChallengeStatus;
  failureReason?: string;
  peakBalance: number;
  dailyLossByDate: Record<string, number>;
};

export const DEFAULT_PROP_FIRM_CHALLENGE: PropFirmChallenge = {
  startingBalance: DEFAULT_ACCOUNT_BALANCE,
  profitTargetPercent: 0.1,
  maxDailyLossPercent: 0.05,
  maxOverallDrawdownPercent: 0.1,
  status: "active",
  peakBalance: DEFAULT_ACCOUNT_BALANCE,
  dailyLossByDate: {},
};

export function createPropFirmChallenge(
  overrides: Partial<PropFirmChallenge> = {},
): PropFirmChallenge {
  return {
    ...DEFAULT_PROP_FIRM_CHALLENGE,
    ...overrides,
    dailyLossByDate: { ...DEFAULT_PROP_FIRM_CHALLENGE.dailyLossByDate, ...overrides.dailyLossByDate },
  };
}

function dateKeyFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export type ChallengeEvaluation = {
  challenge: PropFirmChallenge;
  profitTargetAmount: number;
  profitProgress: number;
  dailyLossUsed: number;
  maxDrawdownUsed: number;
  drawdownFloor: number;
};

export function evaluateChallenge(
  challenge: PropFirmChallenge,
  accountBalance: number,
  closedTrades: Trade[] = [],
): ChallengeEvaluation {
  const profitTargetAmount =
    challenge.startingBalance * challenge.profitTargetPercent;
  const profitProgress = accountBalance - challenge.startingBalance;
  const drawdownFloor =
    challenge.startingBalance *
    (1 - challenge.maxOverallDrawdownPercent);
  const peakBalance = Math.max(challenge.peakBalance, accountBalance);
  const maxDrawdownUsed = peakBalance - accountBalance;

  const dailyLossByDate = { ...challenge.dailyLossByDate };
  for (const trade of closedTrades) {
    if (
      trade.status !== "closed" ||
      trade.resultAmount === undefined ||
      trade.exitTimestamp === undefined ||
      trade.resultAmount >= 0
    ) {
      continue;
    }

    const key = dateKeyFromTimestamp(trade.exitTimestamp);
    dailyLossByDate[key] = (dailyLossByDate[key] ?? 0) + Math.abs(trade.resultAmount);
  }

  const todayKey = dateKeyFromTimestamp(Date.now());
  const dailyLossUsed = dailyLossByDate[todayKey] ?? 0;
  const maxDailyLossAmount =
    challenge.startingBalance * challenge.maxDailyLossPercent;

  let status = challenge.status;
  let failureReason = challenge.failureReason;

  if (status === "active") {
    if (accountBalance <= drawdownFloor) {
      status = "failed";
      failureReason = "Max overall drawdown breached";
    } else if (dailyLossUsed >= maxDailyLossAmount) {
      status = "failed";
      failureReason = "Max daily loss breached";
    } else if (profitProgress >= profitTargetAmount) {
      status = "passed";
      failureReason = undefined;
    }
  }

  return {
    challenge: {
      ...challenge,
      status,
      failureReason,
      peakBalance,
      dailyLossByDate,
    },
    profitTargetAmount,
    profitProgress,
    dailyLossUsed,
    maxDrawdownUsed,
    drawdownFloor,
  };
}
