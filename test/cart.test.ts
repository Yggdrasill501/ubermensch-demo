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

  it("stacks quantity when the same product is added again", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-mug", 1);
    const res = await addToCart(api, "p-mug", 2);
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({ productId: "p-mug", quantity: 3 });
  });

  it("rejects a non-positive or non-integer quantity", async () => {
    const api = supertest(createApp());
    for (const quantity of [0, -1, 1.5]) {
      const res = await addToCart(api, "p-mug", quantity);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("quantity must be a positive integer");
    }
  });

  it("keeps carts separate by x-cart-id", async () => {
    const api = supertest(createApp());
    await addToCart(api, "p-mug", 1, "cart-a");
    await addToCart(api, "p-tee", 1, "cart-b");
    const a = await api.get("/cart").set("x-cart-id", "cart-a");
    const b = await api.get("/cart").set("x-cart-id", "cart-b");
    expect(a.body.items.map((item: { productId: string }) => item.productId)).toEqual(["p-mug"]);
    expect(b.body.items.map((item: { productId: string }) => item.productId)).toEqual(["p-tee"]);
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
