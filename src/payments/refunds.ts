import { HttpError } from "../errors.js";
import type { OrderStore } from "./orders.js";
import type { PaymentProcessor } from "./processor.js";

export interface RefundRequest {
  orderId: string;
  amountCents: number;
}

export function refund(
  req: RefundRequest,
  deps: { orders: OrderStore; payments: PaymentProcessor },
) {
  const order = deps.orders.get(req.orderId);
  if (!order) throw new HttpError(404, `unknown order ${req.orderId}`);
  if (!Number.isInteger(req.amountCents) || req.amountCents <= 0) {
    throw new HttpError(400, "amountCents must be a positive integer");
  }

  const { refundId } = deps.payments.refund(order.chargeId, req.amountCents);
  order.refundedCents += req.amountCents;

  return { refundId, orderId: order.id, refundedCents: order.refundedCents };
}
