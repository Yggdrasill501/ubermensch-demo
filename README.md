# Übermensch Demo Shop

A tiny web shop API (Express 5 + TypeScript, in-memory data). It's the codebase the Übermensch AI
coworker works on during the demo.

```bash
nvm use && npm install
npm run dev        # http://localhost:4000
npm test           # vitest
npm run test:ci    # CI gate: all tests pass except the ones in test/known-failures.json
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
