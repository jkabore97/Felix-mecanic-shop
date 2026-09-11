import { Database, ImageUp, KeyRound } from "lucide-react";
import { Logo } from "./logo";

/** Affiché quand aucune base de données n'est configurée (premier déploiement). */
export function SetupRequired({ blob }: { blob: boolean }) {
  return (
    <div className="container-x py-16">
      <div className="card mx-auto max-w-2xl p-8">
        <Logo />
        <p className="eyebrow mt-8">Presque prêt</p>
        <h1 className="h2 mt-1">Configuration requise</h1>
        <p className="mt-2 text-sm text-muted">
          Le site est déployé mais aucune base de données n&apos;est encore connectée. Suivez ces étapes dans le tableau de bord
          Vercel du projet, puis redéployez.
        </p>
        <ol className="mt-6 space-y-4">
          <Step icon={<Database className="size-5" />} n={1} title="Base de données" done={false}>
            <b>Storage</b> → <b>Create Database</b> → <b>Neon</b> (Postgres) → <b>Connect Project</b>. La variable{" "}
            <code className="rounded bg-soft px-1 font-mono text-xs">DATABASE_URL</code> est ajoutée automatiquement.
          </Step>
          <Step icon={<ImageUp className="size-5" />} n={2} title="Photos" done={blob}>
            <b>Storage</b> → <b>Create</b> → <b>Blob</b> → <b>Connect Project</b> (variable{" "}
            <code className="rounded bg-soft px-1 font-mono text-xs">BLOB_READ_WRITE_TOKEN</code>).
          </Step>
          <Step icon={<KeyRound className="size-5" />} n={3} title="Secret de session" done={Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET !== "change-me-in-production")}>
            <b>Settings</b> → <b>Environment Variables</b> → <code className="rounded bg-soft px-1 font-mono text-xs">SESSION_SECRET</code> = une longue chaîne
            aléatoire.
          </Step>
        </ol>
        <p className="mt-6 rounded-2xl bg-accent-soft p-4 text-sm text-accent-strong">
          Ensuite : <b>Deployments → Redeploy</b>. Le build crée les tables et charge les données de démonstration
          (gestionnaire : 70000001 / felix2026 — à changer après la première connexion).
        </p>
      </div>
    </div>
  );
}

function Step({ icon, n, title, done, children }: { icon: React.ReactNode; n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${done ? "bg-success-soft text-success" : "bg-soft text-muted"}`}>{icon}</span>
      <div className="text-sm">
        <p className="font-semibold">
          {n}. {title} {done && <span className="badge-success ml-1">OK</span>}
        </p>
        <p className="mt-0.5 text-muted">{children}</p>
      </div>
    </li>
  );
}
