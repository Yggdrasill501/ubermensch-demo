# Übermensch Demo Shop

A tiny web shop API (Express 5 + TypeScript, in-memory data, money in integer cents). It is the
**playground for [Übermensch](https://github.com/Yggdrasill501/ubermensch)**, an autonomous AI
coworker you hire, not prompt.

During the demo, nobody on the team touches this code. Übermensch picks up bug reports from Slack
and Linear. It hands each one to a Cursor Cloud Agent, which fixes the bug here and opens a PR. Once
CI is green, Übermensch merges the PR and reports back in Slack. The shop is small on purpose, so a
fix fits in a single PR and the audience can follow it live.

```bash
nvm use && npm install
npm run dev        # http://localhost:4000
npm test           # vitest: all tests, including the ones for open bugs
npm run test:ci    # the CI gate (see below)
npm run typecheck
```

## API

| Method | Path | Body |
|---|---|---|
| GET | `/products` | |
| POST | `/cart/items` | `{ productId, quantity }` (header `x-cart-id`) |
| GET | `/cart` | (header `x-cart-id`) |
| POST | `/checkout` | `{ cardNumber, discountCode? }` (header `x-cart-id`) |
| POST | `/payments/refund` | `{ orderId, amountCents }` |

Test cards: `4242424242424242` succeeds, `4000000000000002` is declined.

## The four planted bugs

The shop ships with four known bugs. Each one has a failing test marked `// DEMO BUG n` in `test/`
and is listed in [`test/known-failures.json`](test/known-failures.json).

| # | Symptom | Where it enters the demo |
|---|---|---|
| 1 | Checking out an empty cart returns a 500 instead of a clear 400 | **Reactive**: a teammate reports it in Slack |
| 2 | The cart total ignores item quantity | **Proactive**: a Linear backlog ticket the agent picks up by itself |
| 3 | A discount code is applied twice when checkout is retried after a declined card | **Proactive**: a Linear backlog ticket |
| 4 | Refunds can exceed the amount charged | **Asks for help**: payments code, so the agent asks a human before changing it |

Bug 4 lives under `src/payments/`. The repo rules in [`CLAUDE.md`](CLAUDE.md), which every coding
agent reads, say that anything touching money needs a human's go-ahead. The agent asks in the Slack
thread, waits for the answer, and then ships.

The exact Slack messages and Linear tickets used in the demo are in [`DEMO.md`](DEMO.md), along
with how to reset the repo between rehearsals.

## CI: the known-failures gate

A normal CI run would stay red until all four bugs are fixed, so no agent PR could ever be merged.
[`scripts/check-tests.mjs`](scripts/check-tests.mjs) (`npm run test:ci`) solves this. It runs vitest
and compares the results against `test/known-failures.json`:

- A test that fails **and is not listed** is a regression, and **CI fails**.
- A test that is listed **and now passes** also **fails CI**, with the message
  "fixed but still listed". A fix must remove its test from the list in the same PR.
- Otherwise CI passes and reports how many tests passed and how many known failures remain.

This way every PR must fix exactly what it claims to fix without breaking anything else, and the
list shrinks as the agent works through the bugs. GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
runs `npm run typecheck` and `npm run test:ci` on every PR and on every push to `main`. Übermensch
squash-merges an agent PR only after these checks pass.

## Layout

- `src/app.ts`: routes and error handler
- `src/catalog/`: products · `src/cart/`: cart store and totals · `src/checkout/`: checkout and discount codes
- `src/payments/`: fake card processor, orders, refunds (ask before changing)
- `test/`: supertest API tests, one file per area, plus `known-failures.json`
- `CLAUDE.md`: the workflow and rules coding agents follow in this repo

---

Part of **[Übermensch](https://github.com/Yggdrasill501/ubermensch)**, built at the Cursor Hackathon Prague (September 2026).
