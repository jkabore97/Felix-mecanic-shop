"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { OrderStatus, ProductStatus, RequestStatus, Role } from "@prisma/client";

async function manager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "MANAGER") throw new Error("Accès refusé.");
  return user;
}

function refreshCatalog() {
  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin", "layout");
}

// ---------- Annonces ----------

export async function reviewProduct(productId: string, formData: FormData) {
  const user = await manager();
  const decision = String(formData.get("decision"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const status: ProductStatus = decision === "approve" ? "APPROVED" : "REJECTED";
  await prisma.product.update({
    where: { id: productId },
    data: { status, reviewNote: note, reviewedById: user.id, reviewedAt: new Date() },
  });
  refreshCatalog();
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  await manager();
  await prisma.product.update({ where: { id: productId }, data: { status } });
  refreshCatalog();
}

export async function toggleFeatured(productId: string) {
  await manager();
  const p = await prisma.product.findUnique({ where: { id: productId }, select: { featured: true } });
  if (!p) return;
  await prisma.product.update({ where: { id: productId }, data: { featured: !p.featured } });
  refreshCatalog();
}

export async function updateProductStock(productId: string, formData: FormData) {
  await manager();
  const schema = z.object({ price: z.coerce.number().int().min(100), quantity: z.coerce.number().int().min(0).max(9999) });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await prisma.product.update({ where: { id: productId }, data: parsed.data });
  refreshCatalog();
}

// ---------- Commandes ----------

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "PAID", "CANCELLED"],
  PICKED_UP: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function updateOrder(orderId: number, formData: FormData) {
  await manager();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  const next = formData.get("status") as OrderStatus | null;
  const courierId = String(formData.get("courierId") ?? "") || null;
  const managerNote = String(formData.get("managerNote") ?? "").trim() || null;

  const data: { status?: OrderStatus; courierId?: string | null; managerNote: string | null; deliveredAt?: Date } = { managerNote };
  if (courierId !== undefined && courierId !== order.courierId) data.courierId = courierId;
  if (next && next !== order.status) {
    if (!ALLOWED[order.status].includes(next)) return;
    if (next === "ASSIGNED" && !(courierId ?? order.courierId)) return;
    data.status = next;
    if (next === "DELIVERED") data.deliveredAt = new Date();
    if (next === "CANCELLED") {
      // Remise en stock
      await prisma.$transaction(
        order.items.map((it) => prisma.product.update({ where: { id: it.productId }, data: { quantity: { increment: it.quantity } } })),
      );
    }
  } else if (data.courierId && order.status === "PAID") {
    data.status = "ASSIGNED";
  }
  await prisma.order.update({ where: { id: orderId }, data });
  revalidatePath(`/admin/commandes`);
  revalidatePath(`/admin/commandes/${orderId}`);
  revalidatePath(`/commande/${orderId}`);
  revalidatePath("/livreur");
  refreshCatalog();
}

// ---------- Demandes ----------

export async function updateRequest(requestId: string, formData: FormData) {
  await manager();
  const status = formData.get("status") as RequestStatus;
  const managerNote = String(formData.get("managerNote") ?? "").trim() || null;
  await prisma.partRequest.update({ where: { id: requestId }, data: { status, managerNote } });
  revalidatePath("/admin/demandes");
  revalidatePath("/compte");
}

// ---------- Référentiel ----------

export async function addVehicleType(formData: FormData) {
  await manager();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "car").trim() || "car";
  if (!name) return;
  const count = await prisma.vehicleType.count();
  await prisma.vehicleType.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name), icon, sortOrder: count } });
  revalidatePath("/admin/catalogue");
}

export async function deleteVehicleType(id: string) {
  await manager();
  const used = await prisma.product.count({ where: { vehicleTypeId: id } });
  if (used > 0) return;
  await prisma.vehicleType.delete({ where: { id } });
  revalidatePath("/admin/catalogue");
}

export async function addBrand(formData: FormData) {
  await manager();
  const name = String(formData.get("name") ?? "").trim();
  const vehicleTypeId = String(formData.get("vehicleTypeId") ?? "");
  if (!name || !vehicleTypeId) return;
  await prisma.brand.upsert({
    where: { vehicleTypeId_slug: { vehicleTypeId, slug: slugify(name) } },
    update: {},
    create: { name, slug: slugify(name), vehicleTypeId },
  });
  revalidatePath("/admin/catalogue");
}

export async function deleteBrand(id: string) {
  await manager();
  const used = await prisma.product.count({ where: { brandId: id } });
  if (used > 0) return;
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/catalogue");
}

export async function addModel(formData: FormData) {
  await manager();
  const name = String(formData.get("name") ?? "").trim();
  const brandId = String(formData.get("brandId") ?? "");
  const yearFrom = Number(formData.get("yearFrom")) || null;
  const yearTo = Number(formData.get("yearTo")) || null;
  if (!name || !brandId) return;
  await prisma.vehicleModel.upsert({
    where: { brandId_slug: { brandId, slug: slugify(name) } },
    update: { yearFrom, yearTo },
    create: { name, slug: slugify(name), brandId, yearFrom, yearTo },
  });
  revalidatePath("/admin/catalogue");
}

export async function deleteModel(id: string) {
  await manager();
  await prisma.vehicleModel.delete({ where: { id } });
  revalidatePath("/admin/catalogue");
}

export async function addCategory(formData: FormData) {
  await manager();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "wrench").trim() || "wrench";
  if (!name) return;
  const count = await prisma.category.count();
  await prisma.category.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name), icon, sortOrder: count } });
  revalidatePath("/admin/catalogue");
}

export async function deleteCategory(id: string) {
  await manager();
  const used = await prisma.product.count({ where: { categoryId: id } });
  if (used > 0) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/catalogue");
}

// ---------- Utilisateurs ----------

export async function resetUserPassword(
  _: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  await manager();
  const userId = String(formData.get("userId") ?? "");
  const schema = z.object({ password: z.string().min(6, "6 caractères minimum.") });
  const parsed = schema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Utilisateur introuvable." };
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  revalidatePath("/admin/utilisateurs");
  return { success: `Mot de passe de ${target.name} réinitialisé.` };
}

export async function setUserRole(userId: string, formData: FormData) {
  const me = await manager();
  if (userId === me.id) return;
  const role = formData.get("role") as Role;
  if (!["BUYER", "MANAGER", "COURIER"].includes(role)) return;
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/utilisateurs");
}
