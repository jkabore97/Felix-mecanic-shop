import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { reviewProduct, setProductStatus, toggleFeatured, updateProductStock } from "@/actions/admin";
import { CONDITION_LABEL, formatFCFA, formatShortDate, PRODUCT_STATUS_LABEL } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import type { ProductStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const TABS: ProductStatus[] = ["PENDING", "APPROVED", "REJECTED", "ARCHIVED"];

export default async function AdminListings({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const status: ProductStatus = TABS.includes(statut as ProductStatus) ? (statut as ProductStatus) : "PENDING";
  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where: { status },
      orderBy: status === "PENDING" ? { createdAt: "asc" } : { updatedAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        seller: { select: { name: true, phone: true } },
        category: true,
        vehicleType: true,
        brand: true,
        compatibilities: { include: { model: true } },
      },
    }),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = (s: ProductStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Annonces"
        title="Pièces & annonces"
        description="Validez les pièces proposées par les vendeurs, gérez votre stock et la mise en avant."
        action={
          <Link href="/admin/annonces/nouvelle" className="btn-primary">
            <Plus className="size-4" /> Ajouter au stock
          </Link>
        }
      />
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <Link key={t} href={`/admin/annonces?statut=${t}`} className={`pill shrink-0 ${t === status ? "pill-active" : ""}`}>
            {PRODUCT_STATUS_LABEL[t]} <span className="opacity-60">{countOf(t)}</span>
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Aucune annonce ici" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {products.map((p) => (
            <li key={p.id} className="card p-5">
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="flex gap-2 md:w-48 md:flex-col">
                  {p.images.slice(0, 3).map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={img.id} src={img.url} alt="" className="aspect-[5/4] w-24 rounded-2xl object-cover md:w-full" />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} label={PRODUCT_STATUS_LABEL[p.status]} />
                    <span className="badge-neutral">{CONDITION_LABEL[p.condition]}</span>
                    {p.featured && <span className="badge bg-ink text-lime">En avant</span>}
                    {p.sellerId ? <span className="badge-info">Vendeur particulier</span> : <span className="badge-success">Stock Felix</span>}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted">
                    {p.vehicleType.name}
                    {p.brand ? ` · ${p.brand.name}` : ""} · {p.category.name}
                    {p.reference ? ` · Réf. ${p.reference}` : ""} · soumis le {formatShortDate(p.createdAt)}
                  </p>
                  {p.compatibilities.length > 0 && (
                    <p className="mt-1 text-xs text-muted">Compatible : {p.compatibilities.map((c) => c.model.name).join(", ")}</p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm">{p.description}</p>

                  <div className="mt-3 grid gap-2 rounded-2xl bg-soft p-3 text-xs sm:grid-cols-2">
                    <p>
                      <span className="text-muted">Vendeur : </span>
                      {p.seller ? `${p.seller.name} · ${p.seller.phone}` : "Felix Mécanic"}
                    </p>
                    <p>
                      <span className="text-muted">Récupération : </span>
                      {p.pickupAddress}, {p.pickupCity} · {p.pickupPhone}
                    </p>
                  </div>

                  {p.status === "REJECTED" && p.reviewNote && <p className="mt-2 text-xs text-danger">Motif : {p.reviewNote}</p>}

                  {/* Prix & stock */}
                  <form action={updateProductStock.bind(null, p.id)} className="mt-4 flex flex-wrap items-end gap-2">
                    <label className="field">
                      <span className="label">Prix (FCFA)</span>
                      <input name="price" type="number" min={100} step={50} defaultValue={p.price} className="input w-36 font-mono" />
                    </label>
                    <label className="field">
                      <span className="label">Stock</span>
                      <input name="quantity" type="number" min={0} defaultValue={p.quantity} className="input w-24 font-mono" />
                    </label>
                    <button className="btn-soft btn-sm">Enregistrer</button>
                    <span className="price ml-auto text-lg">{formatFCFA(p.price)}</span>
                  </form>

                  {/* Actions */}
                  {p.status === "PENDING" ? (
                    <form action={reviewProduct.bind(null, p.id)} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input name="note" className="input sm:max-w-sm" placeholder="Note pour le vendeur (motif de refus, remarque…)" />
                      <div className="flex gap-2">
                        <button name="decision" value="approve" className="btn-primary btn-sm">Valider & publier</button>
                        <button name="decision" value="reject" className="btn-danger btn-sm">Refuser</button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.status === "APPROVED" && (
                        <>
                          <form action={toggleFeatured.bind(null, p.id)}>
                            <button className="btn-ghost btn-sm">
                              <Star className={`size-4 ${p.featured ? "fill-amber text-amber" : ""}`} /> {p.featured ? "Retirer de l'accueil" : "Mettre en avant"}
                            </button>
                          </form>
                          <Link href={`/piece/${p.slug}`} className="btn-ghost btn-sm">Voir la fiche</Link>
                          <form action={setProductStatus.bind(null, p.id, "ARCHIVED")}>
                            <button className="btn-danger btn-sm">Archiver</button>
                          </form>
                        </>
                      )}
                      {(p.status === "REJECTED" || p.status === "ARCHIVED") && (
                        <form action={setProductStatus.bind(null, p.id, "APPROVED")}>
                          <button className="btn-primary btn-sm">Remettre en ligne</button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
