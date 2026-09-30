import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { createApp } from "../src/app.js";
import { GOOD_CARD, addToCart } from "./helpers.js";

async function placeOrder(api: ReturnType<typeof supertest>) {
  await addToCart(api, "p-tee");
  const res = await api.post("/checkout").set("x-cart-id", "c1").send({ cardNumber: GOOD_CARD });
  return res.body as { id: string; totalCents: number };
}

describe("refunds", () => {
  it("refunds part of an order", async () => {
    const api = supertest(createApp());
    const order = await placeOrder(api);
    const res = await api.post("/payments/refund").send({ orderId: order.id, amountCents: 1000 });
    expect(res.status).toBe(200);
    expect(res.body.refundedCents).toBe(1000);
  });

  it("404s on unknown orders", async () => {
    const api = supertest(createApp());
    const res = await api.post("/payments/refund").send({ orderId: "ord_nope", amountCents: 100 });
    expect(res.status).toBe(404);
  });

  // DEMO BUG 4: refunds can exceed the amount charged
  it("rejects refunds above the remaining charged amount", async () => {
    const api = supertest(createApp());
    const order = await placeOrder(api);
    await api.post("/payments/refund").send({ orderId: order.id, amountCents: 2000 });
    const res = await api.post("/payments/refund").send({ orderId: order.id, amountCents: 1000 });
    expect(res.status).toBe(400);
  });
});
