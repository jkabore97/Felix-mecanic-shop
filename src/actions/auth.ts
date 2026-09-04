"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type ActionState = { error?: string; success?: string } | undefined;

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, "").replace(/^\+226/, "").replace(/^00226/, ""))
  .pipe(z.string().regex(/^\d{8}$/, "Numéro invalide : 8 chiffres attendus (ex. 70 12 34 56)."));

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
  const user = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Numéro ou mot de passe incorrect." };
  }
  await createSession(user.id);
  const next = safeNext(formData.get("next"));
  redirect(next !== "/" ? next : user.role === "MANAGER" ? "/admin" : user.role === "COURIER" ? "/livreur" : "/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
