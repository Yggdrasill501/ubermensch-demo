export interface Product {
  id: string;
  name: string;
  priceCents: number;
}

export const PRODUCTS: Product[] = [
  { id: "p-mug", name: "Übermensch Mug", priceCents: 1500 },
  { id: "p-tee", name: "Ship It T-Shirt", priceCents: 2500 },
  { id: "p-sticker", name: "Agent Sticker Pack", priceCents: 500 },
];

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
