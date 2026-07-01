"use client";

import type { RuleChecklist, Trade } from "@/lib/trades/trade-types";
import type { TradeJournal } from "@/lib/journal/journal-types";

const RULE_ITEMS: Array<{ key: keyof RuleChecklist; label: string }> = [
  { key: "hasBos", label: "BOS marked" },
  { key: "hasOrderBlock", label: "Order block marked" },
  { key: "retracedToValidZone", label: "Retraced to valid zone" },
  { key: "entryOnPlannedTimeframe", label: "Entry on planned timeframe" },
  { key: "stopLossBeyondInvalidation", label: "SL beyond invalidation" },
  { key: "targetAtLogicalLiquidity", label: "Target at logical liquidity" },
  { key: "riskWithinLimit", label: "Risk within limit" },
  { key: "noHighImpactNewsConflict", label: "No high-impact news conflict" },
  { key: "withinTradingSession", label: "Within trading session" },
  { key: "followedPlan", label: "Followed plan" },
];

type RuleChecklistProps = {
  trade: Trade;
  onChange: (checklist: RuleChecklist) => void;
};

export function RuleChecklist({ trade, onChange }: RuleChecklistProps) {
  return (
    <div className="space-y-2" data-testid="rule-checklist">
      <h4 className="text-xs font-bold uppercase tracking-widest">
        Rule Checklist
      </h4>
      <ul className="space-y-1">
        {RULE_ITEMS.map(({ key, label }) => (
          <li key={key}>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={trade.ruleChecklist[key]}
                data-testid={`rule-check-${key}`}
                onChange={(event) =>
                  onChange({
                    ...trade.ruleChecklist,
                    [key]: event.target.checked,
                  })
                }
              />
              {label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

type JournalPanelProps = {
  trade: Trade | null;
  journal: TradeJournal | null;
  onJournalChange: (journal: TradeJournal) => void;
  onChecklistChange: (checklist: RuleChecklist) => void;
};

export function JournalPanel({
  trade,
  journal,
  onJournalChange,
  onChecklistChange,
}: JournalPanelProps) {
  if (!trade || !journal) {
    return (
      <div className="p-4 text-sm text-muted-foreground" data-testid="journal-panel">
        Select a closed trade to journal
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4" data-testid="journal-panel">
      <h3 className="text-xs font-bold uppercase tracking-widest">
        Journal — {trade.direction} {trade.symbol}
      </h3>

      <label className="block space-y-1 text-xs">
        <span className="text-muted-foreground">Pre-trade note</span>
        <textarea
          aria-label="Pre-trade note"
          className="min-h-16 w-full border border-border bg-background p-2"
          data-testid="journal-pre-trade-note"
          value={journal.preTradeNote ?? ""}
          onChange={(event) =>
            onJournalChange({
              ...journal,
              preTradeNote: event.target.value,
            })
          }
        />
      </label>

      <label className="block space-y-1 text-xs">
        <span className="text-muted-foreground">Post-trade note</span>
        <textarea
          aria-label="Post-trade note"
          className="min-h-16 w-full border border-border bg-background p-2"
          data-testid="journal-post-trade-note"
          value={journal.postTradeNote ?? ""}
          onChange={(event) =>
            onJournalChange({
              ...journal,
              postTradeNote: event.target.value,
            })
          }
        />
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={journal.followedRules}
          data-testid="journal-followed-rules"
          onChange={(event) =>
            onJournalChange({
              ...journal,
              followedRules: event.target.checked,
            })
          }
        />
        Followed rules
      </label>

      <RuleChecklist trade={trade} onChange={onChecklistChange} />
    </div>
  );
}
