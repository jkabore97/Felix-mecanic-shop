"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x py-16">
      <div className="card mx-auto max-w-lg px-6 py-12 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-amber-soft text-amber">
          <TriangleAlert className="size-6" />
        </div>
        <h1 className="h3">Un problème est survenu</h1>
        <p className="mt-2 text-sm text-muted">
          Le service est momentanément indisponible. Réessayez dans un instant ; si le problème persiste, contactez Felix
          Mécanic au +226 70 00 00 01.
        </p>
        {error.digest && <p className="mt-2 font-mono text-[11px] text-muted">Réf. {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={reset} className="btn-primary">Réessayer</button>
          <Link href="/" className="btn-ghost">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
