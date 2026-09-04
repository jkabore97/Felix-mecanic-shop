"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f4f5f9", color: "#0b1020", margin: 0 }}>
        <main style={{ maxWidth: 480, margin: "15vh auto", padding: 32, background: "#fff", borderRadius: 28, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Felix Mécanic est momentanément indisponible</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Réessayez dans un instant. Si le problème persiste, contactez-nous au +226 70 00 00 01.
          </p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>Réf. {error.digest}</p>}
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: "10px 22px", borderRadius: 999, border: 0, background: "#12b5a5", color: "#fff", fontWeight: 600 }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
