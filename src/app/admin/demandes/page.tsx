import { prisma } from "@/lib/prisma";
import { updateRequest } from "@/actions/admin";
import { formatShortDate, REQUEST_STATUS_LABEL } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import type { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminRequests() {
  const requests = await prisma.partRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { vehicleType: true, brand: true },
  });
  const statuses: RequestStatus[] = ["OPEN", "IN_PROGRESS", "FOUND", "CLOSED"];

  return (
    <>
      <PageHeader eyebrow="Demandes" title="Pièces recherchées" description="Les clients vous demandent des pièces absentes du catalogue." />
      {requests.length === 0 ? (
        <EmptyState title="Aucune demande" />
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-col gap-4 md:flex-row">
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt="" className="aspect-[5/4] w-40 shrink-0 rounded-2xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} label={REQUEST_STATUS_LABEL[r.status]} />
                    <span className="text-xs text-muted">{formatShortDate(r.createdAt)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted">
                    {[r.vehicleType?.name, r.brand?.name, r.modelText].filter(Boolean).join(" · ") || "Véhicule non précisé"}
                  </p>
                  {r.description && <p className="mt-2 text-sm">{r.description}</p>}
                  <p className="mt-2 text-sm">
                    <span className="text-muted">Contact : </span>
                    {r.contactName} · <a href={`tel:${r.contactPhone}`} className="text-accent-strong hover:underline">{r.contactPhone}</a>
                  </p>
                  <form action={updateRequest.bind(null, r.id)} className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <select name="status" className="input sm:w-52" defaultValue={r.status}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {REQUEST_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <input name="managerNote" className="input" defaultValue={r.managerNote ?? ""} placeholder="Réponse visible par le client (prix trouvé, délai…)" />
                    <button className="btn-dark btn-sm shrink-0">Mettre à jour</button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
