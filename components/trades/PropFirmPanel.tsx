"use client";

import { evaluateChallenge } from "@/lib/trades/prop-firm-engine";
import { useSettingsStore } from "@/store/settings-store";

export function PropFirmPanel() {
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const challenge = useSettingsStore((state) => state.challenge);
  const evaluation = evaluateChallenge(challenge, accountBalance);

  return (
    <div
      className="space-y-2 border-2 border-border p-3"
      data-testid="prop-firm-panel"
    >
      <h3 className="text-xs font-bold uppercase tracking-widest">
        Prop Challenge
      </h3>
      <p className="text-xs font-mono">
        Starting: {challenge.startingBalance.toFixed(2)}
      </p>
      <p className="text-xs font-mono">
        Current: {accountBalance.toFixed(2)}
      </p>
      <p className="text-xs font-mono">
        Target: {(challenge.startingBalance * (1 + challenge.profitTargetPercent)).toFixed(2)}
      </p>
      <p className="text-xs font-mono">
        Daily loss used: {evaluation.dailyLossUsed.toFixed(2)}
      </p>
      <p className="text-xs font-mono">
        Drawdown floor: {evaluation.drawdownFloor.toFixed(2)}
      </p>
      {challenge.failureReason ? (
        <p className="text-xs text-destructive" data-testid="challenge-failure-reason">
          {challenge.failureReason}
        </p>
      ) : null}
    </div>
  );
}
