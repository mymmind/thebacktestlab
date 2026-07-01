import type { TradeDirection } from "@/lib/trades/trade-types";

export function calculateRiskPerUnit(
  direction: TradeDirection,
  entryPrice: number,
  stopLossPrice: number,
): number {
  return direction === "long"
    ? entryPrice - stopLossPrice
    : stopLossPrice - entryPrice;
}

export function calculateRMultiple(
  direction: TradeDirection,
  entryPrice: number,
  stopLossPrice: number,
  exitPrice: number,
): number {
  const riskPerUnit = calculateRiskPerUnit(
    direction,
    entryPrice,
    stopLossPrice,
  );

  if (riskPerUnit <= 0) {
    return 0;
  }

  const rewardPerUnit =
    direction === "long"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;

  return rewardPerUnit / riskPerUnit;
}

export function calculatePotentialR(
  direction: TradeDirection,
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number,
): number {
  return calculateRMultiple(
    direction,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
  );
}

export function calculateResultAmount(
  riskAmount: number,
  resultR: number,
): number {
  return riskAmount * resultR;
}
