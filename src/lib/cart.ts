"use client";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  quantity: number;
  maxQuantity: number;
};

const KEY = "felix-cart-v1";
const EVENT = "felix-cart-change";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* stockage indisponible */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = readCart();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity = Math.min(existing.maxQuantity, existing.quantity + quantity);
  } else {
    items.push({ ...item, quantity: Math.min(item.maxQuantity, quantity) });
  }
  writeCart(items);
}

export function subscribeCart(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((n, i) => n + i.quantity * i.price, 0);
}
