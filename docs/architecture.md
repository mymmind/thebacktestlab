# Architecture

High-level structure for Backtesting Lab. Full spec lives in the project requirements document.

- **Framework:** Next.js App Router (repo root, no `src/`)
- **UI:** Tailwind CSS v4 + shadcn/ui + Lucide icons
- **Workspace route:** `/workspace` renders the replay app shell (chart-dominant grid)
- **State (later milestones):** Zustand stores for replay, trades, sessions
- **Chart (M4+):** TradingView Lightweight Charts in `ChartPanel`
- **Data (M2+):** CSV candle loading and aggregation pipeline
- **Persistence (M7+):** localStorage for sessions and settings

See `docs/progress.md` for milestone completion status.
