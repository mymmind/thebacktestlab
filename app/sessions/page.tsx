import { List, Clock } from "lucide-react";

import { PageLayout } from "@/components/app-shell/PageLayout";

export default function SessionsPage() {
  return (
    <PageLayout
      title="Sessions"
      subtitle="Session archives and replay history. Structured review starts here."
    >
      <div className="empty-state max-w-xl">
        <div className="mb-4 flex size-12 items-center justify-center border border-border bg-muted">
          <List className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Milestone 3
        </p>
        <h2 className="mt-2 text-lg font-bold uppercase tracking-wide">
          Session management incoming
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Named replay sessions, date ranges, and performance snapshots will land
          here. For now, use the workspace to run disciplined replays and export
          your state from the execution deck.
        </p>
        <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          <span>Planned: structured session archives</span>
        </div>
      </div>
    </PageLayout>
  );
}
