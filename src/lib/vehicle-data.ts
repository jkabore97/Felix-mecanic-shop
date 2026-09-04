import "server-only";
import { prisma } from "./prisma";

/** Référentiel complet (types → marques → modèles) pour les formulaires. */
export async function getVehicleTree() {
  const types = await prisma.vehicleType.findMany({
    orderBy: { sortOrder: "asc" },
    include: { brands: { orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } } },
  });
  return types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    brands: t.brands.map((b) => ({ id: b.id, name: b.name, models: b.models.map((m) => ({ id: m.id, name: m.name })) })),
  }));
}
export type VehicleTree = Awaited<ReturnType<typeof getVehicleTree>>;

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, icon: true } });
}
