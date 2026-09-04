import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
import { Filters } from "./filters";
import { getFacets, parseFilters, searchProducts } from "@/lib/catalog";
import { CONDITION_LABEL } from "@/lib/format";
import type { Condition } from "@prisma/client";

export const metadata: Metadata = { title: "Catalogue" };
export const dynamic = "force-dynamic";

export default async function CataloguePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [result, facets] = await Promise.all([searchProducts(filters), getFacets(filters)]);

  const active: Array<{ key: string; label: string }> = [];
  if (filters.q) active.push({ key: "q", label: `« ${filters.q} »` });
  const t = facets.types.find((x) => x.slug === filters.type);
  if (filters.type) active.push({ key: "type", label: t?.name ?? filters.type });
  const b = facets.brands.find((x) => x.slug === filters.brand);
  if (filters.brand) active.push({ key: "brand", label: b?.name ?? filters.brand });
  const m = facets.models.find((x) => x.slug === filters.model);
  if (filters.model) active.push({ key: "model", label: m?.name ?? filters.model });
  const c = facets.categories.find((x) => x.slug === filters.category);
  if (filters.category) active.push({ key: "category", label: c?.name ?? filters.category });
  if (filters.condition) active.push({ key: "condition", label: CONDITION_LABEL[filters.condition as Condition] ?? filters.condition });
  if (filters.min) active.push({ key: "min", label: `≥ ${filters.min.toLocaleString("fr-FR")} F` });
  if (filters.max) active.push({ key: "max", label: `≤ ${filters.max.toLocaleString("fr-FR")} F` });

  const removeHref = (key: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === key || k === "page" || v === undefined) continue;
      if (key === "brand" && k === "model") continue;
      if (key === "type" && (k === "brand" || k === "model")) continue;
      p.set(k, Array.isArray(v) ? v[0] : v);
    }
    const s = p.toString();
    return `/catalogue${s ? `?${s}` : ""}`;
  };
  const pageHref = (page: number) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v !== undefined && k !== "page") p.set(k, Array.isArray(v) ? v[0] : v);
    p.set("page", String(page));
    return `/catalogue?${p.toString()}`;
  };

  return (
    <div className="container-x py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="h2 mt-1">
            {t ? `Pièces ${t.name.toLowerCase()}` : "Toutes les pièces"}
            {b ? ` · ${b.name}` : ""}
            {m ? ` ${m.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {result.total} pièce{result.total > 1 ? "s" : ""} disponible{result.total > 1 ? "s" : ""}
          </p>
        </div>
        <details className="group relative sm:hidden">
          <summary className="btn-ghost list-none">
            <SlidersHorizontal className="size-4" /> Filtres {active.length > 0 && <span className="badge bg-ink text-white">{active.length}</span>}
          </summary>
          <div className="card mt-3 p-4">
            <Filters facets={facets} filters={filters} />
          </div>
        </details>
      </div>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <Link key={a.key} href={removeHref(a.key)} className="pill pill-active">
              {a.label} <X className="size-3.5" />
            </Link>
          ))}
          <Link href="/catalogue" className="text-xs font-medium text-muted underline-offset-2 hover:underline">
            Tout effacer
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5">
            <Filters facets={facets} filters={filters} />
          </div>
        </aside>

        <section>
          {result.items.length === 0 ? (
            <EmptyState
              title="Aucune pièce ne correspond"
              description="Essayez d'élargir vos filtres, ou envoyez-nous une demande : nous chercherons la pièce pour vous."
              action={
                <div className="flex gap-2">
                  <Link href="/catalogue" className="btn-ghost">Réinitialiser</Link>
                  <Link href={`/demande${filters.q ? `?title=${encodeURIComponent(filters.q)}` : ""}`} className="btn-primary">Demander cette pièce</Link>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p, i) => (
                <ProductCard key={p.id} p={p} priority={i < 4} />
              ))}
            </div>
          )}

          {result.pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={pageHref(n)} className={`pill ${n === result.page ? "pill-active" : ""}`}>
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
