import { findProduct } from "../catalog/products.js";
import { HttpError } from "../errors.js";

export interface CartItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  appliedDiscounts: string[];
}

export class CartStore {
  private carts = new Map<string, Cart>();

  get(cartId: string): Cart {
    let cart = this.carts.get(cartId);
    if (!cart) {
      cart = { id: cartId, items: [], appliedDiscounts: [] };
      this.carts.set(cartId, cart);
    }
    return cart;
  }

  addItem(cartId: string, productId: string, quantity: number): Cart {
    const product = findProduct(productId);
    if (!product) throw new HttpError(404, `unknown product ${productId}`);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(400, "quantity must be a positive integer");
    }
    const cart = this.get(cartId);
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        unitPriceCents: product.priceCents,
        quantity,
      });
    }
    return cart;
  }

  clear(cartId: string): void {
    this.carts.delete(cartId);
  }
}

export function cartTotalCents(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}
