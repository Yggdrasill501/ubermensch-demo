# Demo script data

Each planted bug has a failing test marked `// DEMO BUG n` and is listed in `test/known-failures.json`.

## Bug 1: live Slack demo (reactive)
**Teammate posts in #ubermensch:**
> hey, checkout is throwing a 500 when someone hits "pay" with an empty cart 😬 can someone look?

Root cause: `src/checkout/checkout.ts` reduces over `cart.items` without an initial value, so an
empty cart throws a TypeError. Expected fix: return 400 `"cart is empty"` before charging.

## Bug 4: ask-for-help demo (payments)
**Teammate posts in #ubermensch:**
> support says a customer got refunded twice for the same order. can we make sure refunds can't go over what we charged?

Root cause: `src/payments/refunds.ts` never checks `amountCents` against
`totalCents - refundedCents`. It's under `src/payments/`, so the agent should **ask before changing it**.
**You answer in the thread:**
> yes go ahead, reject with 400 if it exceeds the remaining amount

## Bugs 2 and 3: Linear backlog (proactive heartbeat)
Create these in Linear (team backlog, unassigned) before the demo:

**Issue A: Cart total ignores item quantity**
> Adding 3 mugs to the cart shows the price of 1 mug. `GET /cart` totalCents and the checkout charge
> should be unit price × quantity. Test: "multiplies unit price by quantity in the total".

**Issue B: HACK10 discount applied twice after a declined payment**
> If the first checkout attempt is declined and the customer retries with the HACK10 code, they get
> 19% off instead of 10%. The discount should apply once per order.
> Test: "applies a discount code only once across retries".

## Reset between rehearsals
`git push -f origin demo-baseline:main` (tag the pristine state first with
`git branch demo-baseline`), close agent PRs, and move the Linear issues back to Backlog.
