import Link from "next/link";
import { ArrowRight, BadgeCheck, HandCoins, Search, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Icon } from "@/components/icon";
import { getActiveCategories, getActiveVehicleTypes, getFeatured } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [types, categories, featured] = await Promise.all([getActiveVehicleTypes(), getActiveCategories(), getFeatured(8)]);

  return (
    <>
      {/* ---------- Héro ---------- */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="hero-grid absolute inset-0" />
        <div className="orb -left-24 top-10 size-72 bg-accent/40" />
        <div className="orb -right-16 bottom-0 size-80 bg-info/30" />
        <div className="container-x relative grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="fade-up">
            <p className="eyebrow text-accent">Pièces détachées · Burkina Faso</p>
            <h1 className="h1 mt-4 max-w-xl">
              La bonne pièce, <span className="text-accent">livrée</span> chez vous.
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/70">
              Voitures, motos, vélos et tricycles. Trouvez votre pièce, payez par Orange Money ou Moov Money, et un livreur
              vous l&apos;apporte. Vous avez une pièce à vendre ? Proposez-la, nous nous occupons du reste.
            </p>
            <form action="/catalogue" className="mt-8 flex max-w-lg gap-2 rounded-full bg-white p-1.5 shadow-lift">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  name="q"
                  placeholder="Ex : plaquettes Corolla, kit chaîne Crypton…"
                  className="h-11 w-full rounded-full bg-transparent pl-12 pr-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
                />
              </label>
              <button className="btn-primary h-11 px-6">Chercher</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2">
              {types.map((t) => (
                <Link key={t.slug} href={`/catalogue?type=${t.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur transition-colors hover:border-accent hover:text-accent">
                  <Icon name={t.icon} className="size-4" />
                  {t.name}
                  <span className="text-white/50">{t.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="card glass-dark relative overflow-hidden rounded-[2rem] border-white/10 p-6 text-white">
              <p className="eyebrow text-accent">Comment ça marche</p>
              <ol className="mt-5 space-y-5">
                <Step n={1} icon={<Search className="size-5" />} title="Trouvez la pièce" text="Filtrez par véhicule, marque, modèle et catégorie. Seules les pièces réellement disponibles sont affichées." />
                <Step n={2} icon={<HandCoins className="size-5" />} title="Payez en toute confiance" text="Orange Money, Moov Money ou paiement à la livraison. Felix Mécanic valide chaque transaction." />
                <Step n={3} icon={<Truck className="size-5" />} title="Recevez chez vous" text="Un livreur récupère la pièce et vous la livre. Le vendeur ne connaît jamais l'acheteur." />
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Catégories ---------- */}
      <section className="container-x py-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Parcourir</p>
            <h2 className="h2 mt-1">Par catégorie</h2>
          </div>
          <Link href="/catalogue" className="btn-ghost btn-sm">
            Tout le catalogue <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.slug} href={`/catalogue?category=${c.slug}`} className="card card-hover flex items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
                <Icon name={c.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight">{c.name}</span>
                <span className="text-xs text-muted">{c.count} pièce{c.count > 1 ? "s" : ""}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Sélection ---------- */}
      <section className="container-x py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Nouveautés & sélection</p>
            <h2 className="h2 mt-1">Pièces en vitrine</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} p={p} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* ---------- Vendre / Demander ---------- */}
      <section className="container-x grid gap-4 py-12 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[var(--radius-xl3)] bg-ink p-8 text-white shadow-lift">
          <div className="orb -right-10 -top-10 size-48 bg-accent/40" />
          <BadgeCheck className="size-8 text-accent" />
          <h3 className="mt-4 text-2xl font-bold tracking-tight">Vous avez une pièce à vendre ?</h3>
          <p className="mt-2 text-sm text-white/70">
            Décrivez-la, ajoutez des photos et un prix. Notre équipe la vérifie, la met en vitrine, et un livreur vient la
            chercher quand elle est vendue. Vous restez anonyme.
          </p>
          <Link href="/vendre" className="btn-primary mt-6">
            Proposer une pièce <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="card relative overflow-hidden p-8">
          <div className="orb -right-10 -top-10 size-48 bg-lime/50" />
          <Search className="size-8 text-accent-strong" />
          <h3 className="mt-4 text-2xl font-bold tracking-tight">Pièce introuvable ?</h3>
          <p className="mt-2 text-sm text-muted">
            Envoyez-nous le nom, une photo et le modèle de votre véhicule. Felix Mécanic la recherche pour vous auprès de
            son réseau de fournisseurs.
          </p>
          <Link href="/demande" className="btn-dark mt-6">
            Faire une demande <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Step({ n, icon, title, text }: { n: number; icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent">
        {icon}
        <span className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-accent font-mono text-[10px] font-bold text-ink">
          {n}
        </span>
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-sm text-white/60">{text}</span>
      </span>
    </li>
  );
}
