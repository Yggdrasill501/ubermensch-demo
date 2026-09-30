# Demo Shop — guide for agents

Express 5 + TypeScript API with in-memory stores. Node 22. Money is always integer cents.

## Commands
- `npm test` — all tests (vitest). `npx vitest run -t "<test name>"` for one test.
- `npm run test:ci` — what CI runs. Every test must pass except those listed in
  `test/known-failures.json` (tests for open bugs).
- `npm run typecheck`

## Layout
- `src/app.ts` — routes + error handler (`HttpError` → status + `{ error }`)
- `src/cart/` — cart store and totals · `src/checkout/` — checkout + discount codes
- `src/payments/` — fake processor, orders, refunds (**payments code: see below**)
- `test/` — supertest API tests, one file per area

## Workflow for a bug fix
1. Reproduce with the matching test (tests for open bugs are marked `// DEMO BUG n`).
2. Fix the root cause in `src/`, keep the change minimal.
3. Remove the now-passing test from `test/known-failures.json`.
4. `npm run typecheck && npm run test:ci` must pass.
5. Branch, commit, open a PR describing the root cause and fix.

## Rules
- Anything under `src/payments/` moves money: ask a human before changing behavior there.
- Don't delete or weaken existing tests.
