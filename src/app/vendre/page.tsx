import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Truck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getVehicleTree } from "@/lib/vehicle-data";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = { title: "Vendre une pièce" };

export default async function SellPage() {
  const user = await getCurrentUser();
  const [tree, categories] = await Promise.all([getVehicleTree(), getCategories()]);

  return (
    <div className="container-x py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="eyebrow">Vendre</p>
          <h1 className="h2 mt-1">Proposer une pièce</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Décrivez votre pièce, ajoutez des photos et fixez votre prix. Felix Mécanic vérifie l&apos;annonce, la publie, et
            organise la récupération et la livraison quand elle est vendue.
          </p>

          {!user ? (
            <div className="card mt-6 p-6">
              <p className="font-semibold">Connectez-vous pour proposer une pièce.</p>
              <p className="mt-1 text-sm text-muted">Un compte nous permet de vous recontacter et de suivre vos ventes.</p>
              <div className="mt-4 flex gap-2">
                <Link href="/connexion?next=/vendre" className="btn-primary">Connexion</Link>
                <Link href="/inscription?next=/vendre" className="btn-ghost">Créer un compte</Link>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <ListingForm tree={tree} categories={categories} mode="seller" defaults={{ city: user.city ?? "", address: user.address ?? "", phone: user.phone }} />
            </div>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
          <Tip icon={<Eye className="size-5" />} title="Vérifiée avant publication" text="Un gestionnaire contrôle le titre, le prix et les photos, puis met l'annonce en ligne." />
          <Tip icon={<EyeOff className="size-5" />} title="Vous restez anonyme" text="L'acheteur ne voit ni votre nom ni votre adresse. Tout passe par Felix Mécanic." />
          <Tip icon={<Truck className="size-5" />} title="Zéro déplacement" text="Une fois la pièce vendue, un livreur vient la chercher chez vous et vous êtes payé." />
        </aside>
      </div>
    </div>
  );
}

function Tip({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card flex gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{text}</p>
      </div>
    </div>
  );
}
