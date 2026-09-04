"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { cartTotal, readCart, subscribeCart, writeCart, type CartItem } from "@/lib/cart";
import { formatFCFA } from "@/lib/format";
import { EmptyState } from "@/components/ui";

export function CartView() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  useEffect(() => {
    const update = () => setItems(readCart());
    update();
    return subscribeCart(update);
  }, []);

  if (items === null) return <div className="card mt-6 h-40 animate-pulse" />;
  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          icon={<ShoppingBag className="size-6" />}
          title="Votre panier est vide"
          description="Parcourez le catalogue pour trouver la pièce qu'il vous faut."
          action={<Link href="/catalogue" className="btn-primary">Voir le catalogue</Link>}
        />
      </div>
    );
  }

  const setQty = (id: string, qty: number) => {
    const next = items
      .map((i) => (i.productId === id ? { ...i, quantity: Math.max(0, Math.min(i.maxQuantity, qty)) } : i))
      .filter((i) => i.quantity > 0);
    writeCart(next);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="card divide-y divide-line">
        {items.map((i) => (
          <li key={i.productId} className="flex gap-4 p-4">
            <Link href={`/piece/${i.slug}`} className="size-20 shrink-0 overflow-hidden rounded-2xl bg-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.image && <img src={i.image} alt="" className="size-full object-cover" />}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/piece/${i.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-accent-strong">
                {i.title}
              </Link>
              <p className="price mt-1 text-sm text-muted">{formatFCFA(i.price)} / unité</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-line">
                  <button type="button" aria-label="Diminuer" onClick={() => setQty(i.productId, i.quantity - 1)} className="grid size-8 place-items-center rounded-full hover:bg-soft">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono text-sm">{i.quantity}</span>
                  <button
                    type="button"
                    aria-label="Augmenter"
                    disabled={i.quantity >= i.maxQuantity}
                    onClick={() => setQty(i.productId, i.quantity + 1)}
                    className="grid size-8 place-items-center rounded-full hover:bg-soft disabled:opacity-40"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <button type="button" onClick={() => setQty(i.productId, 0)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger">
                  <Trash2 className="size-3.5" /> Retirer
                </button>
              </div>
            </div>
            <span className="price text-base">{formatFCFA(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="h3">Récapitulatif</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Sous-total</dt>
            <dd className="price">{formatFCFA(cartTotal(items))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Livraison</dt>
            <dd className="text-muted">calculée à l&apos;étape suivante</dd>
          </div>
        </dl>
        <div className="divider my-4" />
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="price">{formatFCFA(cartTotal(items))}</span>
        </div>
        <Link href="/commande" className="btn-primary btn-lg mt-6 w-full">
          Commander <ArrowRight className="size-5" />
        </Link>
        <p className="mt-3 text-center text-xs text-muted">Paiement Orange Money, Moov Money ou à la livraison.</p>
      </aside>
    </div>
  );
}
