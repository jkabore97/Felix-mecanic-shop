import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getVehicleTree } from "@/lib/vehicle-data";
import { RequestForm } from "./request-form";

export const metadata: Metadata = { title: "Demander une pièce" };

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ title?: string }> }) {
  const { title } = await searchParams;
  const [user, tree] = await Promise.all([getCurrentUser(), getVehicleTree()]);
  return (
    <div className="container-x max-w-3xl py-8">
      <p className="eyebrow">Pièce introuvable ?</p>
      <h1 className="h2 mt-1">Demander une pièce</h1>
      <p className="mt-2 text-sm text-muted">
        Vous ne trouvez pas ce que vous cherchez ? Décrivez la pièce et votre véhicule : Felix Mécanic la recherche auprès de son
        réseau et vous rappelle avec un prix.
      </p>
      <div className="mt-6">
        <RequestForm tree={tree} defaults={{ name: user?.name ?? "", phone: user?.phone ?? "", title: title ?? "" }} />
      </div>
    </div>
  );
}
