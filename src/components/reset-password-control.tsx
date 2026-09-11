"use client";

import { useActionState } from "react";
import { resetUserPassword } from "@/actions/admin";
import { SubmitButton } from "./submit-button";

export function ResetPasswordControl({ userId, userName }: { userId: string; userName: string }) {
  const [state, action] = useActionState(resetUserPassword, undefined);
  return (
    <details className="relative">
      <summary className="btn-ghost btn-sm cursor-pointer list-none">Réinitialiser le mot de passe</summary>
      <form action={action} className="mt-2 space-y-2 rounded-2xl border border-line bg-surface p-3 shadow-soft">
        <input type="hidden" name="userId" value={userId} />
        <p className="text-xs text-muted">Nouveau mot de passe pour {userName}</p>
        <input name="password" type="text" required minLength={6} placeholder="6 caractères min." className="input h-9 py-1 text-sm" />
        <SubmitButton className="btn-dark btn-sm w-full">Enregistrer</SubmitButton>
        {state?.error && <p className="text-xs text-danger">{state.error}</p>}
        {state?.success && <p className="text-xs text-success">{state.success}</p>}
      </form>
    </details>
  );
}
