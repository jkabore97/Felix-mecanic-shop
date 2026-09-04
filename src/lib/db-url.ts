/**
 * Résolution de l'URL PostgreSQL selon l'hébergeur :
 * - DATABASE_URL (standard, docker compose, Neon via Vercel)
 * - POSTGRES_PRISMA_URL / POSTGRES_URL (Vercel Postgres, Supabase)
 * Les variantes « non poolées » servent pour `prisma db push` (migrations).
 */
export function resolveDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || undefined;
}

export function resolveDirectUrl(): string | undefined {
  return process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || resolveDatabaseUrl();
}

export function isDatabaseConfigured() {
  return Boolean(resolveDatabaseUrl());
}
