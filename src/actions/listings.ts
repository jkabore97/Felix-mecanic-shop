"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { saveImage, saveImages } from "@/lib/upload";
import { uniqueSlug } from "@/lib/slug";
import type { ActionState } from "./auth";

const listingSchema = z.object({
  title: z.string().trim().min(5, "Titre trop court (5 caractères minimum).").max(120),
  description: z.string().trim().min(20, "Décrivez la pièce en quelques phrases (20 caractères minimum)."),
  price: z.coerce.number().int().min(100, "Prix invalide.").max(100_000_000),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
  condition: z.enum(["NEW", "USED", "REFURBISHED"]),
  reference: z.string().trim().max(60).optional(),
  categoryId: z.string().min(1, "Choisissez une catégorie."),
  vehicleTypeId: z.string().min(1, "Choisissez un type de véhicule."),
  brandId: z.string().optional(),
  pickupCity: z.string().trim().min(2, "Ville de récupération requise."),
  pickupAddress: z.string().trim().min(4, "Adresse de récupération requise."),
  pickupPhone: z.string().trim().min(8, "Téléphone de contact requis."),
});

async function parseListing(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = listingSchema.safeParse({ ...raw, brandId: raw.brandId || undefined, reference: raw.reference || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const d = parsed.data;

  const [category, vehicleType] = await Promise.all([
    prisma.category.findUnique({ where: { id: d.categoryId } }),
    prisma.vehicleType.findUnique({ where: { id: d.vehicleTypeId } }),
  ]);
  if (!category || !vehicleType) return { error: "Catégorie ou type de véhicule invalide." } as const;
  if (d.brandId) {
    const brand = await prisma.brand.findFirst({ where: { id: d.brandId, vehicleTypeId: d.vehicleTypeId } });
    if (!brand) return { error: "Marque invalide pour ce type de véhicule." } as const;
  }
  const modelIds = formData.getAll("modelIds").map(String).filter(Boolean);
  const models = d.brandId && modelIds.length ? await prisma.vehicleModel.findMany({ where: { id: { in: modelIds }, brandId: d.brandId } }) : [];

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  return { data: d, modelIds: models.map((m) => m.id), files } as const;
}

/** Un utilisateur propose une pièce → en attente de validation. */
export async function submitListing(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/vendre");
  const r = await parseListing(formData);
  if ("error" in r) return { error: r.error };
  if (r.files.length === 0) return { error: "Ajoutez au moins une photo de la pièce." };

  let urls: string[];
  try {
    urls = await saveImages(r.files);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de l'envoi des images." };
  }

  const product = await prisma.product.create({
    data: {
      ...r.data,
      brandId: r.data.brandId ?? null,
      reference: r.data.reference ?? null,
      slug: uniqueSlug(r.data.title),
      status: "PENDING",
      sellerId: user.id,
      images: { create: urls.map((url, i) => ({ url, sortOrder: i, alt: r.data.title })) },
      compatibilities: { create: r.modelIds.map((modelId) => ({ modelId })) },
    },
  });
  redirect(`/compte?annonce=${product.id}`);
}

/** Le gestionnaire ajoute une pièce à son propre stock → directement en ligne. */
export async function createManagerListing(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "MANAGER") return { error: "Accès refusé." };
  const r = await parseListing(formData);
  if ("error" in r) return { error: r.error };

  let urls: string[] = [];
  try {
    urls = await saveImages(r.files);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de l'envoi des images." };
  }
  if (urls.length === 0) {
    const cat = await prisma.category.findUnique({ where: { id: r.data.categoryId } });
    const fallback: Record<string, string> = {
      moteur: "moteur", freinage: "freinage", "suspension-direction": "suspension", "electrique-batterie": "electrique",
      "filtres-entretien": "filtres", "pneus-jantes": "pneus", transmission: "transmission", carrosserie: "carrosserie",
      eclairage: "eclairage", refroidissement: "refroidissement", echappement: "echappement", accessoires: "accessoires",
    };
    urls = [`/images/parts/${fallback[cat?.slug ?? ""] ?? "accessoires"}.svg`];
  }

  await prisma.product.create({
    data: {
      ...r.data,
      brandId: r.data.brandId ?? null,
      reference: r.data.reference ?? null,
      slug: uniqueSlug(r.data.title),
      status: "APPROVED",
      featured: formData.get("featured") === "on",
      sellerId: null,
      reviewedById: user.id,
      reviewedAt: new Date(),
      images: { create: urls.map((url, i) => ({ url, sortOrder: i, alt: r.data.title })) },
      compatibilities: { create: r.modelIds.map((modelId) => ({ modelId })) },
    },
  });
  revalidatePath("/");
  revalidatePath("/catalogue");
  redirect("/admin/annonces?statut=APPROVED");
}

/** Demande de pièce introuvable (connecté ou non). */
export async function submitPartRequest(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const schema = z.object({
    contactName: z.string().trim().min(2, "Votre nom est requis."),
    contactPhone: z.string().trim().min(8, "Votre téléphone est requis."),
    title: z.string().trim().min(3, "Indiquez le nom de la pièce.").max(120),
    description: z.string().trim().max(2000).optional(),
    modelText: z.string().trim().max(120).optional(),
    vehicleTypeId: z.string().optional(),
    brandId: z.string().optional(),
  });
  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse({ ...raw, vehicleTypeId: raw.vehicleTypeId || undefined, brandId: raw.brandId || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  let imageUrl: string | null = null;
  try {
    const f = formData.get("image");
    imageUrl = await saveImage(f instanceof File ? f : null);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de l'envoi de l'image." };
  }

  await prisma.partRequest.create({
    data: {
      userId: user?.id ?? null,
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      title: d.title,
      description: d.description || null,
      modelText: d.modelText || null,
      vehicleTypeId: d.vehicleTypeId ?? null,
      brandId: d.brandId ?? null,
      imageUrl,
    },
  });
  return { success: "Demande envoyée ! Felix Mécanic vous contacte dès qu'une pièce correspondante est trouvée." };
}

export async function withdrawListing(productId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.product.updateMany({ where: { id: productId, sellerId: user.id, status: { in: ["PENDING", "APPROVED"] } }, data: { status: "ARCHIVED" } });
  revalidatePath("/compte");
  revalidatePath("/catalogue");
}
