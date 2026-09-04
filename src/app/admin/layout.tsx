import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["MANAGER"], "/admin");
  const [pendingProducts, pendingOrders, openRequests] = await Promise.all([
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PAID"] } } }),
    prisma.partRequest.count({ where: { status: "OPEN" } }),
  ]);
  return (
    <div className="container-x py-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <AdminNav counts={{ annonces: pendingProducts, commandes: pendingOrders, demandes: openRequests }} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
