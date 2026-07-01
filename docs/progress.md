# Progress

## Milestone 1: Project Setup

### Implemented

- Next.js 16 App Router scaffold (TypeScript, Tailwind CSS v4, ESLint, `@/*` alias, no `src/`)
- shadcn/ui initialized with CSS variables; button, separator, scroll-area components
- Vitest + React Testing Library unit test setup
- Playwright E2E setup with Chromium, webServer, trace/video on failure
- Near-black brutalist dark theme (`dark` class on `<html>`)
- App shell at `/workspace`: TopStatusBar, LeftNav, ChartPanel, TradePanel, ReplayControls
- Placeholder routes: `/sessions`, `/journal`, `/stats`
- Root `/` redirects to `/workspace`
- Test-friendly `data-testid` hooks on status placeholders (EURUSD, M15, candle timestamp/close, account balance, challenge status)
- `npm run verify` gate: typecheck → lint → unit tests → E2E → production build

### Tests Added

- `tests/unit/smoke.test.ts` — `cn()` class merge sanity check
- `tests/e2e/workspace.spec.ts` — workspace load, default symbol, candle status

### Commands Run

```bash
npm run verify
```

### Result

- Passed

## Milestone 2: Candle Engine

### Implemented

- `lib/candles/candle-types.ts` — `Candle`, `Timeframe`, symbol/timeframe constants
- `lib/candles/timeframe-utils.ts` — bucket alignment and aggregation eligibility helpers
- `lib/candles/candle-normalizer.ts` — CSV parsing, Zod validation, sorting, malformed-row rejection
- `lib/candles/candle-aggregation.ts` — pure `aggregateCandles()` with OHLCV bucket rules
- `lib/candles/candle-loader.ts` — fetch/load sample CSV from `/public/sample-data`
- `lib/candles/candle-fixtures.ts` — test fixture path helpers and disk loader
- `lib/validation/schemas.ts` — Zod schemas for candle rows and normalized candles
- Sample M1 CSV data (240 rows each): `EURUSD_M1_sample.csv`, `GBPUSD_M1_sample.csv`, `XAUUSD_M1_sample.csv`
- Deterministic scenario fixtures in `tests/fixtures/` (trend, TP/SL, drawdown, aggregation)
- `CandleProvider` context — loads EURUSD on mount, symbol/timeframe selectors, aggregation
- `CurrentCandleStatus` and `TopStatusBar` wired to loaded/aggregated candle data

### Tests Added

- `tests/unit/candles.test.ts` — parsing, validation, sorting, aggregation (M1→M5/M15/H1, gaps, unordered, invalid), fixture catalog (19 tests)
- `tests/e2e/workspace.spec.ts` — enhanced default load assertions against computed M15 candle; symbol switch; timeframe aggregation count (3 tests)

### Commands Run

```bash
npm run verify
```

### Result

- Passed (20 unit tests, 3 E2E tests)

## Milestone 3: Replay Engine

### Implemented

- `lib/replay/replay-types.ts` — `ReplaySession`, `ReplaySpeed`, `ReplayStatus`, defaults
- `lib/replay/replay-engine.ts` — pure deterministic engine: `createReplaySession`, `loadCandles`, `stepForward`/`stepBackward`, `play`/`pause`, `jumpToTimestamp`, `setSpeed`, `setTimeframe`, `getVisibleCandles`, `getCurrentCandle`, `isComplete`
- `lib/replay/replay-selectors.ts` — selectors for session, status, visible/current candle, loaded candles
- `store/replay-store.ts` — Zustand store integrating engine with M1 candle loading, playback timers, symbol/timeframe actions
- `CandleProvider` refactored to initialize replay store; `useCandleContext` adapter for UI components
- `ReplayControls` wired to step/play/pause actions with `data-testid` hooks
- `ReplayKeyboardHandler` — ArrowRight/Left, Shift+ArrowRight/Left (+/-10), Space play/pause
- `CurrentCandleStatus` shows replay cursor candle, visible window count (max 120, no future candles)
- `TopStatusBar` symbol/timeframe selectors drive replay `setSymbol` / `setTimeframe` (logical cursor preserved on TF change)
- Added `zustand` dependency

### Tests Added

- `tests/unit/replay-engine.test.ts` — cursor movement, play/pause, speed, timeframe preservation, visible window cap, jump, isComplete, edge cases (17 tests)
- `tests/e2e/workspace.spec.ts` — ArrowRight advances timestamp with stable 120-candle window on M1; Space toggles play/pause (2 new tests, 5 total)

### Commands Run

```bash
npm run verify
```

### Result

- Passed (37 unit tests, 5 E2E tests)

## Milestone 4: Chart Integration

### Implemented

- Installed `lightweight-charts` (v5)
- `lib/chart/chart-utils.ts` — candle-to-chart mapping, dark theme options, current-candle highlight color
- `components/chart/CandleChart.tsx` — TradingView Lightweight Charts candlestick series with crosshair, price/time scales, ResizeObserver responsive resize, replay cursor marker + last-bar highlight
- `components/app-shell/ChartPanel.tsx` — dynamic import (`ssr: false`) of `CandleChart`; chart dominates panel layout
- Chart renders only `visibleCandles` from replay store (no future candles)
- `data-testid` hooks: `candle-chart`, `chart-ready`, `chart-candle-count` for non-canvas E2E assertions
- Review fixes: `loadSymbol` race guard via generation counter; playback timers moved to module scope (no spurious store re-renders); playback cleanup on provider unmount

### Tests Added

- `tests/unit/chart-utils.test.ts` — timestamp conversion, OHLC mapping, last-candle highlight (3 tests)
- `tests/unit/candle-chart.test.tsx` — chart wrapper state with mocked lightweight-charts (2 tests)
- `tests/e2e/workspace.spec.ts` — enhanced chart workspace load, canvas presence, timeframe switch updates chart candle count (5 E2E total)

### Commands Run

```bash
npm run verify
```

### Result

- Passed (42 unit tests, 5 E2E tests)

## Milestone 5: Trade Engine

### Implemented

- `lib/trades/trade-types.ts` — Trade, TradeDraft, RuleChecklist, defaults (200k balance, 0.25% risk)
- `lib/trades/r-multiple.ts` — R-multiple and result amount calculations
- `lib/trades/risk-engine.ts` — risk amount, distance, position size approximation
- `lib/trades/trade-engine.ts` — validation, trade creation, SL/TP detection, manual close
- `store/trade-store.ts` — draft ticket, confirm/cancel, open trade management
- `store/settings-store.ts` — account balance and risk percent
- `components/trades/TradeTicket.tsx`, `TradeLog.tsx`, `RiskPanel.tsx`
- `components/app-shell/TradeKeyboardHandler.tsx` — L/S, Enter, Esc, X shortcuts
- `TradePanel` wired with ticket, log, and risk panel
- `CurrentCandleStatus` shows open trade status via `data-testid="open-trade-status"`

### Tests Added

- `tests/unit/trade-engine.test.ts` — R-multiple, risk, validation, TP/SL/same-candle resolution (12 tests)
- `tests/e2e/trades.spec.ts` — Test 4 long trade, invalid SL blocked (2 tests)

### Commands Run

```bash
npm run verify
```

### Result

- Passed

## Milestone 6: Automatic Trade Resolution

### Implemented

- `resolveOpenTradesOnCandle` integrated via `store/trade-resolution-bridge.ts` on replay step/play
- Account balance updates through `settings-store.applyClosedTrade`
- Conservative SL-first rule on same-candle SL+TP touch
- FIXTP/FIXSL fixture symbols in `public/sample-data/` for deterministic E2E

### Tests Added

- Unit tests for long TP, long SL (-1R), same-candle SL-first in `trade-engine.test.ts`
- E2E Tests 5 & 6 in `tests/e2e/trades.spec.ts`

### Commands Run

```bash
npm run verify
```

### Result

- Passed

## Milestone 7: Prop-Firm Simulator

### Implemented

- `lib/trades/prop-firm-engine.ts` — challenge evaluation, profit target, daily/overall drawdown
- `components/trades/PropFirmPanel.tsx` — challenge progress and failure reason
- `TopStatusBar` wired to live account balance and challenge status

### Tests Added

- `tests/unit/prop-firm-engine.test.ts` — drawdown fail, pass, daily loss tracking (3 tests)
- E2E Test 7 — prop challenge fails on drawdown

### Commands Run

```bash
npm run verify
```

### Result

- Passed

## Milestone 8: Journal + Rule Checklist

### Implemented

- `lib/journal/journal-types.ts` — TradeJournal with notes, setup quality, followedRules
- `store/journal-store.ts` — journal CRUD and trade selection
- `components/journal/JournalPanel.tsx`, `RuleChecklist.tsx`, `JournalPageClient.tsx`
- `/journal` route with closed trade list and editable journal form

### Tests Added

- E2E Test 8 — journal persists rule checklist and notes after reload

### Commands Run

```bash
npm run verify
```

### Result

- Passed

## Milestone 9: Stats Dashboard

### Implemented

- `lib/stats/stats-engine.ts` — win rate, average R, expectancy, profit factor, max drawdown, rule stats
- `components/stats/StatsCards.tsx` — stats cards with empty-state handling
- `/stats` page wired to live trade and journal data

### Tests Added

- `tests/unit/stats-engine.test.ts` — empty state, win rate, divide-by-zero safety (3 tests)

### Commands Run

```bash
npm run verify
```

### Result

- Passed

## Milestone 10: Persistence + Import/Export

### Implemented

- `lib/storage/persistence-types.ts`, `lib/storage/local-storage.ts` — serialize/parse/reset
- `store/persistence-store.ts` — auto-save on store changes, hydrate on mount, import/export/reset
- `components/storage/ImportExportPanel.tsx` — export JSON, import backup, reset local data
- `PersistenceProvider` wraps workspace, journal, and stats routes

### Tests Added

- `tests/unit/persistence.test.ts` — round-trip and invalid backup rejection (2 tests)
- E2E Test 9 — export/import restores trades after reset

### Commands Run

```bash
npm run verify
```

### Result

- Passed (63 unit tests, 12 E2E tests)

## Post-MVP Testing Re-evaluation

### Gaps Addressed

- Added same-candle SL-first unit test (conservative resolution edge case)
- Added prop-firm drawdown and daily loss unit tests
- Added persistence round-trip and invalid backup tests
- Added stats divide-by-zero and empty-state tests
- E2E invalid SL validation test (Test 4 companion)

### Final Verification

```bash
npm run verify
```

### Result

- Passed — all spec E2E tests 1–9 covered across `workspace.spec.ts` and `trades.spec.ts`
