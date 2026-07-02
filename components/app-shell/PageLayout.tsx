"use client";

import { CandleProvider } from "@/components/app-shell/CandleProvider";
import { LeftNav } from "@/components/app-shell/LeftNav";
import { TopStatusBar } from "@/components/app-shell/TopStatusBar";
import { PersistenceProvider } from "@/store/persistence-store";

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <PersistenceProvider>
      <CandleProvider>
        <div className="flex min-h-screen flex-col">
          <TopStatusBar compact />
          <div className="flex min-h-0 flex-1">
            <LeftNav />
            <main className="flex min-w-0 flex-1 flex-col">
              <header className="border-b border-border bg-card/80 px-6 py-6 lg:px-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Backtesting Lab
                </p>
                <h1 className="mt-1 text-2xl font-bold uppercase tracking-wide text-foreground lg:text-3xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </header>
              <div className="flex-1 px-6 py-8 lg:px-10">{children}</div>
            </main>
          </div>
        </div>
      </CandleProvider>
    </PersistenceProvider>
  );
}
