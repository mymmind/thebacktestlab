import { create } from "zustand";

import {
  createEmptyJournal,
  type TradeJournal,
} from "@/lib/journal/journal-types";

type JournalStoreState = {
  journals: TradeJournal[];
  selectedTradeId: string | null;
  selectTrade: (tradeId: string | null) => void;
  upsertJournal: (journal: TradeJournal) => void;
  getJournal: (tradeId: string) => TradeJournal | undefined;
  ensureJournal: (tradeId: string) => TradeJournal;
  hydrate: (journals: TradeJournal[]) => void;
  reset: () => void;
};

export const useJournalStore = create<JournalStoreState>((set, get) => ({
  journals: [],
  selectedTradeId: null,

  selectTrade(tradeId) {
    set({ selectedTradeId: tradeId });
  },

  upsertJournal(journal) {
    const next = get().journals.filter((item) => item.tradeId !== journal.tradeId);
    set({ journals: [...next, { ...journal, updatedAt: Date.now() }] });
  },

  getJournal(tradeId) {
    return get().journals.find((journal) => journal.tradeId === tradeId);
  },

  ensureJournal(tradeId) {
    const existing = get().getJournal(tradeId);
    if (existing) {
      return existing;
    }

    const journal = createEmptyJournal(tradeId);
    set({ journals: [...get().journals, journal] });
    return journal;
  },

  hydrate(journals) {
    set({ journals, selectedTradeId: null });
  },

  reset() {
    set({ journals: [], selectedTradeId: null });
  },
}));
