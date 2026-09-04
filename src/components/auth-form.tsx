"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/actions/auth";
import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action] = useActionState(mode === "login" ? login : register, undefined);
  const isLogin = mode === "login";
  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="container-x flex justify-center py-12">
      <div className="card w-full max-w-md p-7 sm:p-9">
        <p className="eyebrow">{isLogin ? "Bon retour" : "Bienvenue"}</p>
        <h1 className="h2 mt-1">{isLogin ? "Connexion" : "Créer un compte"}</h1>
        <p className="mt-2 text-sm text-muted">
          {isLogin ? "Connectez-vous avec votre numéro de téléphone." : "Un compte suffit pour acheter, vendre et suivre vos livraisons."}
        </p>

        <form action={action} className="mt-6 space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          {state?.error && <Alert tone="danger">{state.error}</Alert>}

          {!isLogin && (
            <label className="field">
              <span className="label">Nom complet</span>
              <input name="name" required autoComplete="name" className="input" placeholder="Ex : Awa Kaboré" />
            </label>
          )}
          <label className="field">
            <span className="label">Téléphone</span>
            <div className="flex">
              <span className="grid shrink-0 place-items-center rounded-l-2xl border border-r-0 border-line bg-soft px-3 text-sm text-muted">+226</span>
              <input name="phone" required inputMode="tel" autoComplete="tel-national" className="input rounded-l-none" placeholder="70 12 34 56" />
            </div>
          </label>
          {!isLogin && (
            <>
              <label className="field">
                <span className="label">E-mail (facultatif)</span>
                <input name="email" type="email" autoComplete="email" className="input" placeholder="vous@exemple.com" />
              </label>
              <label className="field">
                <span className="label">Ville</span>
                <input name="city" autoComplete="address-level2" className="input" placeholder="Ouagadougou" />
              </label>
            </>
          )}
          <label className="field">
            <span className="label">Mot de passe</span>
            <input name="password" type="password" required minLength={isLogin ? 1 : 6} autoComplete={isLogin ? "current-password" : "new-password"} className="input" />
          </label>

          <SubmitButton className="btn-primary w-full">{isLogin ? "Se connecter" : "Créer mon compte"}</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <Link href={`/inscription${q}`} className="font-semibold text-accent-strong hover:underline">
                Inscrivez-vous
              </Link>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <Link href={`/connexion${q}`} className="font-semibold text-accent-strong hover:underline">
                Connectez-vous
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
