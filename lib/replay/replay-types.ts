import type { SampleSymbol, Timeframe } from "@/lib/candles/candle-types";

export type ReplaySpeed = "manual" | "1x" | "2x" | "5x" | "10x" | "instant";

export type ReplayStatus = "idle" | "playing" | "paused" | "complete";

export type ReplaySession = {
  id: string;
  name: string;
  symbol: SampleSymbol;
  baseTimeframe: "M1";
  activeTimeframe: Timeframe;
  startTimestamp: number;
  endTimestamp: number;
  currentCursorIndex: number;
  visibleCandleCount: number;
  speed: ReplaySpeed;
  status: ReplayStatus;
  createdAt: number;
  updatedAt: number;
};

export const DEFAULT_VISIBLE_CANDLE_COUNT = 120;

export const REPLAY_SPEEDS: ReplaySpeed[] = [
  "manual",
  "1x",
  "2x",
  "5x",
  "10x",
  "instant",
];
