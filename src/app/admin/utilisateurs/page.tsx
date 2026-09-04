import { prisma } from "@/lib/prisma";
import { setUserRole } from "@/actions/admin";
import { getCurrentUser } from "@/lib/auth";
import { formatShortDate, ROLE_LABEL } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, products: true, deliveries: true } } },
  });
  const roles: Role[] = ["BUYER", "COURIER", "MANAGER"];

  return (
    <>
      <PageHeader eyebrow="Utilisateurs" title="Comptes" description="Promouvez un compte en livreur ou en gestionnaire." />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Activité</th>
              <th>Inscrit le</th>
              <th>Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td className="font-mono text-xs">{u.phone}</td>
                <td className="text-xs text-muted">{u.city ?? "—"}</td>
                <td className="text-xs text-muted">
                  {u._count.orders} cmd · {u._count.products} annonces{u.role === "COURIER" ? ` · ${u._count.deliveries} livraisons` : ""}
                </td>
                <td className="text-xs text-muted">{formatShortDate(u.createdAt)}</td>
                <td>
                  {u.id === me?.id ? (
                    <span className="badge-info">{ROLE_LABEL[u.role]} (vous)</span>
                  ) : (
                    <form action={setUserRole.bind(null, u.id)} className="flex gap-1">
                      <select name="role" defaultValue={u.role} className="input h-9 w-36 py-1 text-xs">
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                      <button className="btn-soft btn-sm">OK</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
