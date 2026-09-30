import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { createApp } from "../src/app.js";
import { DECLINED_CARD } from "../src/payments/processor.js";
import { GOOD_CARD, addToCart } from "./helpers.js";

describe("checkout", () => {
  it("creates an order and empties the cart", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-tee");
    const res = await api.post("/checkout").set("x-cart-id", "c1").send({ cardNumber: GOOD_CARD });
    expect(res.status).toBe(201);
    expect(res.body.totalCents).toBe(2500);
    const cart = await api.get("/cart").set("x-cart-id", "c1");
    expect(cart.body.items).toHaveLength(0);
  });

  it("returns 402 when the card is declined", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-tee");
    const res = await api
      .post("/checkout")
      .set("x-cart-id", "c1")
      .send({ cardNumber: DECLINED_CARD });
    expect(res.status).toBe(402);
  });

  it("rejects an unknown discount code", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-tee");
    const res = await api
      .post("/checkout")
      .set("x-cart-id", "c1")
      .send({ cardNumber: GOOD_CARD, discountCode: "NOPE" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid discount code NOPE");
  });

  it("applies HACK10 once", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-tee");
    const res = await api
      .post("/checkout")
      .set("x-cart-id", "c1")
      .send({ cardNumber: GOOD_CARD, discountCode: "HACK10" });
    expect(res.body.totalCents).toBe(2250);
  });

  // DEMO BUG 1: checkout with an empty cart crashes with a 500
  it("rejects checkout of an empty cart with 400", async () => {
    const api = supertest(createApp());
    const res = await api.post("/checkout").set("x-cart-id", "c1").send({ cardNumber: GOOD_CARD });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("cart is empty");
  });

  // DEMO BUG 3: discount applied twice when checkout is retried after a decline
  it("applies a discount code only once across retries", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-tee");
    const declined = await api
      .post("/checkout")
      .set("x-cart-id", "c1")
      .send({ cardNumber: DECLINED_CARD, discountCode: "HACK10" });
    expect(declined.status).toBe(402);
    const retry = await api
      .post("/checkout")
      .set("x-cart-id", "c1")
      .send({ cardNumber: GOOD_CARD, discountCode: "HACK10" });
    expect(retry.status).toBe(201);
    expect(retry.body.totalCents).toBe(2250);
  });
});
