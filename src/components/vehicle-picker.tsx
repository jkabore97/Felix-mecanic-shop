"use client";

import { useState } from "react";
import type { VehicleTree } from "@/lib/vehicle-data";

/** Sélecteur dépendant Type → Marque → Modèles, alimenté par le référentiel du gestionnaire. */
export function VehiclePicker({
  tree,
  withModels = true,
  required = true,
  defaultTypeId,
}: {
  tree: VehicleTree;
  withModels?: boolean;
  required?: boolean;
  defaultTypeId?: string;
}) {
  const [typeId, setTypeId] = useState(defaultTypeId ?? "");
  const [brandId, setBrandId] = useState("");
  const type = tree.find((t) => t.id === typeId);
  const brand = type?.brands.find((b) => b.id === brandId);

  return (
    <>
      <label className="field">
        <span className="label">Type de véhicule</span>
        <select
          name="vehicleTypeId"
          required={required}
          className="input"
          value={typeId}
          onChange={(e) => {
            setTypeId(e.target.value);
            setBrandId("");
          }}
        >
          <option value="">{required ? "Choisir…" : "Non précisé"}</option>
          {tree.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">Marque</span>
        <select name="brandId" className="input" value={brandId} onChange={(e) => setBrandId(e.target.value)} disabled={!type}>
          <option value="">{type ? "Toutes marques / universel" : "Choisissez d'abord un type"}</option>
          {type?.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      {withModels && brand && brand.models.length > 0 && (
        <div className="field sm:col-span-2">
          <span className="label">Modèles compatibles</span>
          <div className="flex flex-wrap gap-2">
            {brand.models.map((m) => (
              <label key={m.id} className="pill cursor-pointer has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white">
                <input type="checkbox" name="modelIds" value={m.id} className="sr-only" />
                {m.name}
              </label>
            ))}
          </div>
          <p className="help">Cochez tous les modèles sur lesquels la pièce se monte.</p>
        </div>
      )}
    </>
  );
}
