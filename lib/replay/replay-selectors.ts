import {
  getCurrentCandle,
  getVisibleCandles,
  isComplete,
  type ReplayEngineState,
} from "@/lib/replay/replay-engine";
import type { ReplaySession, ReplaySpeed, ReplayStatus } from "@/lib/replay/replay-types";

export function selectReplaySession(state: ReplayEngineState): ReplaySession {
  return state.session;
}

export function selectReplayStatus(state: ReplayEngineState): ReplayStatus {
  return state.session.status;
}

export function selectReplaySpeed(state: ReplayEngineState): ReplaySpeed {
  return state.session.speed;
}

export function selectCursorIndex(state: ReplayEngineState): number {
  return state.session.currentCursorIndex;
}

export function selectActiveTimeframe(state: ReplayEngineState) {
  return state.session.activeTimeframe;
}

export function selectLoadedCandles(state: ReplayEngineState) {
  return state.candles;
}

export function selectM1Candles(state: ReplayEngineState) {
  return state.m1Candles;
}

export function selectVisibleCandles(state: ReplayEngineState) {
  return getVisibleCandles(state);
}

export function selectVisibleCandleCount(state: ReplayEngineState): number {
  return getVisibleCandles(state).length;
}

export function selectCurrentCandle(state: ReplayEngineState) {
  return getCurrentCandle(state);
}

export function selectIsComplete(state: ReplayEngineState): boolean {
  return isComplete(state);
}

export {
  getCurrentCandle,
  getVisibleCandles,
  isComplete,
};

export function getVisibleCandleCount(state: ReplayEngineState): number {
  return selectVisibleCandleCount(state);
}
