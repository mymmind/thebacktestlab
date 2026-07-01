import { create } from "zustand";

import {
  createPropFirmChallenge,
  evaluateChallenge,
  type PropFirmChallenge,
} from "@/lib/trades/prop-firm-engine";
import type { Trade } from "@/lib/trades/trade-types";
import {
  DEFAULT_ACCOUNT_BALANCE,
  DEFAULT_RISK_PERCENT,
} from "@/lib/trades/trade-types";

type SettingsStoreState = {
  accountBalance: number;
  riskPercent: number;
  challenge: PropFirmChallenge;
  setRiskPercent: (riskPercent: number) => void;
  applyClosedTrade: (trade: Trade) => void;
  setAccountBalance: (balance: number) => void;
  hydrate: (input: {
    accountBalance: number;
    riskPercent: number;
    challenge: PropFirmChallenge;
  }) => void;
  reset: () => void;
};

const initialChallenge = createPropFirmChallenge();

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  accountBalance: DEFAULT_ACCOUNT_BALANCE,
  riskPercent: DEFAULT_RISK_PERCENT,
  challenge: initialChallenge,

  setRiskPercent(riskPercent) {
    set({ riskPercent });
  },

  setAccountBalance(accountBalance) {
    const evaluation = evaluateChallenge(
      get().challenge,
      accountBalance,
    );
    set({
      accountBalance,
      challenge: evaluation.challenge,
    });
  },

  applyClosedTrade(trade) {
    if (trade.status !== "closed" || trade.resultAmount === undefined) {
      return;
    }

    const nextBalance = get().accountBalance + trade.resultAmount;
    const evaluation = evaluateChallenge(
      get().challenge,
      nextBalance,
      [trade],
    );

    set({
      accountBalance: nextBalance,
      challenge: evaluation.challenge,
    });
  },

  hydrate(input) {
    set({
      accountBalance: input.accountBalance,
      riskPercent: input.riskPercent,
      challenge: input.challenge,
    });
  },

  reset() {
    set({
      accountBalance: DEFAULT_ACCOUNT_BALANCE,
      riskPercent: DEFAULT_RISK_PERCENT,
      challenge: createPropFirmChallenge(),
    });
  },
}));

export function useChallengeEvaluation() {
  return useSettingsStore((state) =>
    evaluateChallenge(state.challenge, state.accountBalance),
  );
}
