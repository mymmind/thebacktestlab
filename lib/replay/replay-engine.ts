import { aggregateCandles } from "@/lib/candles/candle-aggregation";
import type { Candle, SampleSymbol, Timeframe } from "@/lib/candles/candle-types";
import {
  DEFAULT_VISIBLE_CANDLE_COUNT,
  type ReplaySession,
  type ReplaySpeed,
} from "@/lib/replay/replay-types";

export type ReplayEngineState = {
  session: ReplaySession;
  m1Candles: Candle[];
  candles: Candle[];
};

type CreateReplaySessionOptions = {
  symbol: SampleSymbol;
  activeTimeframe?: Timeframe;
  visibleCandleCount?: number;
  speed?: ReplaySpeed;
  name?: string;
  now?: number;
  id?: string;
};

function touchSession(
  session: ReplaySession,
  patch: Partial<ReplaySession>,
  now = Date.now(),
): ReplaySession {
  return {
    ...session,
    ...patch,
    updatedAt: now,
  };
}

function findIndexForTimestamp(candles: Candle[], timestamp: number): number {
  if (candles.length === 0) {
    return 0;
  }

  let low = 0;
  let high = candles.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candle = candles[mid]!;

    if (candle.timestamp <= timestamp) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}

function clampCursor(state: ReplayEngineState, index: number): number {
  if (state.candles.length === 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, state.candles.length - 1));
}

function deriveStatus(
  session: ReplaySession,
  cursorIndex: number,
  candleCount: number,
): ReplaySession["status"] {
  if (candleCount === 0) {
    return session.status === "playing" ? "paused" : session.status;
  }

  if (cursorIndex >= candleCount - 1) {
    return "complete";
  }

  if (session.status === "complete") {
    return "paused";
  }

  return session.status;
}

export function createReplaySession(
  options: CreateReplaySessionOptions,
): ReplayEngineState {
  const now = options.now ?? Date.now();

  return {
    session: {
      id: options.id ?? `replay-${now}-${options.symbol}`,
      name: options.name ?? `${options.symbol} replay`,
      symbol: options.symbol,
      baseTimeframe: "M1",
      activeTimeframe: options.activeTimeframe ?? "M15",
      startTimestamp: 0,
      endTimestamp: 0,
      currentCursorIndex: 0,
      visibleCandleCount:
        options.visibleCandleCount ?? DEFAULT_VISIBLE_CANDLE_COUNT,
      speed: options.speed ?? "1x",
      status: "idle",
      createdAt: now,
      updatedAt: now,
    },
    m1Candles: [],
    candles: [],
  };
}

export function loadCandles(
  state: ReplayEngineState,
  m1Candles: Candle[],
): ReplayEngineState {
  const candles = aggregateCandles(m1Candles, state.session.activeTimeframe);
  const now = Date.now();

  return {
    ...state,
    m1Candles,
    candles,
    session: touchSession(
      state.session,
      {
        startTimestamp: candles[0]?.timestamp ?? 0,
        endTimestamp: candles[candles.length - 1]?.timestamp ?? 0,
        currentCursorIndex: 0,
        status: "idle",
      },
      now,
    ),
  };
}

export function stepForward(
  state: ReplayEngineState,
  count = 1,
): ReplayEngineState {
  if (state.candles.length === 0 || count <= 0) {
    return state;
  }

  const nextIndex = clampCursor(
    state,
    state.session.currentCursorIndex + count,
  );
  const status = deriveStatus(state.session, nextIndex, state.candles.length);

  return {
    ...state,
    session: touchSession(state.session, {
      currentCursorIndex: nextIndex,
      status,
    }),
  };
}

export function stepBackward(
  state: ReplayEngineState,
  count = 1,
): ReplayEngineState {
  if (state.candles.length === 0 || count <= 0) {
    return state;
  }

  const nextIndex = clampCursor(
    state,
    state.session.currentCursorIndex - count,
  );

  if (nextIndex === state.session.currentCursorIndex) {
    return state;
  }

  const status =
    state.session.status === "complete" ? "paused" : state.session.status;

  return {
    ...state,
    session: touchSession(state.session, {
      currentCursorIndex: nextIndex,
      status,
    }),
  };
}

export function play(state: ReplayEngineState): ReplayEngineState {
  if (state.candles.length === 0) {
    return state;
  }

  if (isComplete(state)) {
    return state;
  }

  return {
    ...state,
    session: touchSession(state.session, { status: "playing" }),
  };
}

export function pause(state: ReplayEngineState): ReplayEngineState {
  if (state.session.status !== "playing") {
    return state;
  }

  return {
    ...state,
    session: touchSession(state.session, { status: "paused" }),
  };
}

export function jumpToTimestamp(
  state: ReplayEngineState,
  timestamp: number,
): ReplayEngineState {
  if (state.candles.length === 0) {
    return state;
  }

  const nextIndex = findIndexForTimestamp(state.candles, timestamp);
  const status = deriveStatus(state.session, nextIndex, state.candles.length);

  return {
    ...state,
    session: touchSession(state.session, {
      currentCursorIndex: nextIndex,
      status,
    }),
  };
}

export function setSpeed(
  state: ReplayEngineState,
  speed: ReplaySpeed,
): ReplayEngineState {
  return {
    ...state,
    session: touchSession(state.session, { speed }),
  };
}

export function setTimeframe(
  state: ReplayEngineState,
  timeframe: Timeframe,
): ReplayEngineState {
  if (timeframe === state.session.activeTimeframe) {
    return state;
  }

  const anchorTimestamp =
    state.candles[state.session.currentCursorIndex]?.timestamp ??
    state.session.startTimestamp;
  const candles = aggregateCandles(state.m1Candles, timeframe);
  const nextIndex = findIndexForTimestamp(candles, anchorTimestamp);
  const status = deriveStatus(state.session, nextIndex, candles.length);

  return {
    ...state,
    candles,
    session: touchSession(state.session, {
      activeTimeframe: timeframe,
      startTimestamp: candles[0]?.timestamp ?? 0,
      endTimestamp: candles[candles.length - 1]?.timestamp ?? 0,
      currentCursorIndex: nextIndex,
      status,
    }),
  };
}

export function getVisibleCandles(state: ReplayEngineState): Candle[] {
  if (state.candles.length === 0 || state.session.currentCursorIndex < 0) {
    return [];
  }

  const endIndex = state.session.currentCursorIndex;
  const startIndex = Math.max(
    0,
    endIndex - state.session.visibleCandleCount + 1,
  );

  return state.candles.slice(startIndex, endIndex + 1);
}

export function getCurrentCandle(state: ReplayEngineState): Candle | null {
  if (state.candles.length === 0) {
    return null;
  }

  return state.candles[state.session.currentCursorIndex] ?? null;
}

export function isComplete(state: ReplayEngineState): boolean {
  if (state.candles.length === 0) {
    return false;
  }

  return (
    state.session.currentCursorIndex >= state.candles.length - 1 &&
    state.session.status === "complete"
  );
}

export function getSpeedIntervalMs(speed: ReplaySpeed): number | null {
  switch (speed) {
    case "manual":
      return null;
    case "1x":
      return 500;
    case "2x":
      return 250;
    case "5x":
      return 100;
    case "10x":
      return 50;
    case "instant":
      return 0;
    default:
      return 500;
  }
}
