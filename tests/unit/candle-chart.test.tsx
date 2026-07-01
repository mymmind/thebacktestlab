import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Candle } from "@/lib/candles/candle-types";

const mockSetData = vi.fn();
const mockSetMarkers = vi.fn();
const mockFitContent = vi.fn();
const mockDetach = vi.fn();
const mockRemove = vi.fn();
const mockResize = vi.fn();

vi.mock("lightweight-charts", () => ({
  ColorType: { Solid: "solid" },
  CandlestickSeries: "CandlestickSeries",
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => ({
      setData: mockSetData,
    })),
    timeScale: vi.fn(() => ({
      fitContent: mockFitContent,
    })),
    resize: mockResize,
    remove: mockRemove,
  })),
  createSeriesMarkers: vi.fn(() => ({
    setMarkers: mockSetMarkers,
    detach: mockDetach,
  })),
}));

const visibleCandles: Candle[] = [
  {
    id: "EURUSD-M15-1",
    symbol: "EURUSD",
    timeframe: "M15",
    timestamp: 1_700_000_000_000,
    open: 1.1,
    high: 1.2,
    low: 1.0,
    close: 1.15,
  },
  {
    id: "EURUSD-M15-2",
    symbol: "EURUSD",
    timeframe: "M15",
    timestamp: 1_700_000_900_000,
    open: 1.15,
    high: 1.25,
    low: 1.05,
    close: 1.2,
  },
];

const mockUseCandleContext = vi.fn();

vi.mock("@/components/app-shell/CandleProvider", () => ({
  useCandleContext: () => mockUseCandleContext(),
}));

describe("CandleChart", () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    mockUseCandleContext.mockReturnValue({
      visibleCandles,
      currentCandle: visibleCandles[1],
      isLoading: false,
      error: null,
      timeframe: "M15",
      symbol: "EURUSD",
    });
  });

  it("renders chart container and exposes non-canvas candle count", async () => {
    const { CandleChart } = await import("@/components/chart/CandleChart");

    render(<CandleChart />);

    expect(screen.getByTestId("candle-chart")).toBeInTheDocument();
    expect(screen.getByTestId("chart-candle-count")).toHaveTextContent("2");
    expect(mockSetData).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ close: 1.15 }),
        expect.objectContaining({
          close: 1.2,
          color: "#fbbf24",
        }),
      ]),
    );
    expect(mockSetMarkers).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          text: "Replay",
          shape: "circle",
        }),
      ]),
    );
    expect(screen.getByTestId("chart-ready")).toHaveTextContent("ready");
  });

  it("shows loading state without chart data", async () => {
    mockUseCandleContext.mockReturnValue({
      visibleCandles: [],
      currentCandle: null,
      isLoading: true,
      error: null,
      timeframe: "M15",
      symbol: "EURUSD",
    });

    const { CandleChart } = await import("@/components/chart/CandleChart");

    render(<CandleChart />);

    expect(screen.getByText("Loading chart…")).toBeInTheDocument();
    expect(screen.getByTestId("chart-ready")).toHaveTextContent("pending");
  });
});
