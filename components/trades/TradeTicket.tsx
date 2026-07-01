"use client";

import { calculatePotentialR } from "@/lib/trades/r-multiple";
import { calculateRisk } from "@/lib/trades/risk-engine";
import { parsePrice, validateTradeDraft } from "@/lib/trades/trade-engine";
import type { TradeDraft } from "@/lib/trades/trade-types";
import { useSettingsStore } from "@/store/settings-store";

type TradeTicketProps = {
  draft: TradeDraft;
  symbol: string;
  validationError: string | null;
  onChange: (patch: Partial<TradeDraft>) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TradeTicket({
  draft,
  symbol,
  validationError,
  onChange,
  onConfirm,
  onCancel,
}: TradeTicketProps) {
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const riskPercent = useSettingsStore((state) => state.riskPercent);
  const validation = validateTradeDraft(draft);
  const stopLoss = parsePrice(draft.stopLossPrice);
  const takeProfit = parsePrice(draft.takeProfitPrice);

  const risk =
    validation.valid && stopLoss !== null
      ? calculateRisk({
          accountBalance,
          riskPercent,
          entryPrice: draft.entryPrice,
          stopLossPrice: stopLoss,
          direction: draft.direction,
        })
      : null;

  const potentialR =
    validation.valid && stopLoss !== null && takeProfit !== null
      ? calculatePotentialR(
          draft.direction,
          draft.entryPrice,
          stopLoss,
          takeProfit,
        )
      : null;

  return (
    <div
      className="space-y-3 border-2 border-border p-3"
      data-testid="trade-ticket"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Trade Ticket
        </h3>
        <span
          className="font-mono text-xs uppercase"
          data-testid="trade-ticket-direction"
        >
          {draft.direction}
        </span>
      </div>

      <label className="block space-y-1 text-xs">
        <span className="text-muted-foreground">Entry</span>
        <input
          readOnly
          aria-label="Entry price"
          className="w-full border border-border bg-background px-2 py-1 font-mono"
          data-testid="trade-ticket-entry"
          value={draft.entryPrice.toFixed(symbol === "XAUUSD" ? 2 : 5)}
        />
      </label>

      <label className="block space-y-1 text-xs">
        <span className="text-muted-foreground">Stop Loss</span>
        <input
          aria-label="Stop loss"
          className="w-full border border-border bg-background px-2 py-1 font-mono"
          data-testid="trade-ticket-sl"
          value={draft.stopLossPrice}
          onChange={(event) =>
            onChange({ stopLossPrice: event.target.value })
          }
        />
      </label>

      <label className="block space-y-1 text-xs">
        <span className="text-muted-foreground">Take Profit (optional)</span>
        <input
          aria-label="Take profit"
          className="w-full border border-border bg-background px-2 py-1 font-mono"
          data-testid="trade-ticket-tp"
          value={draft.takeProfitPrice}
          onChange={(event) =>
            onChange({ takeProfitPrice: event.target.value })
          }
        />
      </label>

      {risk ? (
        <div className="space-y-1 text-xs font-mono">
          <p>
            Risk:{" "}
            <span data-testid="trade-ticket-risk-amount">
              {risk.riskAmount.toFixed(2)}
            </span>
          </p>
          <p>Distance: {risk.riskDistance.toFixed(5)}</p>
          {potentialR !== null ? <p>Potential R: {potentialR.toFixed(2)}</p> : null}
        </div>
      ) : null}

      {!validation.valid ? (
        <p className="text-xs text-destructive" data-testid="trade-ticket-error">
          {validation.message}
        </p>
      ) : null}

      {validationError ? (
        <p className="text-xs text-destructive">{validationError}</p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Confirm trade"
          className="flex-1 border-2 border-foreground px-2 py-1 text-xs font-bold uppercase"
          data-testid="trade-ticket-confirm"
          disabled={!validation.valid}
          onClick={onConfirm}
        >
          Confirm (Enter)
        </button>
        <button
          type="button"
          aria-label="Cancel trade ticket"
          className="border-2 border-border px-2 py-1 text-xs uppercase"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
