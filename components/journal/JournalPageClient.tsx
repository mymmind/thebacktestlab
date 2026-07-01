"use client";

import { useEffect } from "react";

import { JournalPanel } from "@/components/journal/JournalPanel";
import type { RuleChecklist } from "@/lib/trades/trade-types";
import { useJournalStore } from "@/store/journal-store";
import { useTradeStore } from "@/store/trade-store";

export function JournalPageClient() {
  const trades = useTradeStore((state) => state.trades);
  const closedTrades = trades.filter((trade) => trade.status === "closed");
  const selectedTradeId = useJournalStore((state) => state.selectedTradeId);
  const selectTrade = useJournalStore((state) => state.selectTrade);
  const ensureJournal = useJournalStore((state) => state.ensureJournal);
  const upsertJournal = useJournalStore((state) => state.upsertJournal);
  const journals = useJournalStore((state) => state.journals);

  const selectedTrade =
    closedTrades.find((trade) => trade.id === selectedTradeId) ??
    closedTrades[0] ??
    null;

  const journal = selectedTrade
    ? journals.find((item) => item.tradeId === selectedTrade.id) ?? null
    : null;

  useEffect(() => {
    if (selectedTrade && !journal) {
      ensureJournal(selectedTrade.id);
    }
  }, [ensureJournal, journal, selectedTrade]);

  function handleChecklistChange(checklist: RuleChecklist) {
    if (!selectedTrade) {
      return;
    }

    useTradeStore.setState({
      trades: useTradeStore
        .getState()
        .trades.map((trade) =>
          trade.id === selectedTrade.id
            ? { ...trade, ruleChecklist: checklist }
            : trade,
        ),
    });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold uppercase tracking-widest">Journal</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="space-y-2 border-2 border-border p-4">
          <h2 className="text-xs font-bold uppercase tracking-widest">
            Closed Trades
          </h2>
          {closedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No closed trades yet</p>
          ) : (
            <ul className="space-y-2">
              {closedTrades.map((trade) => (
                <li key={trade.id}>
                  <button
                    type="button"
                    className="w-full border border-border px-3 py-2 text-left text-xs font-mono uppercase"
                    data-testid={`journal-trade-select-${trade.id}`}
                    onClick={() => selectTrade(trade.id)}
                  >
                    {trade.direction} {trade.symbol} · R{" "}
                    {trade.resultR?.toFixed(2) ?? "—"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <JournalPanel
          trade={selectedTrade}
          journal={journal}
          onJournalChange={upsertJournal}
          onChecklistChange={handleChecklistChange}
        />
      </div>
    </div>
  );
}
