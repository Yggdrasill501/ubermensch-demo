import { randomUUID } from "node:crypto";

export const DECLINED_CARD = "4000000000000002";

export type ChargeResult =
  | { ok: true; chargeId: string }
  | { ok: false; reason: string };

/** Fake payment processor. Cards ending in 0002 are declined. */
export class PaymentProcessor {
  charge(cardNumber: string, amountCents: number): ChargeResult {
    if (cardNumber === DECLINED_CARD) return { ok: false, reason: "card_declined" };
    if (amountCents <= 0) return { ok: false, reason: "invalid_amount" };
    return { ok: true, chargeId: `ch_${randomUUID()}` };
  }

  refund(chargeId: string, amountCents: number): { refundId: string } {
    void chargeId;
    void amountCents;
    return { refundId: `re_${randomUUID()}` };
  }
}
