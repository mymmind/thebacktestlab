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
        <div
          className="flex h-screen w-full min-w-0 flex-col overflow-hidden bg-background"
          data-testid="workspace-shell"
        >
          <TopStatusBar />
          <div className="flex min-h-0 w-full min-w-0 flex-1">
            <LeftNav />
            <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col md:flex-row">
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
