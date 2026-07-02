"use client";

import { evaluateChallenge } from "@/lib/trades/prop-firm-engine";
import { useSettingsStore } from "@/store/settings-store";
import { Badge } from "@/components/ui/badge";

export function PropFirmPanel() {
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const challenge = useSettingsStore((state) => state.challenge);
  const evaluation = evaluateChallenge(challenge, accountBalance);

  const targetBalance =
    challenge.startingBalance * (1 + challenge.profitTargetPercent);
  const progressPct =
    evaluation.profitTargetAmount > 0
      ? (evaluation.profitProgress / evaluation.profitTargetAmount) * 100
      : 0;

  return (
    <div className="section-card" data-testid="prop-firm-panel">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Prop Challenge
        </h3>
        <Badge
          variant={
            challenge.status === "failed"
              ? "danger"
              : challenge.status === "passed"
                ? "success"
                : "outline"
          }
        >
          {challenge.status}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono text-[11px]">
        <Stat label="Starting" value={challenge.startingBalance.toFixed(2)} />
        <Stat label="Current" value={accountBalance.toFixed(2)} />
        <Stat label="Target" value={targetBalance.toFixed(2)} />
        <Stat label="Daily loss" value={evaluation.dailyLossUsed.toFixed(2)} />
        <Stat
          label="Drawdown floor"
          value={evaluation.drawdownFloor.toFixed(2)}
          className="col-span-2"
        />
      </dl>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Target progress</span>
          <span className="font-mono normal-case">{progressPct.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>

      {challenge.failureReason ? (
        <p
          className="border border-destructive/30 bg-destructive/10 p-2 text-[11px] text-destructive"
          data-testid="challenge-failure-reason"
        >
          {challenge.failureReason}
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
