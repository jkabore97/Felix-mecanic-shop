import type { Metadata } from "next";
import { MapPin, Phone, PackageCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { courierUpdate } from "@/actions/courier";
import { formatFCFA, formatShortDate, ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Mes livraisons" };
export const dynamic = "force-dynamic";

export default async function CourierPage() {
  const user = await requireRole(["COURIER"], "/livreur");
  const [active, done] = await Promise.all([
    prisma.order.findMany({
      where: { courierId: user.id, status: { in: ["ASSIGNED", "PICKED_UP"] } },
      orderBy: { updatedAt: "asc" },
      include: { items: { include: { product: { include: { seller: { select: { name: true } } } } } } },
    }),
    prisma.order.count({ where: { courierId: user.id, status: "DELIVERED" } }),
  ]);

  return (
    <div className="container-x py-8">
      <PageHeader eyebrow={`Livreur · ${user.name}`} title="Mes livraisons" description={`${active.length} en cours · ${done} livrée${done > 1 ? "s" : ""} au total.`} />
      {active.length === 0 ? (
        <EmptyState icon={<Truck className="size-6" />} title="Aucune livraison en cours" description="Le gestionnaire vous assignera les prochaines commandes." />
      ) : (
        <ul className="space-y-4">
          {active.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="h3">Commande n° {o.id.toString().padStart(5, "0")}</h2>
                <StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status]} />
              </div>
              <p className="text-xs text-muted">{formatShortDate(o.createdAt)}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-soft p-4 text-sm">
                  <p className="mb-2 flex items-center gap-2 font-semibold">
                    <MapPin className="size-4 text-accent-strong" /> 1. Récupérer
                  </p>
                  <ul className="space-y-2">
                    {o.items.map((it) => (
                      <li key={it.id}>
                        <p className="font-medium">
                          {it.quantity} × {it.title}
                        </p>
                        <p className="text-xs text-muted">
                          {it.product.seller?.name ?? "Felix Mécanic"} · {it.product.pickupAddress}, {it.product.pickupCity}
                        </p>
                        <a href={`tel:${it.product.pickupPhone}`} className="inline-flex items-center gap-1 text-xs text-accent-strong hover:underline">
                          <Phone className="size-3" /> {it.product.pickupPhone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-soft p-4 text-sm">
                  <p className="mb-2 flex items-center gap-2 font-semibold">
                    <PackageCheck className="size-4 text-accent-strong" /> 2. Livrer
                  </p>
                  <p className="font-medium">{o.deliveryName}</p>
                  <p className="text-xs text-muted">{o.deliveryAddress}, {o.deliveryCity}</p>
                  <a href={`tel:${o.deliveryPhone}`} className="inline-flex items-center gap-1 text-xs text-accent-strong hover:underline">
                    <Phone className="size-3" /> {o.deliveryPhone}
                  </a>
                  {o.deliveryNote && <p className="mt-2 text-xs text-muted">« {o.deliveryNote} »</p>}
                  <div className="divider my-3" />
                  <p className="text-xs">
                    {PAYMENT_LABEL[o.paymentMethod]}
                    {o.paymentMethod === "CASH_ON_DELIVERY" ? (
                      <>
                        {" "}· <strong className="price">à encaisser : {formatFCFA(o.total)}</strong>
                      </>
                    ) : (
                      " · déjà payé"
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                {o.status === "ASSIGNED" ? (
                  <form action={courierUpdate.bind(null, o.id, "PICKED_UP")}>
                    <button className="btn-dark w-full sm:w-auto">Pièce récupérée</button>
                  </form>
                ) : (
                  <form action={courierUpdate.bind(null, o.id, "DELIVERED")}>
                    <button className="btn-primary w-full sm:w-auto">Livraison effectuée</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
