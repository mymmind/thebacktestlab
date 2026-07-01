import { describe, expect, it } from "vitest";

import { aggregateCandles } from "@/lib/candles/candle-aggregation";
import { loadFixtureFromDisk } from "@/lib/candles/candle-fixtures";
import type { Candle } from "@/lib/candles/candle-types";
import {
  createReplaySession,
  isComplete,
  jumpToTimestamp,
  loadCandles,
  pause,
  play,
  setSpeed,
  setTimeframe,
  stepBackward,
  stepForward,
  type ReplayEngineState,
} from "@/lib/replay/replay-engine";
import {
  getCurrentCandle,
  getVisibleCandleCount,
  getVisibleCandles,
  selectReplayStatus,
} from "@/lib/replay/replay-selectors";
import { DEFAULT_VISIBLE_CANDLE_COUNT } from "@/lib/replay/replay-types";

function buildState(
  fixtureName: "aggregationM5" | "trendUp" = "aggregationM5",
  timeframe: "M1" | "M5" | "M15" = "M5",
): ReplayEngineState {
  const m1 = loadFixtureFromDisk(fixtureName, "EURUSD", "M1");
  const base = createReplaySession({ symbol: "EURUSD", activeTimeframe: timeframe });
  return loadCandles(base, m1);
}

function makeCandles(count: number, startMs = 1_000_000): Candle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `EURUSD-M1-${startMs + index * 60_000}`,
    symbol: "EURUSD",
    timeframe: "M1" as const,
    timestamp: startMs + index * 60_000,
    open: 1 + index * 0.001,
    high: 1.1 + index * 0.001,
    low: 0.9 + index * 0.001,
    close: 1.05 + index * 0.001,
    volume: 10,
  }));
}

describe("createReplaySession", () => {
  it("creates a session with defaults", () => {
    const state = createReplaySession({ symbol: "EURUSD" });

    expect(state.session).toMatchObject({
      symbol: "EURUSD",
      baseTimeframe: "M1",
      activeTimeframe: "M15",
      currentCursorIndex: 0,
      visibleCandleCount: DEFAULT_VISIBLE_CANDLE_COUNT,
      speed: "1x",
      status: "idle",
    });
    expect(state.session.id).toBeTruthy();
    expect(state.candles).toEqual([]);
    expect(state.m1Candles).toEqual([]);
  });
});

describe("loadCandles", () => {
  it("loads and aggregates candles for the active timeframe", () => {
    const state = buildState("aggregationM5", "M5");

    expect(state.candles.length).toBeGreaterThan(0);
    expect(state.m1Candles.length).toBeGreaterThan(0);
    expect(state.session.startTimestamp).toBe(state.candles[0]!.timestamp);
    expect(state.session.endTimestamp).toBe(
      state.candles[state.candles.length - 1]!.timestamp,
    );
    expect(state.session.currentCursorIndex).toBe(0);
    expect(state.session.status).toBe("idle");
  });

  it("handles empty candle input", () => {
    const base = createReplaySession({ symbol: "EURUSD" });
    const state = loadCandles(base, []);

    expect(state.candles).toEqual([]);
    expect(getCurrentCandle(state)).toBeNull();
    expect(getVisibleCandles(state)).toEqual([]);
    expect(isComplete(state)).toBe(false);
  });
});

describe("cursor movement", () => {
  it("steps forward and backward by one candle", () => {
    let state = buildState();

    const first = getCurrentCandle(state)!.timestamp;
    state = stepForward(state);
    expect(getCurrentCandle(state)!.timestamp).toBeGreaterThan(first);
    expect(state.session.currentCursorIndex).toBe(1);

    state = stepBackward(state);
    expect(getCurrentCandle(state)!.timestamp).toBe(first);
    expect(state.session.currentCursorIndex).toBe(0);
  });

  it("does not step backward before the start", () => {
    const state = buildState();
    const stepped = stepBackward(state);

    expect(stepped.session.currentCursorIndex).toBe(0);
    expect(stepped).toBe(state);
  });

  it("does not step forward past the end", () => {
    let state = buildState();
    const lastIndex = state.candles.length - 1;

    for (let index = 0; index < lastIndex + 5; index += 1) {
      state = stepForward(state);
    }

    expect(state.session.currentCursorIndex).toBe(lastIndex);
    expect(state.session.status).toBe("complete");
    expect(isComplete(state)).toBe(true);
  });

  it("jumps forward and backward by 10 candles", () => {
    const m1 = makeCandles(30);
    let state = loadCandles(
      createReplaySession({ symbol: "EURUSD", activeTimeframe: "M1" }),
      m1,
    );

    state = stepForward(state, 10);
    expect(state.session.currentCursorIndex).toBe(10);

    state = stepBackward(state, 10);
    expect(state.session.currentCursorIndex).toBe(0);
  });
});

describe("play and pause", () => {
  it("transitions between idle, playing, and paused", () => {
    let state = buildState();

    state = play(state);
    expect(selectReplayStatus(state)).toBe("playing");

    state = pause(state);
    expect(selectReplayStatus(state)).toBe("paused");

    state = play(state);
    expect(selectReplayStatus(state)).toBe("playing");
  });

  it("does not play when replay is complete", () => {
    let state = buildState();
    const lastIndex = state.candles.length - 1;

    for (let index = 0; index < lastIndex; index += 1) {
      state = stepForward(state);
    }

    const played = play(state);
    expect(played.session.status).toBe("complete");
  });
});

describe("speed", () => {
  it("updates replay speed", () => {
    const state = setSpeed(buildState(), "5x");
    expect(state.session.speed).toBe("5x");
  });
});

describe("timeframe switching", () => {
  it("preserves logical position when changing timeframe", () => {
    const m1 = loadFixtureFromDisk("aggregationM5", "EURUSD", "M1");
    let state = loadCandles(
      createReplaySession({ symbol: "EURUSD", activeTimeframe: "M1" }),
      m1,
    );

    state = stepForward(state, 7);
    const anchorTimestamp = getCurrentCandle(state)!.timestamp;

    state = setTimeframe(state, "M5");
    expect(state.session.activeTimeframe).toBe("M5");
    expect(getCurrentCandle(state)!.timestamp).toBeLessThanOrEqual(
      anchorTimestamp,
    );

    const m5AtCursor = getCurrentCandle(state)!.timestamp;
    const m5Aggregated = aggregateCandles(m1, "M5");
    const expectedIndex = m5Aggregated.findIndex(
      (candle) => candle.timestamp === m5AtCursor,
    );
    expect(state.session.currentCursorIndex).toBe(expectedIndex);
  });
});

describe("visible candles", () => {
  it("only exposes candles up to the cursor", () => {
    const m1 = makeCandles(50);
    let state = loadCandles(
      createReplaySession({ symbol: "EURUSD", activeTimeframe: "M1" }),
      m1,
    );

    state = stepForward(state, 10);
    const visible = getVisibleCandles(state);

    expect(visible).toHaveLength(11);
    expect(visible.every((candle) => candle.timestamp <= getCurrentCandle(state)!.timestamp)).toBe(
      true,
    );
    expect(visible[visible.length - 1]).toEqual(getCurrentCandle(state));
    expect(visible.some((candle) => candle.timestamp > getCurrentCandle(state)!.timestamp)).toBe(
      false,
    );
  });

  it("caps visible window at visibleCandleCount", () => {
    const m1 = makeCandles(200);
    let state = loadCandles(
      createReplaySession({
        symbol: "EURUSD",
        activeTimeframe: "M1",
        visibleCandleCount: 120,
      }),
      m1,
    );

    state = stepForward(state, 150);
    const visible = getVisibleCandles(state);

    expect(visible).toHaveLength(120);
    expect(getVisibleCandleCount(state)).toBe(120);
    expect(visible[0]!.timestamp).toBe(
      m1[state.session.currentCursorIndex - 119]!.timestamp,
    );
  });
});

describe("jumpToTimestamp", () => {
  it("moves the cursor to the matching candle", () => {
    const m1 = makeCandles(20);
    let state = loadCandles(
      createReplaySession({ symbol: "EURUSD", activeTimeframe: "M1" }),
      m1,
    );

    const target = m1[12]!.timestamp;
    state = jumpToTimestamp(state, target);

    expect(getCurrentCandle(state)!.timestamp).toBe(target);
    expect(state.session.currentCursorIndex).toBe(12);
  });
});

describe("isComplete", () => {
  it("is false at start and true at end", () => {
    let state = buildState();
    expect(isComplete(state)).toBe(false);

    const lastIndex = state.candles.length - 1;
    for (let index = 0; index < lastIndex; index += 1) {
      expect(isComplete(state)).toBe(false);
      state = stepForward(state);
    }

    expect(isComplete(state)).toBe(true);
  });
});

describe("edge cases", () => {
  it("handles stepping on empty candles", () => {
    const base = createReplaySession({ symbol: "EURUSD" });
    const state = loadCandles(base, []);

    expect(stepForward(state).session.currentCursorIndex).toBe(0);
    expect(stepBackward(state).session.currentCursorIndex).toBe(0);
    expect(play(state).session.status).toBe("idle");
  });

  it("handles jump on empty candles", () => {
    const base = createReplaySession({ symbol: "EURUSD" });
    const state = loadCandles(base, []);

    expect(jumpToTimestamp(state, 1_000_000).session.currentCursorIndex).toBe(0);
  });
});
