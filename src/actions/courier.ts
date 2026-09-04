"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function courierUpdate(orderId: number, next: "PICKED_UP" | "DELIVERED") {
  const user = await getCurrentUser();
  if (!user || user.role !== "COURIER") return;
  const order = await prisma.order.findFirst({ where: { id: orderId, courierId: user.id } });
  if (!order) return;
  if (next === "PICKED_UP" && order.status !== "ASSIGNED") return;
  if (next === "DELIVERED" && order.status !== "PICKED_UP") return;
  await prisma.order.update({ where: { id: orderId }, data: { status: next, deliveredAt: next === "DELIVERED" ? new Date() : undefined } });
  revalidatePath("/livreur");
  revalidatePath(`/commande/${orderId}`);
  revalidatePath("/admin", "layout");
}
