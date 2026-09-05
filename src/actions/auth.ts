"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export type ActionState = { error?: string; success?: string } | undefined;

const phone = z
  .string()
  .trim()
  .transform((v) => {
    // Normalise : supprime espaces/tirets/points/parenthèses, convertit 00xx en +xx.
    let s = v.replace(/[\s.()\-]/g, "");
    if (s.startsWith("00")) s = "+" + s.slice(2);
    // Numéro local burkinabè à 8 chiffres → ajoute l'indicatif +226.
    if (/^\d{8}$/.test(s)) s = "+226" + s;
    return s;
  })
  .pipe(
    z
      .string()
      .regex(/^\+\d{8,15}$/, "Numéro invalide. Incluez l'indicatif pays, ex. +1 418 555 1234 ou +226 70 12 34 56."),
  );

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function register(_: ActionState, formData: FormData): Promise<ActionState> {
  const schema = z.object({
    name: z.string().trim().min(2, "Votre nom est requis."),
    phone,
    email: z.string().trim().email("E-mail invalide.").optional().or(z.literal("")),
    password: z.string().min(6, "Mot de passe : 6 caractères minimum."),
    city: z.string().trim().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const exists = await prisma.user.findUnique({ where: { phone: d.phone } });
  if (exists) return { error: "Un compte existe déjà avec ce numéro. Connectez-vous." };
  if (d.email) {
    const e = await prisma.user.findUnique({ where: { email: d.email } });
    if (e) return { error: "Cet e-mail est déjà utilisé." };
  }
  const user = await prisma.user.create({
    data: { name: d.name, phone: d.phone, email: d.email || null, passwordHash: await hashPassword(d.password), city: d.city || null },
  });
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const schema = z.object({ phone, password: z.string().min(1, "Mot de passe requis.") });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  // Tolère les anciens numéros locaux à 8 chiffres (ex. comptes de démonstration).
  const p = parsed.data.phone;
  const legacy = p.match(/^\+226(\d{8})$/);
  const candidates = legacy ? [p, legacy[1]] : [p];
  const user = await prisma.user.findFirst({ where: { phone: { in: candidates } } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Numéro ou mot de passe incorrect." };
  }
  await createSession(user.id);
  const next = safeNext(formData.get("next"));
  redirect(next !== "/" ? next : user.role === "MANAGER" ? "/admin" : user.role === "COURIER" ? "/livreur" : "/");
}

export async function changePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Connectez-vous d'abord." };
  const schema = z
    .object({
      current: z.string().min(1, "Mot de passe actuel requis."),
      next: z.string().min(6, "Nouveau mot de passe : 6 caractères minimum."),
      confirm: z.string().min(1, "Confirmez le nouveau mot de passe."),
    })
    .refine((d) => d.next === d.confirm, { message: "Les deux mots de passe ne correspondent pas.", path: ["confirm"] });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const full = await prisma.user.findUnique({ where: { id: user.id } });
  if (!full || !(await verifyPassword(parsed.data.current, full.passwordHash))) {
    return { error: "Mot de passe actuel incorrect." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  return { success: "Mot de passe mis à jour." };
}

export async function logout() {
  await destroySession();
  redirect("/");
}
