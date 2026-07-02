"use client";

import { evaluateChallenge } from "@/lib/trades/prop-firm-engine";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";

export function RiskPanel() {
  const accountBalance = useSettingsStore((state) => state.accountBalance);
  const riskPercent = useSettingsStore((state) => state.riskPercent);
  const challenge = useSettingsStore((state) => state.challenge);
  const setRiskPercent = useSettingsStore((state) => state.setRiskPercent);
  const evaluation = evaluateChallenge(challenge, accountBalance);

  const drawdownMax =
    challenge.startingBalance * challenge.maxOverallDrawdownPercent;
  const drawdownPct = drawdownMax > 0 ? (evaluation.maxDrawdownUsed / drawdownMax) * 100 : 0;
  const profitPct =
    evaluation.profitTargetAmount > 0
      ? (evaluation.profitProgress / evaluation.profitTargetAmount) * 100
      : 0;

  return (
    <div className="section-card" data-testid="risk-panel">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Risk Engine
      </h3>

      <label className="flex items-center justify-between gap-3 text-[11px]">
        <span className="text-muted-foreground">Risk %</span>
        <select
          aria-label="Risk percent"
          className="terminal-select"
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

      <div className="space-y-2 font-mono text-[11px]">
        <p>
          Per-trade risk:{" "}
          <span className="text-foreground">
            {(accountBalance * riskPercent).toFixed(2)}
          </span>
        </p>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          SL-first on same-candle SL/TP touches (conservative).
        </p>
      </div>

      <div className="space-y-3">
        <MetricBar
          label="Drawdown used"
          value={evaluation.maxDrawdownUsed.toFixed(2)}
          max={drawdownMax.toFixed(2)}
          percent={drawdownPct}
          variant="danger"
        />
        <MetricBar
          label="Profit progress"
          value={evaluation.profitProgress.toFixed(2)}
          max={evaluation.profitTargetAmount.toFixed(2)}
          percent={profitPct}
          variant="success"
        />
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  max,
  percent,
  variant,
}: {
  label: string;
  value: string;
  max: string;
  percent: number;
  variant: "success" | "danger";
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono normal-case">
          {value} / {max}
        </span>
      </div>
      <div className="h-1 bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            variant === "success" ? "bg-success" : "bg-destructive",
          )}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
