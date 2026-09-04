import { requireRole } from "@/lib/auth";
import { getCategories, getVehicleTree } from "@/lib/vehicle-data";
import { ListingForm } from "@/components/listing-form";
import { PageHeader } from "@/components/ui";

export default async function NewStockPage() {
  const user = await requireRole(["MANAGER"]);
  const [tree, categories] = await Promise.all([getVehicleTree(), getCategories()]);
  return (
    <>
      <PageHeader eyebrow="Stock Felix Mécanic" title="Ajouter une pièce" description="La pièce est publiée immédiatement dans la vitrine." />
      <ListingForm tree={tree} categories={categories} mode="manager" defaults={{ city: user.city ?? "Ouagadougou", address: user.address ?? "Boutique Felix Mécanic", phone: user.phone }} />
    </>
  );
}
