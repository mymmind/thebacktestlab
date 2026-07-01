import { create } from "zustand";

import type { Candle } from "@/lib/candles/candle-types";
import {
  closeTradeAtPrice,
  createTradeFromDraft,
  getOpenTrade,
  resolveOpenTradesOnCandle,
  validateTradeDraft,
} from "@/lib/trades/trade-engine";
import type { Trade, TradeDraft, TradeDirection } from "@/lib/trades/trade-types";
import { useSettingsStore } from "@/store/settings-store";
import { getReplayEngineState } from "@/store/replay-accessor";
import { registerTradeResolution } from "@/store/trade-resolution-bridge";

registerTradeResolution((candle) => {
  useTradeStore.getState().resolveOnCandle(candle);
});

type TradeStoreState = {
  trades: Trade[];
  draft: TradeDraft | null;
  validationError: string | null;
  startDraft: (direction: TradeDirection, entryPrice: number) => void;
  updateDraft: (patch: Partial<TradeDraft>) => void;
  cancelDraft: () => void;
  confirmDraft: () => boolean;
  closeOpenTrade: () => boolean;
  resolveOnCandle: (candle: Candle) => void;
  hydrate: (trades: Trade[]) => void;
  reset: () => void;
};

export const useTradeStore = create<TradeStoreState>((set, get) => ({
  trades: [],
  draft: null,
  validationError: null,

  startDraft(direction, entryPrice) {
    if (getOpenTrade(get().trades)) {
      set({ validationError: "Close the open trade before opening a new ticket" });
      return;
    }

    set({
      draft: {
        direction,
        entryPrice,
        stopLossPrice: "",
        takeProfitPrice: "",
      },
      validationError: null,
    });
  },

  updateDraft(patch) {
    const draft = get().draft;
    if (!draft) {
      return;
    }

    set({
      draft: { ...draft, ...patch },
      validationError: null,
    });
  },

  cancelDraft() {
    set({ draft: null, validationError: null });
  },

  confirmDraft() {
    const draft = get().draft;
    if (!draft) {
      return false;
    }

    const validation = validateTradeDraft(draft);
    if (!validation.valid) {
      set({ validationError: validation.message });
      return false;
    }

    const replay = getReplayEngineState();
    const settings = useSettingsStore.getState();
    const currentCandle = replay.candles[replay.session.currentCursorIndex];

    if (!currentCandle) {
      set({ validationError: "No current candle available" });
      return false;
    }

    if (getOpenTrade(get().trades)) {
      set({ validationError: "Only one open trade is allowed" });
      return false;
    }

    try {
      const trade = createTradeFromDraft({
        draft,
        replaySessionId: replay.session.id,
        symbol: replay.session.symbol,
        entryTimestamp: currentCandle.timestamp,
        accountBalance: settings.accountBalance,
        riskPercent: settings.riskPercent,
      });

      set({
        trades: [...get().trades, trade],
        draft: null,
        validationError: null,
      });
      return true;
    } catch (error) {
      set({
        validationError:
          error instanceof Error ? error.message : "Unable to create trade",
      });
      return false;
    }
  },

  closeOpenTrade() {
    const openTrade = getOpenTrade(get().trades);
    if (!openTrade) {
      return false;
    }

    const replay = getReplayEngineState();
    const currentCandle = replay.candles[replay.session.currentCursorIndex];
    if (!currentCandle) {
      return false;
    }

    const closed = closeTradeAtPrice(
      openTrade,
      currentCandle.close,
      currentCandle.timestamp,
      "manual",
    );

    set({
      trades: get().trades.map((trade) =>
        trade.id === closed.id ? closed : trade,
      ),
    });
    useSettingsStore.getState().applyClosedTrade(closed);
    return true;
  },

  resolveOnCandle(candle) {
    const { trades, closedTrades } = resolveOpenTradesOnCandle(
      get().trades,
      candle,
    );

    if (closedTrades.length === 0) {
      return;
    }

    set({ trades });

    for (const closed of closedTrades) {
      useSettingsStore.getState().applyClosedTrade(closed);
    }
  },

  hydrate(trades) {
    set({ trades, draft: null, validationError: null });
  },

  reset() {
    set({ trades: [], draft: null, validationError: null });
  },
}));

export function useOpenTrade() {
  return useTradeStore((state) => getOpenTrade(state.trades));
}

export function useClosedTrades() {
  return useTradeStore((state) =>
    state.trades.filter((trade) => trade.status === "closed"),
  );
}
