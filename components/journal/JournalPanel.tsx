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
      <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Rule Checklist
      </h4>
      <ul className="space-y-1.5">
        {RULE_ITEMS.map(({ key, label }) => (
          <li key={key}>
            <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-snug">
              <input
                type="checkbox"
                className="mt-0.5 accent-foreground"
                checked={trade.ruleChecklist[key]}
                data-testid={`rule-check-${key}`}
                onChange={(event) =>
                  onChange({
                    ...trade.ruleChecklist,
                    [key]: event.target.checked,
                  })
                }
              />
              <span className="text-muted-foreground">{label}</span>
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
      <div className="empty-state" data-testid="journal-panel">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          No trade selected
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Close a trade in the workspace, then select it here to document your
          process and rule adherence.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-frame space-y-5 p-5" data-testid="journal-panel">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Trade review
        </p>
        <h3 className="mt-1 text-lg font-bold uppercase tracking-wide">
          {trade.direction} {trade.symbol}
        </h3>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Pre-trade note
        </span>
        <textarea
          aria-label="Pre-trade note"
          className="terminal-input min-h-20 resize-y"
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

      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Post-trade note
        </span>
        <textarea
          aria-label="Post-trade note"
          className="terminal-input min-h-20 resize-y"
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

      <label className="flex cursor-pointer items-center gap-2.5 text-[11px]">
        <input
          type="checkbox"
          className="accent-foreground"
          checked={journal.followedRules}
          data-testid="journal-followed-rules"
          onChange={(event) =>
            onJournalChange({
              ...journal,
              followedRules: event.target.checked,
            })
          }
        />
        <span className="text-muted-foreground">Followed rules</span>
      </label>

      <RuleChecklist trade={trade} onChange={onChecklistChange} />
    </div>
  );
}
