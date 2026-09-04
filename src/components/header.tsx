import Link from "next/link";
import { LayoutDashboard, PackageSearch, Search, ShoppingBag, Truck, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { CartBadge } from "./cart-badge";
import type { SafeUser } from "@/lib/auth";

export function Header({ user }: { user: SafeUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 glass">
      <div className="container-x flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <NavLink href="/catalogue">Catalogue</NavLink>
          <NavLink href="/vendre">Vendre une pièce</NavLink>
          <NavLink href="/demande">Pièce introuvable ?</NavLink>
        </nav>

        <form action="/catalogue" className="ml-auto hidden max-w-md flex-1 md:block">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Rechercher une pièce, une référence, un modèle…"
              className="input rounded-full pl-10"
              aria-label="Rechercher"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {user?.role === "MANAGER" && (
            <IconLink href="/admin" label="Administration">
              <LayoutDashboard className="size-5" />
            </IconLink>
          )}
          {user?.role === "COURIER" && (
            <IconLink href="/livreur" label="Mes livraisons">
              <Truck className="size-5" />
            </IconLink>
          )}
          <IconLink href="/catalogue" label="Catalogue" className="md:hidden">
            <PackageSearch className="size-5" />
          </IconLink>
          <IconLink href="/panier" label="Panier">
            <ShoppingBag className="size-5" />
            <CartBadge className="absolute -right-0.5 -top-0.5" />
          </IconLink>
          {user ? (
            <Link href="/compte" className="btn-soft btn-sm ml-1 hidden md:inline-flex">
              <UserRound className="size-4" />
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/connexion" className="btn-dark btn-sm ml-1 hidden md:inline-flex">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-soft hover:text-ink">
      {children}
    </Link>
  );
}

function IconLink({ href, label, children, className = "" }: { href: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`relative grid size-10 place-items-center rounded-full text-ink/80 transition-colors hover:bg-soft hover:text-ink ${className}`}
    >
      {children}
    </Link>
  );
}
