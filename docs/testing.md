# Testing

## Verify loop

Run the full quality gate before marking a milestone complete:

```bash
npm run verify
```

This runs, in order:

1. `npm run typecheck` — TypeScript (`tsc --noEmit`)
2. `npm run lint` — ESLint (Next.js 16 uses `eslint .`; `next lint` CLI removed)
3. `npm run test` — Vitest unit tests (`tests/unit/**`)
4. `npm run test:e2e` — Playwright E2E (`tests/e2e/**`, Chromium)
5. `npm run build` — Production build

## Individual commands

| Command | Purpose |
|---------|---------|
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run dev` | Local dev server (port 3000) |

## Conventions

- Use `data-testid` for chart-adjacent state that is not easily queried by role/label
- Prefer `getByRole` and `getByLabel` for interactive elements in E2E tests
