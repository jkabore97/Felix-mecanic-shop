import Link from "next/link";
import { formatFCFA, CONDITION_LABEL } from "@/lib/format";
import type { Condition } from "@prisma/client";
import { AddToCartButton } from "./add-to-cart";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  condition: Condition;
  quantity: number;
  image: string | null;
  categoryName: string;
  vehicleTypeName: string;
  brandName?: string | null;
};

export function ProductCard({ p, priority = false }: { p: ProductCardData; priority?: boolean }) {
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link href={`/piece/${p.slug}`} className="relative block aspect-[5/4] overflow-hidden bg-soft">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={p.title}
            loading={priority ? "eager" : "lazy"}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted">Pas d&apos;image</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={p.condition === "NEW" ? "badge bg-ink text-lime" : "badge glass text-ink"}>{CONDITION_LABEL[p.condition]}</span>
        </div>
        {p.quantity <= 2 && (
          <span className="absolute bottom-3 left-3 badge bg-amber-soft text-amber">
            {p.quantity === 1 ? "Dernière pièce" : "Stock limité"}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {p.vehicleTypeName}
          {p.brandName ? ` · ${p.brandName}` : ""} · {p.categoryName}
        </p>
        <Link href={`/piece/${p.slug}`} className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-accent-strong">
          {p.title}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="price whitespace-nowrap text-[15px] sm:text-lg">{formatFCFA(p.price)}</span>
          <AddToCartButton
            product={{ productId: p.id, slug: p.slug, title: p.title, price: p.price, image: p.image, maxQuantity: p.quantity }}
            compact
          />
        </div>
      </div>
    </article>
  );
}
