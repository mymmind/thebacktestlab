"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PropFirmPanel } from "@/components/trades/PropFirmPanel";
import { RiskPanel } from "@/components/trades/RiskPanel";
import { TradeLog } from "@/components/trades/TradeLog";
import { TradeTicket } from "@/components/trades/TradeTicket";
import { ImportExportPanel } from "@/components/storage/ImportExportPanel";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCandleContext } from "@/components/app-shell/CandleProvider";
import { useOpenTrade, useTradeStore } from "@/store/trade-store";
import { cn } from "@/lib/utils";

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
        className="flex w-10 shrink-0 flex-col items-center self-stretch border-l border-border bg-card py-2 transition-all"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Expand trade panel"
          onClick={() => setCollapsed(false)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="mt-4 origin-center rotate-90 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          Trade
        </span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Trade panel"
      className="animate-panel-in flex min-h-0 w-full min-w-0 shrink-0 flex-col border-l border-border bg-card md:w-72 md:max-w-[min(100%,20rem)] lg:w-80 lg:max-w-[min(100%,20rem)]"
    >
      <div className="panel-header">
        <h2 className="panel-header-title text-foreground">Execution Deck</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Collapse trade panel"
          onClick={() => setCollapsed(true)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div
        className={cn(
          "border-b border-border px-4 py-2.5 font-mono text-xs",
          openTrade ? "bg-success/5 text-success" : "text-muted-foreground",
        )}
        data-testid="trade-panel-open-status"
      >
        {openTrade
          ? `${openTrade.direction.toUpperCase()} OPEN @ ${openTrade.entryPrice.toFixed(5)}`
          : "No open position"}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-4">
          {draft ? (
            <TradeTicket
              draft={draft}
              symbol={symbol}
              validationError={validationError}
              onChange={updateDraft}
              onConfirm={confirmDraft}
              onCancel={cancelDraft}
            />
          ) : (
            <div className="section-card">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Quick entry
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">
                  <Kbd className="mr-1 border-0 bg-transparent p-0">L</Kbd> Long
                </Badge>
                <Badge variant="outline">
                  <Kbd className="mr-1 border-0 bg-transparent p-0">S</Kbd> Short
                </Badge>
              </div>
            </div>
          )}

          <RiskPanel />
          <PropFirmPanel />
          <TradeLog trades={trades} />
          <ImportExportPanel />
        </div>
      </ScrollArea>

      <Separator />
      <p className="px-4 py-2.5 text-[10px] leading-relaxed text-muted-foreground">
        <Kbd>L</Kbd>/<Kbd>S</Kbd> ticket · <Kbd>Enter</Kbd> confirm · <Kbd>Esc</Kbd> cancel ·{" "}
        <Kbd>X</Kbd> close
      </p>
    </aside>
  );
}
