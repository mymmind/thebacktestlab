import { create } from "zustand";

import { loadSampleCandles } from "@/lib/candles/candle-loader";
import type { SampleSymbol, Timeframe } from "@/lib/candles/candle-types";
import {
  createReplaySession,
  getSpeedIntervalMs,
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
  getVisibleCandles,
  isComplete,
  selectCurrentCandle,
  selectLoadedCandles,
  selectM1Candles,
  selectReplaySession,
  selectReplaySpeed,
  selectReplayStatus,
  selectVisibleCandleCount,
} from "@/lib/replay/replay-selectors";
import type { ReplaySpeed } from "@/lib/replay/replay-types";
import { resolveTradesForCandle } from "@/store/trade-resolution-bridge";
import { registerReplayStateReader } from "@/store/replay-accessor";

function resolveTradesForCurrentCandle(state: ReplayEngineState) {
  const candle = selectCurrentCandle(state);
  if (candle) {
    resolveTradesForCandle(candle);
  }
}

type ReplayStoreState = ReplayEngineState & {
  isLoading: boolean;
  error: string | null;
  loadSymbol: (symbol: SampleSymbol) => Promise<void>;
  setSymbol: (symbol: SampleSymbol) => void;
  setActiveTimeframe: (timeframe: Timeframe) => void;
  stepForward: (count?: number) => void;
  stepBackward: (count?: number) => void;
  togglePlayPause: () => void;
  playReplay: () => void;
  pauseReplay: () => void;
  setReplaySpeed: (speed: ReplaySpeed) => void;
  jumpToTimestamp: (timestamp: number) => void;
  stopPlayback: () => void;
};

const initialEngine = createReplaySession({ symbol: "EURUSD" });

let loadGeneration = 0;
let playbackTimer: ReturnType<typeof setInterval> | null = null;
let instantPlaybackActive = false;

export const useReplayStore = create<ReplayStoreState>((set, get) => {
  registerReplayStateReader(() => get());

  function stopPlayback() {
    if (playbackTimer) {
      clearInterval(playbackTimer);
      playbackTimer = null;
    }
    instantPlaybackActive = false;
  }

  function startPlayback() {
    const state = get();
    if (state.session.status !== "playing" || isComplete(state)) {
      return;
    }

    const intervalMs = getSpeedIntervalMs(state.session.speed);
    if (intervalMs === null) {
      set({ session: pause(state).session });
      return;
    }

    stopPlayback();

    const advance = () => {
      const current = get();
      if (current.session.status !== "playing") {
        stopPlayback();
        return;
      }

      const next = stepForward(current);
      set(next);
      resolveTradesForCurrentCandle(next);

      if (isComplete(next)) {
        stopPlayback();
      }
    };

    if (intervalMs === 0) {
      instantPlaybackActive = true;

      const runInstant = () => {
        if (!instantPlaybackActive) {
          return;
        }

        const current = get();
        if (current.session.status !== "playing") {
          stopPlayback();
          return;
        }

        advance();

        if (
          instantPlaybackActive &&
          get().session.status === "playing" &&
          !isComplete(get())
        ) {
          requestAnimationFrame(runInstant);
        }
      };

      requestAnimationFrame(runInstant);
      return;
    }

    playbackTimer = setInterval(advance, intervalMs);
  }

  return {
    ...initialEngine,
    isLoading: true,
    error: null,
    stopPlayback,

    async loadSymbol(symbol) {
      const generation = ++loadGeneration;
      set({ isLoading: true, error: null });
      stopPlayback();

      try {
        const m1Candles = await loadSampleCandles(symbol, "M1");
        if (generation !== loadGeneration) {
          return;
        }

        const base = createReplaySession({
          symbol,
          activeTimeframe: get().session.activeTimeframe,
        });
        const next = loadCandles(base, m1Candles);
        set({ ...next, isLoading: false, error: null });
      } catch (loadError) {
        if (generation !== loadGeneration) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load candles";
        set({
          ...createReplaySession({
            symbol,
            activeTimeframe: get().session.activeTimeframe,
          }),
          isLoading: false,
          error: message,
        });
      }
    },

    setSymbol(symbol) {
      void get().loadSymbol(symbol);
    },

    setActiveTimeframe(timeframe) {
      stopPlayback();
      const next = setTimeframe(get(), timeframe);
      set(next);
    },

    stepForward(count = 1) {
      stopPlayback();
      const next = stepForward(get(), count);
      set({
        ...next,
        session: {
          ...next.session,
          status:
            next.session.status === "complete" ? "complete" : "paused",
        },
      });
      resolveTradesForCurrentCandle(next);
    },

    stepBackward(count = 1) {
      stopPlayback();
      const next = stepBackward(get(), count);
      set(next);
    },

    playReplay() {
      const next = play(get());
      set(next);
      if (next.session.status === "playing") {
        startPlayback();
      }
    },

    pauseReplay() {
      stopPlayback();
      const next = pause(get());
      set(next);
    },

    togglePlayPause() {
      if (get().session.status === "playing") {
        get().pauseReplay();
      } else {
        get().playReplay();
      }
    },

    setReplaySpeed(speed) {
      const wasPlaying = get().session.status === "playing";
      stopPlayback();
      const next = setSpeed(get(), speed);
      set(next);
      if (wasPlaying) {
        get().playReplay();
      }
    },

    jumpToTimestamp(timestamp) {
      stopPlayback();
      const next = jumpToTimestamp(get(), timestamp);
      set(next);
    },
  };
});

export function useReplaySelectors() {
  const state = useReplayStore();
  return {
    session: selectReplaySession(state),
    status: selectReplayStatus(state),
    speed: selectReplaySpeed(state),
    m1Candles: selectM1Candles(state),
    candles: selectLoadedCandles(state),
    currentCandle: selectCurrentCandle(state),
    visibleCandles: getVisibleCandles(state),
    visibleCandleCount: selectVisibleCandleCount(state),
    cursorIndex: state.session.currentCursorIndex,
    isLoading: state.isLoading,
    error: state.error,
    symbol: state.session.symbol,
    timeframe: state.session.activeTimeframe,
    isComplete: isComplete(state),
  };
}
