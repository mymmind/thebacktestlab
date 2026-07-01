"use client";

import { useEffect } from "react";

import {
  createDefaultPersistedState,
  type PersistedState,
} from "@/lib/storage/persistence-types";
import {
  loadPersistedState,
  savePersistedState,
} from "@/lib/storage/local-storage";
import { useJournalStore } from "@/store/journal-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTradeStore } from "@/store/trade-store";

function collectPersistedState(): PersistedState {
  const settings = useSettingsStore.getState();
  const trades = useTradeStore.getState().trades;
  const journals = useJournalStore.getState().journals;

  return {
    version: 1,
    settings: {
      accountBalance: settings.accountBalance,
      riskPercent: settings.riskPercent,
    },
    trades,
    journals,
    challenge: settings.challenge,
    exportedAt: Date.now(),
  };
}

export function hydrateFromPersistence(): void {
  const persisted = loadPersistedState();
  if (!persisted) {
    return;
  }

  useSettingsStore.getState().hydrate({
    accountBalance: persisted.settings.accountBalance,
    riskPercent: persisted.settings.riskPercent,
    challenge: persisted.challenge,
  });
  useTradeStore.getState().hydrate(persisted.trades);
  useJournalStore.getState().hydrate(persisted.journals);
}

export function exportCurrentState(): string {
  return JSON.stringify(collectPersistedState(), null, 2);
}

export function importState(raw: string): void {
  const parsed = JSON.parse(raw) as PersistedState;
  useSettingsStore.getState().hydrate({
    accountBalance: parsed.settings.accountBalance,
    riskPercent: parsed.settings.riskPercent,
    challenge: parsed.challenge,
  });
  useTradeStore.getState().hydrate(parsed.trades);
  useJournalStore.getState().hydrate(parsed.journals);
  savePersistedState(parsed);
}

export function resetAllState(): void {
  const defaults = createDefaultPersistedState();
  useSettingsStore.getState().reset();
  useTradeStore.getState().reset();
  useJournalStore.getState().reset();
  savePersistedState(defaults);
}

export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateFromPersistence();
  }, []);

  useEffect(() => {
    const unsubscribeSettings = useSettingsStore.subscribe(() => {
      savePersistedState(collectPersistedState());
    });
    const unsubscribeTrades = useTradeStore.subscribe(() => {
      savePersistedState(collectPersistedState());
    });
    const unsubscribeJournal = useJournalStore.subscribe(() => {
      savePersistedState(collectPersistedState());
    });

    return () => {
      unsubscribeSettings();
      unsubscribeTrades();
      unsubscribeJournal();
    };
  }, []);

  return children;
}

export function getPersistedStateForTests(): PersistedState {
  return collectPersistedState();
}
