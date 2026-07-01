import type { TradeDirection } from "@/lib/trades/trade-types";
import { calculateRiskPerUnit } from "@/lib/trades/r-multiple";

export type RiskEngineInput = {
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  direction: TradeDirection;
};

export type RiskEngineOutput = {
  riskAmount: number;
  riskDistance: number;
  positionSizeApprox: number;
};

export function calculateRisk(input: RiskEngineInput): RiskEngineOutput {
  const riskAmount = input.accountBalance * input.riskPercent;
  const riskDistance = calculateRiskPerUnit(
    input.direction,
    input.entryPrice,
    input.stopLossPrice,
  );

  const positionSizeApprox =
    riskDistance > 0 ? riskAmount / riskDistance : 0;

  return {
    riskAmount,
    riskDistance,
    positionSizeApprox,
  };
}
