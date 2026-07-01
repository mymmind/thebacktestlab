"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PropFirmPanel } from "@/components/trades/PropFirmPanel";
import { RiskPanel } from "@/components/trades/RiskPanel";
import { TradeLog } from "@/components/trades/TradeLog";
import { TradeTicket } from "@/components/trades/TradeTicket";
import { ImportExportPanel } from "@/components/storage/ImportExportPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCandleContext } from "@/components/app-shell/CandleProvider";
import { useOpenTrade, useTradeStore } from "@/store/trade-store";

export function TradePanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { symbol } = useCandleContext();
  const draft = useTradeStore((state) => state.draft);
  const trades = useTradeStore((state) => state.trades);
  const validationError = useTradeStore((state) => state.validationError);
  const updateDraft = useTradeStore((state) => state.updateDraft);
  const confirmDraft = useTradeStore((state) => state.confirmDraft);
  const cancelDraft = useTradeStore((state) => state.cancelDraft);
  const openTrade = useOpenTrade();

  if (collapsed) {
    return (
      <aside
        aria-label="Trade panel"
        className="flex w-10 shrink-0 flex-col items-center border-l-2 border-border bg-card py-2"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Expand trade panel"
          onClick={() => setCollapsed(false)}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Trade panel"
      className="flex w-64 shrink-0 flex-col border-l-2 border-border bg-card lg:w-72"
    >
      <div className="flex items-center justify-between border-b-2 border-border px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest">Trade</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Collapse trade panel"
          onClick={() => setCollapsed(true)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div data-testid="trade-panel-open-status">
            {openTrade
              ? `${openTrade.direction} open @ ${openTrade.entryPrice.toFixed(5)}`
              : "No open trade"}
          </div>

          {draft ? (
            <TradeTicket
              draft={draft}
              symbol={symbol}
              validationError={validationError}
              onChange={updateDraft}
              onConfirm={confirmDraft}
              onCancel={cancelDraft}
            />
          ) : null}

          <RiskPanel />
          <PropFirmPanel />
          <TradeLog trades={trades} />
          <ImportExportPanel />
        </div>
      </ScrollArea>
      <Separator />
      <p className="p-3 text-xs text-muted-foreground">
        L/S long/short · Enter confirm · Esc cancel · X close
      </p>
    </aside>
  );
}
