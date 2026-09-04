import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { addBrand, addCategory, addModel, addVehicleType, deleteBrand, deleteCategory, deleteModel, deleteVehicleType } from "@/actions/admin";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const ICONS = ["car", "bike", "truck", "engine", "brake", "suspension", "zap", "filter", "circle-dot", "cog", "car-front", "lightbulb", "thermometer", "wind", "package", "wrench"];

export default async function AdminCatalogue() {
  const [types, categories] = await Promise.all([
    prisma.vehicleType.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
        brands: { orderBy: { name: "asc" }, include: { _count: { select: { products: true } }, models: { orderBy: { name: "asc" }, include: { _count: { select: { compatibilities: true } } } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Référentiel"
        title="Véhicules & catégories"
        description="Seul le gestionnaire ajoute des types, marques et modèles. Dans la vitrine, un filtre n'apparaît que s'il existe au moins une pièce correspondante."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {types.map((t) => (
            <section key={t.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
                  <Icon name={t.icon} className="size-5" />
                </span>
                <div className="flex-1">
                  <h2 className="h3">{t.name}</h2>
                  <p className="text-xs text-muted">{t._count.products} pièce{t._count.products > 1 ? "s" : ""} · {t.brands.length} marque{t.brands.length > 1 ? "s" : ""}</p>
                </div>
                {t._count.products === 0 && (
                  <form action={deleteVehicleType.bind(null, t.id)}>
                    <button className="btn-danger btn-sm" aria-label="Supprimer le type">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                )}
              </div>

              <ul className="mt-4 space-y-3">
                {t.brands.map((b) => (
                  <li key={b.id} className="rounded-2xl bg-soft p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{b.name}</span>
                      <span className="text-xs text-muted">{b._count.products} pièce{b._count.products > 1 ? "s" : ""}</span>
                      {b._count.products === 0 && (
                        <form action={deleteBrand.bind(null, b.id)} className="ml-auto">
                          <button className="text-muted hover:text-danger" aria-label="Supprimer la marque">
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.models.map((m) => (
                        <span key={m.id} className="pill py-1 text-xs">
                          {m.name}
                          {m.yearFrom ? ` ${m.yearFrom}${m.yearTo ? `–${m.yearTo}` : "+"}` : ""}
                          <span className="opacity-50">{m._count.compatibilities}</span>
                          {m._count.compatibilities === 0 && (
                            <form action={deleteModel.bind(null, m.id)}>
                              <button className="text-muted hover:text-danger" aria-label="Supprimer le modèle">×</button>
                            </form>
                          )}
                        </span>
                      ))}
                    </div>
                    <form action={addModel} className="mt-2 flex flex-wrap gap-1.5">
                      <input type="hidden" name="brandId" value={b.id} />
                      <input name="name" required placeholder="Nouveau modèle" className="input h-9 flex-1 rounded-xl py-1 text-xs" />
                      <input name="yearFrom" type="number" placeholder="Année de" className="input h-9 w-24 rounded-xl py-1 text-xs" />
                      <input name="yearTo" type="number" placeholder="à" className="input h-9 w-20 rounded-xl py-1 text-xs" />
                      <button className="btn-soft btn-sm">Ajouter</button>
                    </form>
                  </li>
                ))}
              </ul>
              <form action={addBrand} className="mt-3 flex gap-2">
                <input type="hidden" name="vehicleTypeId" value={t.id} />
                <input name="name" required placeholder={`Nouvelle marque de ${t.name.toLowerCase()}`} className="input" />
                <button className="btn-dark btn-sm shrink-0">Ajouter la marque</button>
              </form>
            </section>
          ))}

          <form action={addVehicleType} className="card flex flex-wrap gap-2 p-5">
            <input name="name" required placeholder="Nouveau type de véhicule (ex. Camion)" className="input flex-1" />
            <select name="icon" className="input w-36" defaultValue="car">
              {ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <button className="btn-primary shrink-0">Ajouter le type</button>
          </form>
        </div>

        <section className="card h-fit p-5">
          <h2 className="h3">Catégories de pièces</h2>
          <ul className="mt-3 divide-y divide-line">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2 text-sm">
                <Icon name={c.icon} className="size-4 text-muted" />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-muted">{c._count.products}</span>
                {c._count.products === 0 && (
                  <form action={deleteCategory.bind(null, c.id)}>
                    <button className="text-muted hover:text-danger" aria-label="Supprimer">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <form action={addCategory} className="mt-4 space-y-2">
            <input name="name" required placeholder="Nouvelle catégorie" className="input" />
            <div className="flex gap-2">
              <select name="icon" className="input" defaultValue="wrench">
                {ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <button className="btn-dark btn-sm shrink-0">Ajouter</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
