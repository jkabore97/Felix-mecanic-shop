"use client";

import { useActionState, useEffect, useRef } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "@/actions/auth";
import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <section>
      <h2 className="h3 flex items-center gap-2">
        <KeyRound className="size-5 text-accent-strong" /> Mot de passe
      </h2>
      <form ref={formRef} action={action} className="card mt-4 space-y-4 p-5">
        {state?.error && <Alert tone="danger">{state.error}</Alert>}
        {state?.success && <Alert tone="success">{state.success}</Alert>}
        <label className="field">
          <span className="label">Mot de passe actuel</span>
          <input name="current" type="password" required autoComplete="current-password" className="input" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span className="label">Nouveau mot de passe</span>
            <input name="next" type="password" required minLength={6} autoComplete="new-password" className="input" />
          </label>
          <label className="field">
            <span className="label">Confirmer</span>
            <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className="input" />
          </label>
        </div>
        <SubmitButton className="btn-dark">Changer le mot de passe</SubmitButton>
      </form>
    </section>
  );
}
