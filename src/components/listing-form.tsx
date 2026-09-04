"use client";

import { useActionState } from "react";
import { ImagePlus } from "lucide-react";
import { createManagerListing, submitListing } from "@/actions/listings";
import type { VehicleTree } from "@/lib/vehicle-data";
import { DELIVERY_CITIES } from "@/lib/delivery";
import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";
import { VehiclePicker } from "./vehicle-picker";

export function ListingForm({
  tree,
  categories,
  mode,
  defaults,
}: {
  tree: VehicleTree;
  categories: Array<{ id: string; name: string }>;
  mode: "seller" | "manager";
  defaults: { city: string; address: string; phone: string };
}) {
  const [state, action] = useActionState(mode === "manager" ? createManagerListing : submitListing, undefined);
  const isManager = mode === "manager";

  return (
    <form action={action} className="space-y-6">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}

      <section className="card p-6">
        <h2 className="h3">La pièce</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="field sm:col-span-2">
            <span className="label">Titre</span>
            <input name="title" required minLength={5} maxLength={120} className="input" placeholder="Ex : Alternateur Toyota Hilux 2.5 D4D" />
          </label>
          <label className="field">
            <span className="label">Catégorie</span>
            <select name="categoryId" required className="input" defaultValue="">
              <option value="" disabled>
                Choisir…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">État</span>
            <select name="condition" required className="input" defaultValue="USED">
              <option value="NEW">Neuf</option>
              <option value="USED">Occasion</option>
              <option value="REFURBISHED">Reconditionné</option>
            </select>
          </label>
          <VehiclePicker tree={tree} />
          <label className="field">
            <span className="label">Prix (FCFA)</span>
            <input name="price" type="number" required min={100} step={50} inputMode="numeric" className="input font-mono" placeholder="25000" />
          </label>
          <label className="field">
            <span className="label">Quantité</span>
            <input name="quantity" type="number" required min={1} max={999} defaultValue={1} inputMode="numeric" className="input font-mono" />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Référence constructeur (facultatif)</span>
            <input name="reference" maxLength={60} className="input font-mono" placeholder="Ex : 27060-30040" />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Description</span>
            <textarea name="description" required minLength={20} className="input" placeholder="État, kilométrage, année, garantie, ce qui est inclus…" />
          </label>
          {isManager && (
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="featured" className="accent-accent" /> Mettre en avant sur l&apos;accueil
            </label>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="h3">Photos</h2>
        <p className="mt-1 text-sm text-muted">Jusqu&apos;à 6 photos (JPG, PNG, WEBP · 5 Mo max). La première sera l&apos;image principale.</p>
        <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line p-8 text-center text-sm text-muted transition-colors hover:border-accent hover:text-accent-strong">
          <ImagePlus className="size-8" />
          <span>Touchez pour choisir ou prendre des photos</span>
          <input type="file" name="images" accept="image/*" multiple required={!isManager} className="sr-only" />
        </label>
      </section>

      <section className="card p-6">
        <h2 className="h3">{isManager ? "Lieu de stockage" : "Où récupérer la pièce ?"}</h2>
        <p className="mt-1 text-sm text-muted">
          {isManager
            ? "Adresse où le livreur récupère la pièce."
            : "Ces informations ne sont visibles que par Felix Mécanic et le livreur. L'acheteur ne les voit jamais."}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="field">
            <span className="label">Ville</span>
            <select name="pickupCity" required className="input" defaultValue={DELIVERY_CITIES.some((c) => c.name === defaults.city) ? defaults.city : DELIVERY_CITIES[0].name}>
              {DELIVERY_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">Quartier / repère</span>
            <input name="pickupAddress" required defaultValue={defaults.address} className="input" />
          </label>
          <label className="field">
            <span className="label">Téléphone</span>
            <input name="pickupPhone" required inputMode="tel" defaultValue={defaults.phone} className="input" />
          </label>
        </div>
      </section>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <SubmitButton className="btn-primary btn-lg" pendingText="Envoi des photos…">
          {isManager ? "Mettre en ligne" : "Soumettre pour validation"}
        </SubmitButton>
        {!isManager && <p className="text-xs text-muted">Notre équipe vérifie chaque annonce sous 24 h avant de la publier.</p>}
      </div>
    </form>
  );
}
