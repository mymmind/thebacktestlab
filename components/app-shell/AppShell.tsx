"use client";

import { useState } from "react";

import { ChartPanel } from "@/components/app-shell/ChartPanel";
import { CandleProvider } from "@/components/app-shell/CandleProvider";
import { KeyboardShortcutsOverlay } from "@/components/app-shell/KeyboardShortcutsOverlay";
import { LeftNav } from "@/components/app-shell/LeftNav";
import { ReplayControls } from "@/components/app-shell/ReplayControls";
import { ReplayKeyboardHandler } from "@/components/app-shell/ReplayKeyboardHandler";
import { TopStatusBar } from "@/components/app-shell/TopStatusBar";
import { TradeKeyboardHandler } from "@/components/app-shell/TradeKeyboardHandler";
import { TradePanel } from "@/components/app-shell/TradePanel";
import { PersistenceProvider } from "@/store/persistence-store";

export function AppShell() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <PersistenceProvider>
      <CandleProvider>
        <ReplayKeyboardHandler onToggleShortcuts={() => setShortcutsOpen((open) => !open)} />
        <TradeKeyboardHandler />
        <KeyboardShortcutsOverlay
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
        />
        <div className="flex h-screen flex-col overflow-hidden">
          <TopStatusBar />
          <div className="flex min-h-0 flex-1">
            <LeftNav />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,7.5fr)_minmax(0,2.5fr)]">
                <ChartPanel />
                <TradePanel />
              </div>
            </main>
          </div>
          <ReplayControls onShowShortcuts={() => setShortcutsOpen(true)} />
        </div>
      </CandleProvider>
    </PersistenceProvider>
  );
}
