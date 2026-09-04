"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/icon";
import { CONDITION_LABEL } from "@/lib/format";
import type { CatalogFilters } from "@/lib/catalog";
import type { Condition } from "@prisma/client";

type Facets = {
  types: Array<{ slug: string; name: string; icon: string; count: number }>;
  brands: Array<{ slug: string; name: string; count: number }>;
  models: Array<{ slug: string; name: string; count: number }>;
  categories: Array<{ slug: string; name: string; icon: string; count: number }>;
  conditions: Array<{ slug: string; name: string; count: number }>;
};

export function Filters({ facets, filters }: { facets: Facets; filters: CatalogFilters }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const set = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    p.delete("page");
    start(() => router.push(`/catalogue?${p.toString()}`));
  };

  return (
    <div className={`space-y-6 ${pending ? "opacity-60" : ""}`}>
      <Group title="Véhicule">
        <div className="flex flex-wrap gap-2">
          {facets.types.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => set({ type: filters.type === t.slug ? undefined : t.slug, brand: undefined, model: undefined })}
              className={`pill ${filters.type === t.slug ? "pill-active" : ""}`}
            >
              <Icon name={t.icon} className="size-4" /> {t.name}
              <span className="opacity-60">{t.count}</span>
            </button>
          ))}
        </div>
      </Group>

      {facets.brands.length > 0 && (
        <Group title="Marque">
          <select className="input" value={filters.brand ?? ""} onChange={(e) => set({ brand: e.target.value || undefined, model: undefined })}>
            <option value="">Toutes les marques</option>
            {facets.brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.count})
              </option>
            ))}
          </select>
        </Group>
      )}

      {filters.brand && facets.models.length > 0 && (
        <Group title="Modèle">
          <select className="input" value={filters.model ?? ""} onChange={(e) => set({ model: e.target.value || undefined })}>
            <option value="">Tous les modèles</option>
            {facets.models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name} ({m.count})
              </option>
            ))}
          </select>
        </Group>
      )}

      <Group title="Catégorie">
        <ul className="space-y-1">
          {facets.categories.map((c) => {
            const active = filters.category === c.slug;
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => set({ category: active ? undefined : c.slug })}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
                    active ? "bg-accent-soft font-semibold text-accent-strong" : "hover:bg-soft"
                  }`}
                >
                  <Icon name={c.icon} className="size-4 shrink-0 opacity-70" />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted">{c.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      {facets.conditions.length > 1 && (
        <Group title="État">
          <div className="flex flex-wrap gap-2">
            {facets.conditions.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => set({ condition: filters.condition === c.slug ? undefined : c.slug })}
                className={`pill ${filters.condition === c.slug ? "pill-active" : ""}`}
              >
                {CONDITION_LABEL[c.slug as Condition]} <span className="opacity-60">{c.count}</span>
              </button>
            ))}
          </div>
        </Group>
      )}

      <Group title="Prix (FCFA)">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            set({ min: String(fd.get("min") || ""), max: String(fd.get("max") || "") });
          }}
        >
          <input name="min" type="number" inputMode="numeric" min={0} placeholder="Min" defaultValue={filters.min ?? ""} className="input" />
          <span className="text-muted">–</span>
          <input name="max" type="number" inputMode="numeric" min={0} placeholder="Max" defaultValue={filters.max ?? ""} className="input" />
          <button className="btn-soft btn-sm shrink-0">OK</button>
        </form>
      </Group>

      <Group title="Trier">
        <select className="input" value={filters.sort ?? "recent"} onChange={(e) => set({ sort: e.target.value })}>
          <option value="recent">Nouveautés</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </div>
  );
}
