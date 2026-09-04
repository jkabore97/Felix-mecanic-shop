import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA, formatShortDate, ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const TABS: Array<{ key: string; label: string; statuses: OrderStatus[] }> = [
  { key: "actives", label: "À traiter", statuses: ["PENDING_PAYMENT", "PAID", "ASSIGNED", "PICKED_UP"] },
  { key: "livrees", label: "Livrées", statuses: ["DELIVERED"] },
  { key: "annulees", label: "Annulées", statuses: ["CANCELLED"] },
];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const { onglet } = await searchParams;
  const tab = TABS.find((t) => t.key === onglet) ?? TABS[0];
  const orders = await prisma.order.findMany({
    where: { status: { in: tab.statuses } },
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { name: true, phone: true } }, courier: { select: { name: true } }, items: true },
  });

  return (
    <>
      <PageHeader eyebrow="Commandes" title="Commandes & livraisons" description="Confirmez les paiements, assignez un livreur, suivez les livraisons." />
      <div className="flex gap-2">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/commandes?onglet=${t.key}`} className={`pill ${t.key === tab.key ? "pill-active" : ""}`}>
            {t.label}
          </Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Aucune commande" />
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Paiement</th>
                <th>Livreur</th>
                <th>Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-soft/50">
                  <td>
                    <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-accent-strong hover:underline">
                      {o.id.toString().padStart(5, "0")}
                    </Link>
                    <div className="text-xs text-muted">{formatShortDate(o.createdAt)}</div>
                  </td>
                  <td>
                    <div className="font-medium">{o.buyer.name}</div>
                    <div className="text-xs text-muted">{o.deliveryCity}</div>
                  </td>
                  <td className="max-w-xs">
                    <div className="line-clamp-2 text-xs">{o.items.map((i) => `${i.quantity}× ${i.title}`).join(", ")}</div>
                  </td>
                  <td>
                    <div className="text-xs">{PAYMENT_LABEL[o.paymentMethod]}</div>
                    {o.paymentRef && <div className="font-mono text-xs text-muted">{o.paymentRef}</div>}
                  </td>
                  <td className="text-xs">{o.courier?.name ?? "—"}</td>
                  <td className="price">{formatFCFA(o.total)}</td>
                  <td>
                    <StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
