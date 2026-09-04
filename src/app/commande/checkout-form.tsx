"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Smartphone, Wallet } from "lucide-react";
import { checkout } from "@/actions/orders";
import { cartTotal, readCart, subscribeCart, writeCart, type CartItem } from "@/lib/cart";
import { formatFCFA, PAYMENT_LABEL } from "@/lib/format";
import { PAYMENT_NUMBERS } from "@/lib/delivery";
import { Alert, EmptyState } from "@/components/ui";
import type { PaymentMethod } from "@prisma/client";

export function CheckoutForm({
  cities,
  defaults,
}: {
  cities: Array<{ name: string; fee: number }>;
  defaults: { name: string; phone: string; city: string; address: string };
}) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [city, setCity] = useState(cities.some((c) => c.name === defaults.city) ? defaults.city : cities[0].name);
  const [method, setMethod] = useState<PaymentMethod>("ORANGE_MONEY");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const update = () => setItems(readCart());
    update();
    return subscribeCart(update);
  }, []);

  if (items === null) return <div className="card mt-6 h-40 animate-pulse" />;
  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title="Votre panier est vide" action={<Link href="/catalogue" className="btn-primary">Voir le catalogue</Link>} />
      </div>
    );
  }

  const fee = cities.find((c) => c.name === city)?.fee ?? 0;
  const subtotal = cartTotal(items);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await checkout({
        deliveryName: fd.get("deliveryName"),
        deliveryPhone: fd.get("deliveryPhone"),
        deliveryCity: fd.get("deliveryCity"),
        deliveryAddress: fd.get("deliveryAddress"),
        deliveryNote: fd.get("deliveryNote") || undefined,
        paymentMethod: fd.get("paymentMethod"),
        paymentRef: fd.get("paymentRef") || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      if (res.ok) {
        writeCart([]);
        router.push(`/commande/${res.orderId}?nouvelle=1`);
      } else {
        if (res.removed?.length) writeCart(items.filter((i) => !res.removed!.includes(i.productId)));
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {error && <Alert tone="danger">{error}</Alert>}

        <section className="card p-6">
          <h2 className="h3">Adresse de livraison</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="label">Destinataire</span>
              <input name="deliveryName" required defaultValue={defaults.name} className="input" />
            </label>
            <label className="field">
              <span className="label">Téléphone</span>
              <input name="deliveryPhone" required inputMode="tel" defaultValue={defaults.phone} className="input" />
            </label>
            <label className="field">
              <span className="label">Ville</span>
              <select name="deliveryCity" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} · livraison {formatFCFA(c.fee)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Quartier, secteur, repère</span>
              <input name="deliveryAddress" required defaultValue={defaults.address} className="input" placeholder="Ex : Secteur 30, près de la pharmacie…" />
            </label>
            <label className="field sm:col-span-2">
              <span className="label">Instructions pour le livreur (facultatif)</span>
              <textarea name="deliveryNote" className="input min-h-20" placeholder="Horaires, portail, personne à contacter…" />
            </label>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="h3">Mode de paiement</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(["ORANGE_MONEY", "MOOV_MONEY", "CASH_ON_DELIVERY"] as PaymentMethod[]).map((m) => (
              <label
                key={m}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
                  method === m ? "border-accent bg-accent-soft/60" : "border-line hover:border-accent/50"
                }`}
              >
                <input type="radio" name="paymentMethod" value={m} checked={method === m} onChange={() => setMethod(m)} className="accent-accent" />
                {m === "CASH_ON_DELIVERY" ? <Wallet className="size-5 text-accent-strong" /> : <Smartphone className="size-5 text-accent-strong" />}
                <span className="text-sm font-semibold">{PAYMENT_LABEL[m]}</span>
              </label>
            ))}
          </div>

          {method !== "CASH_ON_DELIVERY" ? (
            <div className="mt-4 rounded-2xl bg-soft p-4 text-sm">
              <p>
                Envoyez <strong className="price">{formatFCFA(subtotal + fee)}</strong> au{" "}
                <strong className="font-mono">{PAYMENT_NUMBERS[method]}</strong> ({PAYMENT_LABEL[method]}, nom : Felix Mécanic), puis saisissez la
                référence de la transaction ci-dessous. Vous pourrez aussi l&apos;ajouter après la commande.
              </p>
              <label className="field mt-3">
                <span className="label">Référence de transaction (facultatif)</span>
                <input name="paymentRef" className="input font-mono" placeholder="Ex : PP240904.1234.A56789" />
              </label>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-soft p-4 text-sm text-muted">
              Vous réglez le montant total en espèces ou Mobile Money au livreur, à la réception de la pièce.
            </p>
          )}
        </section>
      </div>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="h3">Votre commande</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 py-2">
              <span className="line-clamp-2">
                <span className="font-mono text-muted">{i.quantity}×</span> {i.title}
              </span>
              <span className="price shrink-0">{formatFCFA(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Sous-total</dt>
            <dd className="price">{formatFCFA(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Livraison · {city}</dt>
            <dd className="price">{formatFCFA(fee)}</dd>
          </div>
        </dl>
        <div className="divider my-4" />
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="price">{formatFCFA(subtotal + fee)}</span>
        </div>
        <button type="submit" disabled={pending} className="btn-primary btn-lg mt-6 w-full">
          {pending && <Loader2 className="size-5 animate-spin" />}
          {pending ? "Enregistrement…" : "Confirmer la commande"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">Felix Mécanic vous contacte pour confirmer avant l&apos;expédition.</p>
      </aside>
    </form>
  );
}
