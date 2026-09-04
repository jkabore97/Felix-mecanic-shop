"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { deliveryFeeFor } from "@/lib/delivery";

const schema = z.object({
  deliveryName: z.string().trim().min(2, "Nom du destinataire requis."),
  deliveryPhone: z.string().trim().min(8, "Téléphone de livraison requis."),
  deliveryCity: z.string().trim().min(2, "Ville requise."),
  deliveryAddress: z.string().trim().min(4, "Adresse ou repère de livraison requis."),
  deliveryNote: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["ORANGE_MONEY", "MOOV_MONEY", "CASH_ON_DELIVERY"]),
  paymentRef: z.string().trim().max(64).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(50) })).min(1, "Votre panier est vide."),
});

export type CheckoutResult = { ok: true; orderId: number } | { ok: false; error: string; removed?: string[] };

export async function checkout(input: unknown): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Connectez-vous pour commander." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const ids = d.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: "APPROVED" } });
  const removed: string[] = [];
  const lines: Array<{ productId: string; quantity: number; unitPrice: number; title: string; sellerId: string | null }> = [];
  for (const it of d.items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p || p.quantity < it.quantity) {
      removed.push(it.productId);
      continue;
    }
    lines.push({ productId: p.id, quantity: it.quantity, unitPrice: p.price, title: p.title, sellerId: p.sellerId });
  }
  if (removed.length > 0) {
    return { ok: false, error: "Certaines pièces ne sont plus disponibles en quantité suffisante. Elles ont été retirées du panier.", removed };
  }

  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const deliveryFee = deliveryFeeFor(d.deliveryCity);

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const l of lines) {
        const res = await tx.product.updateMany({
          where: { id: l.productId, quantity: { gte: l.quantity } },
          data: { quantity: { decrement: l.quantity } },
        });
        if (res.count === 0) throw new Error("STOCK");
      }
      return tx.order.create({
        data: {
          buyerId: user.id,
          paymentMethod: d.paymentMethod,
          paymentRef: d.paymentMethod === "CASH_ON_DELIVERY" ? null : d.paymentRef || null,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          deliveryName: d.deliveryName,
          deliveryPhone: d.deliveryPhone,
          deliveryCity: d.deliveryCity,
          deliveryAddress: d.deliveryAddress,
          deliveryNote: d.deliveryNote || null,
          items: { create: lines },
        },
      });
    });
    revalidatePath("/");
    revalidatePath("/catalogue");
    return { ok: true, orderId: order.id };
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") {
      return { ok: false, error: "Une pièce vient d'être vendue. Vérifiez votre panier." };
    }
    throw e;
  }
}

export async function submitPaymentRef(orderId: number, ref: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Non connecté." };
  const clean = ref.trim().slice(0, 64);
  if (!clean) return { error: "Référence requise." };
  await prisma.order.updateMany({ where: { id: orderId, buyerId: user.id, status: "PENDING_PAYMENT" }, data: { paymentRef: clean } });
  revalidatePath(`/commande/${orderId}`);
  return { success: "Référence enregistrée. Nous confirmons le paiement sous peu." };
}
