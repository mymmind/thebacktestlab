"use client";

import type { Trade } from "@/lib/trades/trade-types";

type TradeLogProps = {
  trades: Trade[];
};

export function TradeLog({ trades }: TradeLogProps) {
  const sorted = [...trades].sort(
    (left, right) => right.createdAt - left.createdAt,
  );

  return (
    <div className="space-y-2" data-testid="trade-log">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest">
          Trade Log
        </h3>
        <span className="font-mono text-xs" data-testid="trade-log-count">
          {trades.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trades yet</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((trade) => (
            <li
              key={trade.id}
              className="border border-border p-2 text-xs font-mono"
              data-testid={`trade-log-row-${trade.id}`}
            >
              <div className="flex justify-between uppercase">
                <span>{trade.direction}</span>
                <span data-testid={`trade-status-${trade.id}`}>
                  {trade.status}
                </span>
              </div>
              <p>Entry: {trade.entryPrice.toFixed(5)}</p>
              <p>SL: {trade.stopLossPrice.toFixed(5)}</p>
              {trade.takeProfitPrice !== undefined ? (
                <p>TP: {trade.takeProfitPrice.toFixed(5)}</p>
              ) : null}
              {trade.resultR !== undefined ? (
                <p data-testid={`trade-result-r-${trade.id}`}>
                  R: {trade.resultR.toFixed(2)}
                </p>
              ) : null}
              {trade.resultAmount !== undefined ? (
                <p data-testid={`trade-result-amount-${trade.id}`}>
                  P/L: {trade.resultAmount.toFixed(2)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
