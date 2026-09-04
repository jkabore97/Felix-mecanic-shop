"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LayoutDashboard, PackageSearch, Receipt, Tag, Users } from "lucide-react";

export function AdminNav({ counts }: { counts: { annonces: number; commandes: number; demandes: number } }) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { href: "/admin/annonces", label: "Annonces", icon: Tag, count: counts.annonces },
    { href: "/admin/commandes", label: "Commandes", icon: Receipt, count: counts.commandes },
    { href: "/admin/demandes", label: "Demandes", icon: PackageSearch, count: counts.demandes },
    { href: "/admin/catalogue", label: "Véhicules & catégories", icon: Car },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-none lg:sticky lg:top-24 lg:h-fit lg:flex-col" aria-label="Administration">
      {items.map(({ href, label, icon: Icon, count, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-ink text-white" : "text-ink/80 hover:bg-surface"
            }`}
          >
            <Icon className="size-4" />
            <span className="whitespace-nowrap">{label}</span>
            {count ? <span className={`ml-auto badge ${active ? "bg-accent text-white" : "bg-amber-soft text-amber"}`}>{count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
