import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Felix Mécanic — accueil">
      <span className="relative grid size-9 place-items-center rounded-2xl bg-ink text-white shadow-lg shadow-ink/20">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-accent ring-2 ring-surface" />
      </span>
      <span className={`text-base font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Felix<span className="text-accent">Mécanic</span>
      </span>
    </Link>
  );
}
