"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, PackageSearch, ShoppingBag, Tag, UserRound } from "lucide-react";
import { CartBadge } from "./cart-badge";
import type { SafeUser } from "@/lib/auth";

export function MobileNav({ user }: { user: SafeUser | null }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Accueil", icon: House },
    { href: "/catalogue", label: "Catalogue", icon: PackageSearch },
    { href: "/vendre", label: "Vendre", icon: Tag },
    { href: "/panier", label: "Panier", icon: ShoppingBag, badge: true },
    { href: user ? "/compte" : "/connexion", label: user ? "Compte" : "Connexion", icon: UserRound },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 glass md:hidden" aria-label="Navigation mobile">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-accent-strong" : "text-muted"}`}
              >
                <span className={`relative grid size-9 place-items-center rounded-2xl ${active ? "bg-accent-soft" : ""}`}>
                  <Icon className="size-5" />
                  {badge && <CartBadge className="absolute -right-1 -top-1" />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
