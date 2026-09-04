"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Camera } from "lucide-react";
import { submitPartRequest } from "@/actions/listings";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { VehiclePicker } from "@/components/vehicle-picker";
import type { VehicleTree } from "@/lib/vehicle-data";

export function RequestForm({ tree, defaults }: { tree: VehicleTree; defaults: { name: string; phone: string; title: string } }) {
  const [state, action] = useActionState(submitPartRequest, undefined);

  if (state?.success) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-semibold">Merci, c&apos;est noté !</p>
        <p className="mt-2 text-sm text-muted">{state.success}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/catalogue" className="btn-primary">Retour au catalogue</Link>
          <Link href="/compte" className="btn-ghost">Mes demandes</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-6">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span className="label">Votre nom</span>
          <input name="contactName" required defaultValue={defaults.name} className="input" />
        </label>
        <label className="field">
          <span className="label">Votre téléphone</span>
          <input name="contactPhone" required inputMode="tel" defaultValue={defaults.phone} className="input" />
        </label>
        <label className="field sm:col-span-2">
          <span className="label">Pièce recherchée</span>
          <input name="title" required minLength={3} defaultValue={defaults.title} className="input" placeholder="Ex : Pompe à injection Nissan Patrol" />
        </label>
        <VehiclePicker tree={tree} withModels={false} required={false} />
        <label className="field sm:col-span-2">
          <span className="label">Modèle, année, motorisation</span>
          <input name="modelText" className="input" placeholder="Ex : Patrol Y61 TD42, 2005" />
        </label>
        <label className="field sm:col-span-2">
          <span className="label">Détails (facultatif)</span>
          <textarea name="description" className="input" placeholder="Référence, côté (gauche/droite), neuf ou occasion accepté, budget…" />
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line p-4 text-sm text-muted hover:border-accent hover:text-accent-strong sm:col-span-2">
          <Camera className="size-5" />
          <span>Ajouter une photo de la pièce ou de l&apos;ancienne (facultatif)</span>
          <input type="file" name="image" accept="image/*" className="sr-only" />
        </label>
      </div>
      <SubmitButton className="btn-primary btn-lg">Envoyer ma demande</SubmitButton>
    </form>
  );
}
