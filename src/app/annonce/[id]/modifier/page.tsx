import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getCategories, getVehicleTree } from "@/lib/vehicle-data";
import { EditListingForm } from "@/components/edit-listing-form";
import { Breadcrumbs } from "@/components/ui";
import { PRODUCT_STATUS_LABEL } from "@/lib/format";

export const metadata: Metadata = { title: "Modifier une annonce" };
export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/annonce/${id}/modifier`);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, compatibilities: true },
  });
  if (!product) notFound();

  const isManager = user.role === "MANAGER";
  const isOwner = !!product.sellerId && product.sellerId === user.id;
  if (!isManager && !isOwner) notFound();

  const [tree, categories] = await Promise.all([getVehicleTree(), getCategories()]);

  const backHref = isManager ? `/admin/annonces?statut=${product.status}` : "/compte";

  return (
    <div className="container-x max-w-4xl py-8">
      <Breadcrumbs
        items={[
          isManager ? { href: "/admin/annonces", label: "Annonces" } : { href: "/compte", label: "Mon compte" },
          { label: "Modifier" },
        ]}
      />
      <div className="mt-4 mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Modifier</p>
          <h1 className="h2 mt-1">{product.title}</h1>
          <p className="mt-1 text-sm text-muted">Statut actuel : {PRODUCT_STATUS_LABEL[product.status]}</p>
        </div>
        <Link href={backHref} className="btn-ghost btn-sm">Annuler</Link>
      </div>

      {!isManager && product.status === "REJECTED" && (
        <p className="mb-4 rounded-2xl bg-amber-soft p-4 text-sm text-amber">
          Cette annonce a été refusée. Après vos corrections, elle sera renvoyée pour validation.
        </p>
      )}

      <EditListingForm
        isManager={isManager}
        tree={tree}
        categories={categories}
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          condition: product.condition,
          reference: product.reference,
          featured: product.featured,
          categoryId: product.categoryId,
          vehicleTypeId: product.vehicleTypeId,
          brandId: product.brandId,
          pickupCity: product.pickupCity,
          pickupAddress: product.pickupAddress,
          pickupPhone: product.pickupPhone,
          modelIds: product.compatibilities.map((c) => c.modelId),
          images: product.images.map((i) => ({ id: i.id, url: i.url })),
        }}
      />
    </div>
  );
}
