import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA, CONDITION_LABEL } from "@/lib/format";
import { getRelated, VISIBLE } from "@/lib/catalog";
import { Gallery } from "@/components/gallery";
import { Breadcrumbs } from "@/components/ui";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, ...VISIBLE },
    include: {
      category: true,
      vehicleType: true,
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      compatibilities: { include: { model: { include: { brand: true } } } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, select: { title: true, description: true } });
  return p ? { title: p.title, description: p.description.slice(0, 160) } : { title: "Pièce introuvable" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const related = await getRelated(p.id, p.categoryId, p.vehicleTypeId);

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[
          { href: "/", label: "Accueil" },
          { href: "/catalogue", label: "Catalogue" },
          { href: `/catalogue?type=${p.vehicleType.slug}`, label: p.vehicleType.name },
          { href: `/catalogue?category=${p.category.slug}`, label: p.category.name },
          { label: p.title },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Gallery images={p.images} title={p.title} />

        <div>
          <div className="flex flex-wrap gap-2">
            <span className={p.condition === "NEW" ? "badge bg-ink text-lime" : "badge-neutral"}>{CONDITION_LABEL[p.condition]}</span>
            {p.sellerId ? <span className="badge-info">Pièce d&apos;un particulier · vérifiée</span> : <span className="badge-success">Stock Felix Mécanic</span>}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {p.vehicleType.name}
            {p.brand ? ` · ${p.brand.name}` : ""} · {p.category.name}
            {p.reference ? ` · Réf. ${p.reference}` : ""}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="price text-3xl">{formatFCFA(p.price)}</span>
            <span className="text-sm text-muted">
              {p.quantity > 5 ? "En stock" : p.quantity > 1 ? `${p.quantity} disponibles` : "Dernière pièce"}
            </span>
          </div>

          <div className="mt-6">
            <AddToCartButton product={{ productId: p.id, slug: p.slug, title: p.title, price: p.price, image: p.images[0]?.url ?? null, maxQuantity: p.quantity }} />
          </div>

          <div className="card mt-6 divide-y divide-line">
            <Row icon={<Truck className="size-5 text-accent-strong" />} title="Livraison par nos livreurs" text="Ouagadougou et Bobo-Dioulasso. Frais calculés à la commande." />
            <Row icon={<ShieldCheck className="size-5 text-accent-strong" />} title="Paiement sécurisé" text="Orange Money, Moov Money ou à la livraison. Felix Mécanic confirme chaque commande." />
            <Row icon={<CheckCircle2 className="size-5 text-accent-strong" />} title="Pièce vérifiée" text="Chaque annonce est contrôlée par notre équipe avant d'être mise en ligne." />
          </div>

          <section className="mt-8">
            <h2 className="h3">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">{p.description}</p>
          </section>

          {p.compatibilities.length > 0 && (
            <section className="mt-8">
              <h2 className="h3">Compatibilité</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.compatibilities.map((c) => (
                  <Link
                    key={c.modelId}
                    href={`/catalogue?type=${p.vehicleType.slug}&brand=${c.model.brand.slug}&model=${c.model.slug}`}
                    className="pill"
                  >
                    {c.model.brand.name} {c.model.name}
                    {c.model.yearFrom ? ` (${c.model.yearFrom}${c.model.yearTo ? `–${c.model.yearTo}` : "+"})` : ""}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <p className="eyebrow">Vous aimerez aussi</p>
          <h2 className="h2 mt-1">Pièces similaires</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-4">
      {icon}
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{text}</p>
      </div>
    </div>
  );
}
