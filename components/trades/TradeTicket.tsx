"use client";

import { calculatePotentialR } from "@/lib/trades/r-multiple";
import { calculateRisk } from "@/lib/trades/risk-engine";
import { parsePrice, validateTradeDraft } from "@/lib/trades/trade-engine";
import type { TradeDraft } from "@/lib/trades/trade-types";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";

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
    <div className="section-card" data-testid="trade-ticket">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trade Ticket
        </h3>
        <Badge
          variant={draft.direction === "long" ? "success" : "danger"}
          data-testid="trade-ticket-direction"
        >
          {draft.direction}
        </Badge>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Entry
        </span>
        <Input
          readOnly
          aria-label="Entry price"
          data-testid="trade-ticket-entry"
          value={draft.entryPrice.toFixed(symbol === "XAUUSD" ? 2 : 5)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Stop Loss
        </span>
        <Input
          aria-label="Stop loss"
          data-testid="trade-ticket-sl"
          value={draft.stopLossPrice}
          onChange={(event) =>
            onChange({ stopLossPrice: event.target.value })
          }
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Take Profit (optional)
        </span>
        <Input
          aria-label="Take profit"
          data-testid="trade-ticket-tp"
          value={draft.takeProfitPrice}
          onChange={(event) =>
            onChange({ takeProfitPrice: event.target.value })
          }
        />
      </label>

      {risk ? (
        <div className="space-y-1 border border-border bg-background/50 p-2 font-mono text-[11px]">
          <p>
            Risk:{" "}
            <span data-testid="trade-ticket-risk-amount">
              {risk.riskAmount.toFixed(2)}
            </span>
          </p>
          <p className="text-muted-foreground">
            Distance: {risk.riskDistance.toFixed(5)}
          </p>
          {potentialR !== null ? (
            <p className="text-muted-foreground">
              Potential R: {potentialR.toFixed(2)}
            </p>
          ) : null}
        </div>
      ) : null}

      {!validation.valid ? (
        <p className="text-[11px] text-destructive" data-testid="trade-ticket-error">
          {validation.message}
        </p>
      ) : null}

      {validationError ? (
        <p className="text-[11px] text-destructive">{validationError}</p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          aria-label="Confirm trade"
          className="flex-1"
          data-testid="trade-ticket-confirm"
          disabled={!validation.valid}
          onClick={onConfirm}
        >
          Confirm <Kbd className="ml-1 border-0 bg-transparent p-0 text-inherit">↵</Kbd>
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Cancel trade ticket"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
