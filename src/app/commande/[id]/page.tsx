import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDate, formatFCFA, ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/format";
import { PAYMENT_NUMBERS } from "@/lib/delivery";
import { OrderTracker } from "@/components/order-tracker";
import { Alert, StatusBadge } from "@/components/ui";
import { PaymentRefForm } from "./payment-ref-form";

export const metadata: Metadata = { title: "Commande" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nouvelle?: string }> }) {
  const { id } = await params;
  const { nouvelle } = await searchParams;
  const user = await requireUser(`/commande/${id}`);
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } } } }, courier: { select: { name: true, phone: true } } },
  });
  if (!order) notFound();
  if (order.buyerId !== user.id && user.role !== "MANAGER") notFound();

  return (
    <div className="container-x max-w-4xl py-8">
      {nouvelle && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl bg-success-soft p-5 text-success">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-semibold">Commande enregistrée. Merci !</p>
            <p className="text-sm">Felix Mécanic va confirmer votre paiement et organiser la livraison. Vous pouvez suivre l&apos;avancement ici.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Commande</p>
          <h1 className="h2 mt-1">N° {order.id.toString().padStart(5, "0")}</h1>
          <p className="mt-1 text-sm text-muted">Passée le {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} label={ORDER_STATUS_LABEL[order.status]} />
      </div>

      <div className="card mt-6 p-6">
        <OrderTracker status={order.status} />
      </div>

      {order.status === "PENDING_PAYMENT" && order.paymentMethod !== "CASH_ON_DELIVERY" && (
        <div className="card mt-6 p-6">
          <h2 className="h3">Paiement {PAYMENT_LABEL[order.paymentMethod]}</h2>
          <p className="mt-2 text-sm">
            Envoyez <strong className="price">{formatFCFA(order.total)}</strong> au{" "}
            <strong className="font-mono">{PAYMENT_NUMBERS[order.paymentMethod]}</strong> (Felix Mécanic).
          </p>
          {order.paymentRef ? (
            <Alert tone="info">Référence transmise : <span className="font-mono">{order.paymentRef}</span>. Confirmation en cours.</Alert>
          ) : (
            <PaymentRefForm orderId={order.id} />
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="card divide-y divide-line">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-4 p-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.product.images[0] && <img src={it.product.images[0].url} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/piece/${it.product.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-accent-strong">
                  {it.title}
                </Link>
                <p className="text-xs text-muted">
                  {it.quantity} × <span className="price">{formatFCFA(it.unitPrice)}</span>
                </p>
              </div>
              <span className="price text-sm">{formatFCFA(it.unitPrice * it.quantity)}</span>
            </div>
          ))}
          <div className="space-y-1 p-4 text-sm">
            <div className="flex justify-between text-muted"><span>Sous-total</span><span className="price">{formatFCFA(order.subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Livraison</span><span className="price">{formatFCFA(order.deliveryFee)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span className="price">{formatFCFA(order.total)}</span></div>
          </div>
        </div>

        <aside className="card p-5 text-sm">
          <h2 className="h3">Livraison</h2>
          <p className="mt-2 font-medium">{order.deliveryName}</p>
          <p className="text-muted">{order.deliveryPhone}</p>
          <p className="mt-2 text-muted">{order.deliveryAddress}, {order.deliveryCity}</p>
          {order.deliveryNote && <p className="mt-2 text-xs text-muted">« {order.deliveryNote} »</p>}
          <div className="divider my-4" />
          <p className="text-muted">Paiement : <span className="font-medium text-ink">{PAYMENT_LABEL[order.paymentMethod]}</span></p>
          {order.courier && (
            <>
              <div className="divider my-4" />
              <p className="text-muted">Livreur</p>
              <p className="font-medium">{order.courier.name}</p>
              <a href={`tel:${order.courier.phone}`} className="text-accent-strong hover:underline">{order.courier.phone}</a>
            </>
          )}
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/compte" className="btn-ghost">Voir toutes mes commandes</Link>
      </div>
    </div>
  );
}
