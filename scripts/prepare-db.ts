/**
 * Exécuté avant `next build` (local et Vercel) :
 *  1. génère le client Prisma,
 *  2. si une base est configurée : synchronise le schéma (prisma db push)
 *     puis insère les données de démonstration si la base est vide.
 * Sans base configurée, le build réussit quand même : le site affiche alors
 * une page « Configuration requise » avec les étapes à suivre.
 * Désactivable avec SKIP_DB_PREPARE=1.
 */
import { execSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";
import { resolveDatabaseUrl, resolveDirectUrl } from "../src/lib/db-url";

loadEnvConfig(process.cwd());

const run = (cmd: string, env: Record<string, string | undefined> = {}) => {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });
};

run("prisma generate");

if (process.env.SKIP_DB_PREPARE === "1") {
  console.log("prepare-db : synchronisation ignorée (SKIP_DB_PREPARE=1).");
  process.exit(0);
}

const url = resolveDatabaseUrl();
if (!url) {
  console.warn(`
⚠ Aucune base PostgreSQL configurée (DATABASE_URL). Le site affichera une page « Configuration requise ».
  • Sur Vercel : Storage → Create Database → Neon → Connect Project, puis redéployez.
  • En local : docker compose up -d  puis  DATABASE_URL="postgresql://felix:felix@localhost:5432/felix" dans .env
`);
  process.exit(0);
}

try {
  run("prisma db push --skip-generate --accept-data-loss", { DATABASE_URL: resolveDirectUrl() });
  run("tsx prisma/seed.ts", { DATABASE_URL: url });
} catch (e) {
  console.error("\n✖ Impossible de préparer la base de données. Vérifiez DATABASE_URL et que la base accepte les connexions.\n");
  throw e;
}
