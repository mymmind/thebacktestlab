"use client";

import type { Trade } from "@/lib/trades/trade-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TradeLogProps = {
  trades: Trade[];
};

export function TradeLog({ trades }: TradeLogProps) {
  const sorted = [...trades].sort(
    (left, right) => right.createdAt - left.createdAt,
  );

  return (
    <div className="section-card" data-testid="trade-log">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trade Log
        </h3>
        <Badge variant="outline" data-testid="trade-log-count">
          {trades.length}
        </Badge>
      </div>

      {sorted.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-muted-foreground">
          No executions recorded
        </p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {sorted.map((trade) => (
            <li
              key={trade.id}
              className="border border-border bg-background/40 p-2.5 font-mono text-[11px]"
              data-testid={`trade-log-row-${trade.id}`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <Badge
                  variant={trade.direction === "long" ? "success" : "danger"}
                  className="normal-case"
                >
                  {trade.direction}
                </Badge>
                <span
                  className={cn(
                    "uppercase",
                    trade.status === "closed" && trade.resultR !== undefined && trade.resultR >= 0
                      ? "text-success"
                      : trade.status === "closed"
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                  data-testid={`trade-status-${trade.id}`}
                >
                  {trade.status}
                </span>
              </div>
              <div className="space-y-0.5 text-muted-foreground">
                <p>
                  Entry <span className="text-foreground">{trade.entryPrice.toFixed(5)}</span>
                </p>
                <p>SL {trade.stopLossPrice.toFixed(5)}</p>
                {trade.takeProfitPrice !== undefined ? (
                  <p>TP {trade.takeProfitPrice.toFixed(5)}</p>
                ) : null}
                {trade.resultR !== undefined ? (
                  <p data-testid={`trade-result-r-${trade.id}`}>
                    R <span className="text-foreground">{trade.resultR.toFixed(2)}</span>
                  </p>
                ) : null}
                {trade.resultAmount !== undefined ? (
                  <p data-testid={`trade-result-amount-${trade.id}`}>
                    P/L <span className="text-foreground">{trade.resultAmount.toFixed(2)}</span>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
