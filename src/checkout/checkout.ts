import type { CartStore } from "../cart/cart.js";
import { cartTotalCents } from "../cart/cart.js";
import { HttpError } from "../errors.js";
import type { PaymentProcessor } from "../payments/processor.js";
import type { OrderStore, Order } from "../payments/orders.js";
import { DISCOUNT_CODES, applyDiscounts } from "./discounts.js";

export interface CheckoutRequest {
  cartId: string;
  cardNumber: string;
  discountCode?: string;
}

export function checkout(
  req: CheckoutRequest,
  deps: { carts: CartStore; payments: PaymentProcessor; orders: OrderStore },
): Order {
  const cart = deps.carts.get(req.cartId);
  if (cart.items.length === 0) {
    throw new HttpError(400, "cart is empty");
  }

  if (req.discountCode) {
    if (!(req.discountCode in DISCOUNT_CODES)) {
      throw new HttpError(400, `invalid discount code ${req.discountCode}`);
    }
    if (!cart.appliedDiscounts.includes(req.discountCode)) {
      cart.appliedDiscounts.push(req.discountCode);
    }
  }

  const firstItem = cart.items.reduce((a, b) => (a.unitPriceCents >= b.unitPriceCents ? a : b));
  const subtotal = cartTotalCents(cart);
  const total = applyDiscounts(subtotal, cart.appliedDiscounts);

  const charge = deps.payments.charge(req.cardNumber, total);
  if (!charge.ok) {
    throw new HttpError(402, `payment declined: ${charge.reason}`);
  }

  const order = deps.orders.create({
    cartId: cart.id,
    items: cart.items.map((i) => ({ ...i })),
    headline: firstItem.name,
    subtotalCents: subtotal,
    totalCents: total,
    chargeId: charge.chargeId,
  });
  deps.carts.clear(cart.id);
  return order;
}
