"use client";

import { useActionState } from "react";
import { ImagePlus } from "lucide-react";
import { updateListing } from "@/actions/listings";
import type { VehicleTree } from "@/lib/vehicle-data";
import { DELIVERY_CITIES } from "@/lib/delivery";
import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";
import { VehiclePicker } from "./vehicle-picker";

export type EditableProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  condition: "NEW" | "USED" | "REFURBISHED";
  reference: string | null;
  featured: boolean;
  categoryId: string;
  vehicleTypeId: string;
  brandId: string | null;
  pickupCity: string | null;
  pickupAddress: string | null;
  pickupPhone: string | null;
  modelIds: string[];
  images: Array<{ id: string; url: string }>;
};

export function EditListingForm({
  product,
  tree,
  categories,
  isManager,
}: {
  product: EditableProduct;
  tree: VehicleTree;
  categories: Array<{ id: string; name: string }>;
  isManager: boolean;
}) {
  const [state, formAction] = useActionState(updateListing, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="productId" value={product.id} />
      {state?.error && <Alert tone="danger">{state.error}</Alert>}

      <section className="card p-6">
        <h2 className="h3">La pièce</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="field sm:col-span-2">
            <span className="label">Titre</span>
            <input name="title" required minLength={5} maxLength={120} defaultValue={product.title} className="input" />
          </label>
          <label className="field">
            <span className="label">Catégorie</span>
            <select name="categoryId" required className="input" defaultValue={product.categoryId}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">État</span>
            <select name="condition" required className="input" defaultValue={product.condition}>
              <option value="NEW">Neuf</option>
              <option value="USED">Occasion</option>
              <option value="REFURBISHED">Reconditionné</option>
            </select>
          </label>
          <VehiclePicker
            tree={tree}
            defaultTypeId={product.vehicleTypeId}
            defaultBrandId={product.brandId ?? undefined}
            defaultModelIds={product.modelIds}
          />
          <label className="field">
            <span className="label">Prix (FCFA)</span>
            <input name="price" type="number" required min={100} step={50} inputMode="numeric" defaultValue={product.price} className="input font-mono" />
          </label>
          <label className="field">
            <span className="label">Quantité</span>
            <input name="quantity" type="number" required min={1} max={999} defaultValue={product.quantity} inputMode="numeric" className="input font-mono" />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Référence constructeur (facultatif)</span>
            <input name="reference" maxLength={60} defaultValue={product.reference ?? ""} className="input font-mono" />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Description</span>
            <textarea name="description" required minLength={20} defaultValue={product.description} className="input" />
          </label>
          {isManager && (
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="featured" defaultChecked={product.featured} className="accent-accent" /> Mettre en avant sur l&apos;accueil
            </label>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="h3">Photos</h2>
        <p className="mt-1 text-sm text-muted">Décochez une photo pour la retirer. Ajoutez-en de nouvelles ci-dessous.</p>
        {product.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {product.images.map((img) => (
              <label key={img.id} className="group relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-line has-[:checked]:border-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="aspect-[5/4] w-full object-cover transition-opacity group-has-[:not(:checked)]:opacity-30" />
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-ink/70 px-2 py-1 text-[11px] font-semibold text-white">
                  <input type="checkbox" name="keepImageIds" value={img.id} defaultChecked className="accent-accent" />
                  Garder
                </span>
              </label>
            ))}
          </div>
        )}
        <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line p-8 text-center text-sm text-muted transition-colors hover:border-accent hover:text-accent-strong">
          <ImagePlus className="size-8" />
          <span>Ajouter des photos (JPG, PNG, WEBP · 5 Mo max)</span>
          <input type="file" name="images" accept="image/*" multiple className="sr-only" />
        </label>
      </section>

      <section className="card p-6">
        <h2 className="h3">Récupération</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="field">
            <span className="label">Ville</span>
            <select name="pickupCity" required className="input" defaultValue={product.pickupCity ?? DELIVERY_CITIES[0].name}>
              {DELIVERY_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">Quartier / repère</span>
            <input name="pickupAddress" required defaultValue={product.pickupAddress ?? ""} className="input" />
          </label>
          <label className="field">
            <span className="label">Téléphone</span>
            <input name="pickupPhone" required inputMode="tel" defaultValue={product.pickupPhone ?? ""} className="input" />
          </label>
        </div>
      </section>

      <div className="flex gap-2">
        <SubmitButton className="btn-primary btn-lg" pendingText="Enregistrement…">
          Enregistrer les modifications
        </SubmitButton>
      </div>
    </form>
  );
}
