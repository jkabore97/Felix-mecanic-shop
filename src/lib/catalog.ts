import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { ProductCardData } from "@/components/product-card";

export type CatalogFilters = {
  q?: string;
  type?: string; // slug du type de véhicule
  brand?: string; // slug de la marque
  model?: string; // slug du modèle
  category?: string; // slug de la catégorie
  condition?: string; // NEW | USED | REFURBISHED
  min?: number;
  max?: number;
  sort?: "recent" | "price-asc" | "price-desc";
  page?: number;
};

export const PAGE_SIZE = 24;

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  condition: true,
  quantity: true,
  category: { select: { name: true } },
  vehicleType: { select: { name: true } },
  brand: { select: { name: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export function toCard(p: CardRow): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    condition: p.condition,
    quantity: p.quantity,
    image: p.images[0]?.url ?? null,
    categoryName: p.category.name,
    vehicleTypeName: p.vehicleType.name,
    brandName: p.brand?.name ?? null,
  };
}

/** Seules les pièces validées et en stock sont visibles. */
export const VISIBLE: Prisma.ProductWhereInput = { status: "APPROVED", quantity: { gt: 0 } };

function buildWhere(f: CatalogFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [VISIBLE];
  if (f.q) {
    const q = f.q.trim();
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { compatibilities: { some: { model: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    });
  }
  if (f.type) and.push({ vehicleType: { slug: f.type } });
  if (f.brand) and.push({ brand: { slug: f.brand } });
  if (f.model) and.push({ compatibilities: { some: { model: { slug: f.model } } } });
  if (f.category) and.push({ category: { slug: f.category } });
  if (f.condition === "NEW" || f.condition === "USED" || f.condition === "REFURBISHED") and.push({ condition: f.condition });
  if (f.min) and.push({ price: { gte: f.min } });
  if (f.max) and.push({ price: { lte: f.max } });
  return { AND: and };
}

export async function searchProducts(f: CatalogFilters) {
  const where = buildWhere(f);
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    f.sort === "price-asc" ? [{ price: "asc" }] : f.sort === "price-desc" ? [{ price: "desc" }] : [{ featured: "desc" }, { createdAt: "desc" }];
  const page = Math.max(1, f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, select: cardSelect, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
  ]);
  return { items: rows.map(toCard), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export type Facet = { slug: string; name: string; count: number };

/**
 * Facettes calculées uniquement à partir des pièces visibles : un type, une marque,
 * un modèle ou une catégorie sans aucune pièce n'apparaît jamais dans les filtres.
 */
export async function getFacets(f: CatalogFilters) {
  // Les facettes d'une dimension ignorent le filtre de cette même dimension
  // (pour pouvoir changer de marque sans la « perdre »).
  const base = (omit: (keyof CatalogFilters)[]) => {
    const copy: CatalogFilters = { ...f, page: undefined };
    for (const k of omit) delete copy[k];
    return buildWhere(copy);
  };

  const [types, brands, categories, conditions, models] = await Promise.all([
    prisma.vehicleType.findMany({
      where: { products: { some: base(["type", "brand", "model"]) } },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, icon: true, _count: { select: { products: { where: base(["type", "brand", "model"]) } } } },
    }),
    prisma.brand.findMany({
      where: { products: { some: base(["brand", "model"]) } },
      orderBy: { name: "asc" },
      select: { slug: true, name: true, _count: { select: { products: { where: base(["brand", "model"]) } } } },
    }),
    prisma.category.findMany({
      where: { products: { some: base(["category"]) } },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, icon: true, _count: { select: { products: { where: base(["category"]) } } } },
    }),
    prisma.product.groupBy({ by: ["condition"], where: base(["condition"]), _count: { _all: true } }),
    f.brand
      ? prisma.vehicleModel.findMany({
          where: { brand: { slug: f.brand }, compatibilities: { some: { product: base(["model"]) } } },
          orderBy: { name: "asc" },
          select: { slug: true, name: true, _count: { select: { compatibilities: { where: { product: base(["model"]) } } } } },
        })
      : Promise.resolve([]),
  ]);

  return {
    types: types.map((t) => ({ slug: t.slug, name: t.name, icon: t.icon, count: t._count.products })),
    brands: brands.map((b) => ({ slug: b.slug, name: b.name, count: b._count.products })),
    models: models.map((m) => ({ slug: m.slug, name: m.name, count: m._count.compatibilities })),
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, count: c._count.products })),
    conditions: conditions.map((c) => ({ slug: c.condition, name: c.condition, count: c._count._all })),
  };
}

export async function getFeatured(take = 8) {
  const rows = await prisma.product.findMany({
    where: VISIBLE,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: cardSelect,
    take,
  });
  return rows.map(toCard);
}

export async function getRelated(productId: string, categoryId: string, vehicleTypeId: string, take = 4) {
  const rows = await prisma.product.findMany({
    where: { ...VISIBLE, id: { not: productId }, OR: [{ categoryId }, { vehicleTypeId }] },
    orderBy: [{ categoryId: "asc" }, { createdAt: "desc" }],
    select: cardSelect,
    take,
  });
  return rows.map(toCard);
}

/** Types de véhicules qui ont réellement des pièces (pour l'accueil). */
export async function getActiveVehicleTypes() {
  const rows = await prisma.vehicleType.findMany({
    where: { products: { some: VISIBLE } },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, icon: true, _count: { select: { products: { where: VISIBLE } } } },
  });
  return rows.map((r) => ({ slug: r.slug, name: r.name, icon: r.icon, count: r._count.products }));
}

export async function getActiveCategories() {
  const rows = await prisma.category.findMany({
    where: { products: { some: VISIBLE } },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, icon: true, _count: { select: { products: { where: VISIBLE } } } },
  });
  return rows.map((r) => ({ slug: r.slug, name: r.name, icon: r.icon, count: r._count.products }));
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = Number(g(k));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  const sort = g("sort");
  return {
    q: g("q")?.trim() || undefined,
    type: g("type") || undefined,
    brand: g("brand") || undefined,
    model: g("model") || undefined,
    category: g("category") || undefined,
    condition: g("condition") || undefined,
    min: num("min"),
    max: num("max"),
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "recent",
    page: num("page") ?? 1,
  };
}
