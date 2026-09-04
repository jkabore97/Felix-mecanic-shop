"use client";

import { useEffect, useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { addToCart, type CartItem } from "@/lib/cart";

export function AddToCartButton({
  product,
  compact = false,
  quantity = 1,
}: {
  product: Omit<CartItem, "quantity">;
  compact?: boolean;
  quantity?: number;
}) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const onClick = () => {
    addToCart(product, quantity);
    setAdded(true);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Ajouter au panier"
        className={`grid size-9 shrink-0 place-items-center rounded-full transition-all sm:size-10 ${
          added ? "bg-success text-white" : "bg-ink text-white hover:bg-accent"
        }`}
      >
        {added ? <Check className="size-4" /> : <Plus className="size-4" />}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`btn-lg ${added ? "btn bg-success text-white" : "btn-primary"} w-full sm:w-auto`}>
      {added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
      {added ? "Ajouté au panier" : "Ajouter au panier"}
    </button>
  );
}
