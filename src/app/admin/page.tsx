import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA, formatShortDate, ORDER_STATUS_LABEL } from "@/lib/format";
import { PageHeader, Stat, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pending, online, orders, revenue, openRequests, recentOrders, recentPending] = await Promise.all([
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "APPROVED", quantity: { gt: 0 } } }),
    prisma.order.count({ where: { status: { notIn: ["CANCELLED"] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    prisma.partRequest.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { buyer: { select: { name: true } } } }),
    prisma.product.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: 5, include: { seller: { select: { name: true } } } }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Administration" title="Tableau de bord" description="Vue d'ensemble de l'activité de Felix Mécanic." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Annonces à valider" value={pending} hint="Soumises par des vendeurs" />
        <Stat label="Pièces en ligne" value={online} />
        <Stat label="Commandes" value={orders} hint="hors annulées" />
        <Stat label="Chiffre d'affaires livré" value={<span className="price">{formatFCFA(revenue._sum.total ?? 0)}</span>} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="h3">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-sm font-medium text-accent-strong hover:underline">Tout voir</Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/commandes/${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-semibold">N° {o.id.toString().padStart(5, "0")}</span>
                    <span className="text-muted"> · {o.buyer.name} · {formatShortDate(o.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="price">{formatFCFA(o.total)}</span>
                    <StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                  </span>
                </Link>
              </li>
            ))}
            {recentOrders.length === 0 && <li className="py-3 text-sm text-muted">Aucune commande pour l&apos;instant.</li>}
          </ul>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="h3">Annonces en attente</h2>
            <Link href="/admin/annonces" className="text-sm font-medium text-accent-strong hover:underline">Valider</Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {recentPending.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="line-clamp-1 font-semibold">{p.title}</span>
                  <span className="text-muted">{p.seller?.name ?? "—"} · {formatShortDate(p.createdAt)}</span>
                </span>
                <span className="price shrink-0">{formatFCFA(p.price)}</span>
              </li>
            ))}
            {recentPending.length === 0 && <li className="py-3 text-sm text-muted">Rien à valider. 🎉</li>}
          </ul>
          <p className="mt-4 text-xs text-muted">{openRequests} demande{openRequests > 1 ? "s" : ""} de pièce en cours.</p>
        </section>
      </div>
    </>
  );
}
