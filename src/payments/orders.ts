import { randomUUID } from "node:crypto";
import type { CartItem } from "../cart/cart.js";

export interface Order {
  id: string;
  cartId: string;
  items: CartItem[];
  headline: string;
  subtotalCents: number;
  totalCents: number;
  refundedCents: number;
  chargeId: string;
  createdAt: string;
}

export class OrderStore {
  private orders = new Map<string, Order>();

  create(o: Omit<Order, "id" | "refundedCents" | "createdAt">): Order {
    const order: Order = {
      ...o,
      id: `ord_${randomUUID().slice(0, 8)}`,
      refundedCents: 0,
      createdAt: new Date().toISOString(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  get(id: string): Order | undefined {
    return this.orders.get(id);
  }
}
