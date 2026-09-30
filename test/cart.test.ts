import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { createApp } from "../src/app.js";
import { addToCart } from "./helpers.js";

describe("cart", () => {
  it("adds items to the cart", async () => {
    const api = supertest(createApp());
    const res = await addToCart(api, "p-mug");
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(1);
  });

  it("rejects unknown products", async () => {
    const api = supertest(createApp());
    const res = await addToCart(api, "p-nope");
    expect(res.status).toBe(404);
  });

  it("totals a single item", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-tee");
    const res = await api.get("/cart").set("x-cart-id", "c1");
    expect(res.body.totalCents).toBe(2500);
  });

  // DEMO BUG 2: cart total ignores quantity
  it("multiplies unit price by quantity in the total", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-mug", 3);
    await addToCart(api, "p-sticker", 2);
    const res = await api.get("/cart").set("x-cart-id", "c1");
    expect(res.body.totalCents).toBe(3 * 1500 + 2 * 500);
  });
});
