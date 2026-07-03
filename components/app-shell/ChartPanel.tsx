"use client";

import dynamic from "next/dynamic";

import { CurrentCandleStatus } from "@/components/app-shell/CurrentCandleStatus";

const CandleChart = dynamic(
  () =>
    import("@/components/chart/CandleChart").then((module) => module.CandleChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-background text-xs uppercase tracking-wider text-muted-foreground">
        Initializing chart viewport…
      </div>
    ),
  },
);

export function ChartPanel() {
  return (
    <section
      aria-label="Chart panel"
      className="flex min-h-0 min-w-0 w-full flex-1 flex-col border-r border-border bg-background md:min-w-[min(100%,480px)]"
    >
      <div className="panel-header">
        <span className="panel-header-title">Price Action Viewport</span>
        <span className="font-mono text-[10px] text-muted-foreground">LIVE REPLAY</span>
      </div>
      <div className="chart-viewport flex min-h-[320px] min-w-0 flex-1 flex-col">
        <CandleChart />
      </div>
      <CurrentCandleStatus />
    </section>
  );
}
