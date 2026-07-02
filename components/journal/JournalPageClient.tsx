"use client";

import { useEffect } from "react";

import { JournalPanel } from "@/components/journal/JournalPanel";
import { PageLayout } from "@/components/app-shell/PageLayout";
import type { RuleChecklist } from "@/lib/trades/trade-types";
import { useJournalStore } from "@/store/journal-store";
import { useTradeStore } from "@/store/trade-store";
import { cn } from "@/lib/utils";

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
    <PageLayout
      title="Journal"
      subtitle="Post-trade review and rule adherence. Honest documentation builds discipline."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="panel-frame h-fit">
          <div className="panel-header">
            <h2 className="panel-header-title text-foreground">Closed Trades</h2>
            <span className="font-mono text-[10px] text-muted-foreground">
              {closedTrades.length}
            </span>
          </div>

          <div className="p-3">
            {closedTrades.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  No closed trades
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete trades in the workspace to journal them here.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {closedTrades.map((trade) => {
                  const isSelected = selectedTrade?.id === trade.id;
                  const isWinner =
                    trade.resultR !== undefined && trade.resultR >= 0;

                  return (
                    <li key={trade.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full border px-3 py-2.5 text-left font-mono text-[11px] transition-colors",
                          isSelected
                            ? "border-foreground bg-muted text-foreground"
                            : "border-border bg-background/40 text-muted-foreground hover:border-white/20 hover:text-foreground",
                        )}
                        data-testid={`journal-trade-select-${trade.id}`}
                        onClick={() => selectTrade(trade.id)}
                      >
                        <span className="flex items-center justify-between uppercase">
                          <span>
                            {trade.direction} {trade.symbol}
                          </span>
                          <span
                            className={cn(
                              isWinner ? "text-success" : "text-destructive",
                            )}
                          >
                            R {trade.resultR?.toFixed(2) ?? "—"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <JournalPanel
          trade={selectedTrade}
          journal={journal}
          onJournalChange={upsertJournal}
          onChecklistChange={handleChecklistChange}
        />
      </div>
    </PageLayout>
  );
}
