import request from "supertest";
import { createApp } from "../src/app.js";

export const GOOD_CARD = "4242424242424242";

export function client() {
  return request(createApp());
}

export async function addToCart(
  api: ReturnType<typeof client>,
  productId: string,
  quantity = 1,
  cartId = "c1",
) {
  return api.post("/cart/items").set("x-cart-id", cartId).send({ productId, quantity });
}
