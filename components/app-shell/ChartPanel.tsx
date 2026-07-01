"use client";

import dynamic from "next/dynamic";

import { CurrentCandleStatus } from "@/components/app-shell/CurrentCandleStatus";

const CandleChart = dynamic(
  () =>
    import("@/components/chart/CandleChart").then((module) => module.CandleChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
        Loading chart…
      </div>
    ),
  },
);

export function ChartPanel() {
  return (
    <section
      aria-label="Chart panel"
      className="flex min-h-0 min-w-0 flex-1 flex-col border-r-2 border-border"
    >
      <div className="flex min-h-[320px] min-w-0 flex-1 flex-col">
        <CandleChart />
      </div>
      <CurrentCandleStatus />
    </section>
  );
}
