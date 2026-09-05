import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, PackageSearch, Receipt, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { withdrawListing } from "@/actions/listings";
import { displayPhone, formatFCFA, formatShortDate, ORDER_STATUS_LABEL, PRODUCT_STATUS_LABEL, REQUEST_STATUS_LABEL, ROLE_LABEL } from "@/lib/format";
import { Alert, EmptyState, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ annonce?: string }> }) {
  const { annonce } = await searchParams;
  const user = await requireUser("/compte");
  const [orders, listings, requests] = await Promise.all([
    prisma.order.findMany({ where: { buyerId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.product.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } }),
    prisma.partRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{ROLE_LABEL[user.role]}</p>
          <h1 className="h2 mt-1">Bonjour, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">
            {displayPhone(user.phone)}
            {user.city ? ` · ${user.city}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {user.role === "MANAGER" && <Link href="/admin" className="btn-dark btn-sm">Administration</Link>}
          {user.role === "COURIER" && <Link href="/livreur" className="btn-dark btn-sm">Mes livraisons</Link>}
          <form action={logout}>
            <button className="btn-ghost btn-sm">
              <LogOut className="size-4" /> Déconnexion
            </button>
          </form>
        </div>
      </div>

      {annonce && (
        <div className="mt-6">
          <Alert tone="success">Votre annonce a bien été soumise. Elle sera visible dès validation par Felix Mécanic.</Alert>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Commandes */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="h3 flex items-center gap-2">
              <Receipt className="size-5 text-accent-strong" /> Mes commandes
            </h2>
          </div>
          {orders.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Aucune commande" description="Vos achats apparaîtront ici." action={<Link href="/catalogue" className="btn-primary btn-sm">Parcourir le catalogue</Link>} />
            </div>
          ) : (
            <ul className="card mt-4 divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/commande/${o.id}`} className="flex items-center gap-4 p-4 hover:bg-soft/60">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        Commande n° {o.id.toString().padStart(5, "0")} <span className="font-normal text-muted">· {formatShortDate(o.createdAt)}</span>
                      </p>
                      <p className="line-clamp-1 text-xs text-muted">{o.items.map((i) => i.title).join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="price text-sm">{formatFCFA(o.total)}</p>
                      <StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Annonces */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="h3 flex items-center gap-2">
              <Tag className="size-5 text-accent-strong" /> Mes pièces en vente
            </h2>
            <Link href="/vendre" className="btn-soft btn-sm">Proposer une pièce</Link>
          </div>
          {listings.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Aucune annonce" description="Vous avez une pièce qui dort ? Proposez-la, nous nous occupons de la vente." />
            </div>
          ) : (
            <ul className="card mt-4 divide-y divide-line">
              {listings.map((p) => (
                <li key={p.id} className="flex items-center gap-4 p-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.images[0] && <img src={p.images[0].url} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{p.title}</p>
                    <p className="price text-xs text-muted">{formatFCFA(p.price)} · {p.quantity} en stock</p>
                    {p.status === "REJECTED" && p.reviewNote && <p className="mt-1 text-xs text-danger">Motif : {p.reviewNote}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={p.status} label={PRODUCT_STATUS_LABEL[p.status]} />
                    <div className="flex items-center gap-3">
                      {(p.status === "PENDING" || p.status === "APPROVED" || p.status === "REJECTED") && (
                        <Link href={`/annonce/${p.id}/modifier`} className="text-xs font-medium text-accent-strong hover:underline">
                          Modifier
                        </Link>
                      )}
                      {(p.status === "PENDING" || p.status === "APPROVED") && (
                        <form action={withdrawListing.bind(null, p.id)}>
                          <button className="text-xs text-muted hover:text-danger">Retirer</button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Demandes */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="h3 flex items-center gap-2">
              <PackageSearch className="size-5 text-accent-strong" /> Mes demandes de pièces
            </h2>
            <Link href="/demande" className="btn-soft btn-sm">Nouvelle demande</Link>
          </div>
          {requests.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Aucune demande" description="Si une pièce manque au catalogue, demandez-la : nous la cherchons pour vous." />
            </div>
          ) : (
            <ul className="card mt-4 divide-y divide-line">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted">
                      {r.modelText ?? "—"} · {formatShortDate(r.createdAt)}
                    </p>
                    {r.managerNote && <p className="mt-1 text-xs text-accent-strong">Felix Mécanic : {r.managerNote}</p>}
                  </div>
                  <StatusBadge status={r.status} label={REQUEST_STATUS_LABEL[r.status]} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
