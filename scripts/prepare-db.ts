/**
 * Exécuté avant `next build` (local et Vercel) :
 *  1. vérifie DATABASE_URL,
 *  2. génère le client Prisma,
 *  3. synchronise le schéma (prisma db push),
 *  4. insère les données de démonstration si la base est vide.
 * Désactivable avec SKIP_DB_PREPARE=1 (ex. build sans accès à la base).
 */
import { execSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

if (process.env.SKIP_DB_PREPARE === "1") {
  console.log("prepare-db : ignoré (SKIP_DB_PREPARE=1).");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error(`
✖ DATABASE_URL manquant.

  Felix Mécanic a besoin d'une base PostgreSQL.
  • Sur Vercel : Storage → Create Database → Neon (ou Postgres), puis « Connect Project » :
    la variable DATABASE_URL est ajoutée automatiquement. Relancez le déploiement.
  • En local : docker compose up -d  puis  DATABASE_URL="postgresql://felix:felix@localhost:5432/felix" dans .env
`);
  process.exit(1);
}

const run = (cmd: string) => {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

run("prisma generate");
run("prisma db push --skip-generate --accept-data-loss");
run("tsx prisma/seed.ts");
