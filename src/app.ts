import express, { type NextFunction, type Request, type Response } from "express";
import { CartStore } from "./cart/cart.js";
import { cartTotalCents } from "./cart/cart.js";
import { PRODUCTS } from "./catalog/products.js";
import { checkout } from "./checkout/checkout.js";
import { HttpError } from "./errors.js";
import { OrderStore } from "./payments/orders.js";
import { PaymentProcessor } from "./payments/processor.js";
import { refund } from "./payments/refunds.js";

/** Builds the app with fresh in-memory stores (one per test). */
export function createApp() {
  const carts = new CartStore();
  const orders = new OrderStore();
  const payments = new PaymentProcessor();

  const app = express();
  app.use(express.json());

  const cartId = (req: Request) => req.header("x-cart-id") ?? "default";

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/products", (_req, res) => {
    res.json(PRODUCTS);
  });

  app.post("/cart/items", (req, res) => {
    const { productId, quantity = 1 } = req.body ?? {};
    const cart = carts.addItem(cartId(req), productId, quantity);
    res.status(201).json({ ...cart, totalCents: cartTotalCents(cart) });
  });

  app.get("/cart", (req, res) => {
    const cart = carts.get(cartId(req));
    res.json({ ...cart, totalCents: cartTotalCents(cart) });
  });

  app.post("/checkout", (req, res) => {
    const { cardNumber, discountCode } = req.body ?? {};
    const order = checkout({ cartId: cartId(req), cardNumber, discountCode }, { carts, payments, orders });
    res.status(201).json(order);
  });

  app.post("/payments/refund", (req, res) => {
    const { orderId, amountCents } = req.body ?? {};
    res.json(refund({ orderId, amountCents }, { orders, payments }));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  });

  return app;
}
