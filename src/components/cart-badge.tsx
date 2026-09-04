"use client";

import { useEffect, useState } from "react";
import { cartCount, readCart, subscribeCart } from "@/lib/cart";

export function CartBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(cartCount(readCart()));
    update();
    return subscribeCart(update);
  }, []);
  if (count === 0) return null;
  return (
    <span
      className={`grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-surface ${className}`}
      aria-label={`${count} article(s) dans le panier`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
