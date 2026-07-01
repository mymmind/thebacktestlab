"use client";

import { evaluateChallenge } from "@/lib/trades/prop-firm-engine";
import { useSettingsStore } from "@/store/settings-store";

export function RiskPanel() {
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const riskPercent = useSettingsStore((state) => state.riskPercent);
  const challenge = useSettingsStore((state) => state.challenge);
  const setRiskPercent = useSettingsStore((state) => state.setRiskPercent);
  const evaluation = evaluateChallenge(challenge, accountBalance);

  return (
    <div className="space-y-2 border-2 border-border p-3" data-testid="risk-panel">
      <h3 className="text-xs font-bold uppercase tracking-widest">Risk</h3>
      <label className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Risk %</span>
        <select
          aria-label="Risk percent"
          className="border border-border bg-background px-2 py-0.5 font-mono"
          data-testid="risk-percent-selector"
          value={riskPercent}
          onChange={(event) => setRiskPercent(Number(event.target.value))}
        >
          <option value={0.001}>0.10%</option>
          <option value={0.0025}>0.25%</option>
          <option value={0.0035}>0.35%</option>
          <option value={0.005}>0.50%</option>
        </select>
      </label>
      <p className="text-xs font-mono">
        Per-trade risk: {(accountBalance * riskPercent).toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        SL-first on same-candle SL/TP touches (conservative).
      </p>
      <div className="space-y-1 text-xs font-mono">
        <p>
          Drawdown used: {evaluation.maxDrawdownUsed.toFixed(2)} /{" "}
          {(challenge.startingBalance * challenge.maxOverallDrawdownPercent).toFixed(2)}
        </p>
        <p>
          Profit progress: {evaluation.profitProgress.toFixed(2)} /{" "}
          {evaluation.profitTargetAmount.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
