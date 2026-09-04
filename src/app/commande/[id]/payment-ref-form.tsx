"use client";

import { useState, useTransition } from "react";
import { submitPaymentRef } from "@/actions/orders";
import { Alert } from "@/components/ui";

export function PaymentRefForm({ orderId }: { orderId: number }) {
  const [msg, setMsg] = useState<{ error?: string; success?: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-4 flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const ref = String(new FormData(e.currentTarget).get("ref") ?? "");
        start(async () => setMsg(await submitPaymentRef(orderId, ref)));
      }}
    >
      <input name="ref" required className="input font-mono sm:max-w-xs" placeholder="Référence de la transaction" />
      <button disabled={pending} className="btn-dark">
        {pending ? "Envoi…" : "Transmettre la référence"}
      </button>
      {msg?.error && <Alert tone="danger">{msg.error}</Alert>}
      {msg?.success && <Alert tone="success">{msg.success}</Alert>}
    </form>
  );
}
