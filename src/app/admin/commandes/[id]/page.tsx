import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOrder } from "@/actions/admin";
import { formatDate, formatFCFA, ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/format";
import { OrderTracker } from "@/components/order-tracker";
import { PageHeader, StatusBadge } from "@/components/ui";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();
  const [order, couriers] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        courier: true,
        items: { include: { product: { include: { seller: { select: { name: true, phone: true } } } } } },
      },
    }),
    prisma.user.findMany({ where: { role: "COURIER" }, orderBy: { name: "asc" } }),
  ]);
  if (!order) notFound();

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/admin/commandes" className="hover:underline">← Commandes</Link>}
        title={`Commande n° ${order.id.toString().padStart(5, "0")}`}
        description={`Passée le ${formatDate(order.createdAt)} par ${order.buyer.name} (+226 ${order.buyer.phone}).`}
        action={<StatusBadge status={order.status} label={ORDER_STATUS_LABEL[order.status]} />}
      />

      <div className="card p-6">
        <OrderTracker status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card divide-y divide-line">
            <h2 className="h3 p-4">Articles à collecter</h2>
            {order.items.map((it) => (
              <div key={it.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold">
                    {it.quantity} × {it.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Récupérer chez : {it.product.seller ? `${it.product.seller.name} (${it.product.seller.phone})` : "Stock Felix Mécanic"} — {it.product.pickupAddress},{" "}
                    {it.product.pickupCity} · {it.product.pickupPhone}
                  </p>
                </div>
                <span className="price">{formatFCFA(it.unitPrice * it.quantity)}</span>
              </div>
            ))}
            <div className="space-y-1 p-4 text-sm">
              <div className="flex justify-between text-muted"><span>Sous-total</span><span className="price">{formatFCFA(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted"><span>Livraison</span><span className="price">{formatFCFA(order.deliveryFee)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span className="price">{formatFCFA(order.total)}</span></div>
            </div>
          </section>

          <section className="card p-5 text-sm">
            <h2 className="h3">Livraison</h2>
            <p className="mt-2 font-medium">{order.deliveryName} · {order.deliveryPhone}</p>
            <p className="text-muted">{order.deliveryAddress}, {order.deliveryCity}</p>
            {order.deliveryNote && <p className="mt-1 text-xs text-muted">« {order.deliveryNote} »</p>}
            <div className="divider my-3" />
            <p>
              Paiement : <strong>{PAYMENT_LABEL[order.paymentMethod]}</strong>
              {order.paymentRef && (
                <>
                  {" "}· réf. <span className="font-mono">{order.paymentRef}</span>
                </>
              )}
            </p>
          </section>
        </div>

        <form action={updateOrder.bind(null, order.id)} className="card h-fit space-y-4 p-5">
          <h2 className="h3">Traitement</h2>
          <label className="field">
            <span className="label">Livreur</span>
            <select name="courierId" className="input" defaultValue={order.courierId ?? ""}>
              <option value="">— Aucun —</option>
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.phone}
                </option>
              ))}
            </select>
            <p className="help">Choisir un livreur sur une commande payée l&apos;assigne automatiquement.</p>
          </label>
          <label className="field">
            <span className="label">Nouveau statut</span>
            <select name="status" className="input" defaultValue={order.status}>
              <option value={order.status}>{ORDER_STATUS_LABEL[order.status]} (actuel)</option>
              {NEXT[order.status].map((s) => (
                <option key={s} value={s}>
                  → {ORDER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            {order.status === "PENDING_PAYMENT" && <p className="help">Vérifiez la réception du paiement Mobile Money avant de passer en « Payée ».</p>}
          </label>
          <label className="field">
            <span className="label">Note interne</span>
            <textarea name="managerNote" className="input min-h-20" defaultValue={order.managerNote ?? ""} />
          </label>
          <button className="btn-primary w-full">Enregistrer</button>
        </form>
      </div>
    </>
  );
}
