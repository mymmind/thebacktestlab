import type { TradeJournal } from "@/lib/journal/journal-types";
import type { PropFirmChallenge } from "@/lib/trades/prop-firm-engine";
import type { Trade } from "@/lib/trades/trade-types";
import {
  DEFAULT_ACCOUNT_BALANCE,
  DEFAULT_RISK_PERCENT,
} from "@/lib/trades/trade-types";

export const PERSISTENCE_VERSION = 1;
export const STORAGE_KEY = "backtesting-lab-state";

export type PersistedSettings = {
  accountBalance: number;
  riskPercent: number;
};

export type PersistedState = {
  version: number;
  settings: PersistedSettings;
  trades: Trade[];
  journals: TradeJournal[];
  challenge: PropFirmChallenge;
  exportedAt: number;
};

export function createDefaultPersistedState(): PersistedState {
  return {
    version: PERSISTENCE_VERSION,
    settings: {
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
    },
    trades: [],
    journals: [],
    challenge: {
      startingBalance: DEFAULT_ACCOUNT_BALANCE,
      profitTargetPercent: 0.1,
      maxDailyLossPercent: 0.05,
      maxOverallDrawdownPercent: 0.1,
      status: "active",
      peakBalance: DEFAULT_ACCOUNT_BALANCE,
      dailyLossByDate: {},
    },
    exportedAt: Date.now(),
  };
}

export function serializeState(state: PersistedState): string {
  return JSON.stringify(state, null, 2);
}

export function parsePersistedState(raw: string): PersistedState {
  const parsed = JSON.parse(raw) as PersistedState;

  if (parsed.version !== PERSISTENCE_VERSION) {
    throw new Error("Unsupported backup version");
  }

  if (!parsed.settings || !Array.isArray(parsed.trades)) {
    throw new Error("Invalid backup format");
  }

  return parsed;
}
