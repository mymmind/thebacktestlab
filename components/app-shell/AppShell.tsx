"use client";

import { ChartPanel } from "@/components/app-shell/ChartPanel";
import { CandleProvider } from "@/components/app-shell/CandleProvider";
import { LeftNav } from "@/components/app-shell/LeftNav";
import { ReplayControls } from "@/components/app-shell/ReplayControls";
import { ReplayKeyboardHandler } from "@/components/app-shell/ReplayKeyboardHandler";
import { TopStatusBar } from "@/components/app-shell/TopStatusBar";
import { TradeKeyboardHandler } from "@/components/app-shell/TradeKeyboardHandler";
import { TradePanel } from "@/components/app-shell/TradePanel";
import { PersistenceProvider } from "@/store/persistence-store";

export function AppShell() {
  return (
    <PersistenceProvider>
      <CandleProvider>
        <ReplayKeyboardHandler />
        <TradeKeyboardHandler />
        <div className="flex h-full min-h-screen flex-col">
          <TopStatusBar />
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <LeftNav />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                <ChartPanel />
                <TradePanel />
              </div>
            </main>
          </div>
          <ReplayControls />
        </div>
      </CandleProvider>
    </PersistenceProvider>
  );
}
