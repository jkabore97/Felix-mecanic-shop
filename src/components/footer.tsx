import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">
            La vitrine de pièces mécaniques du Burkina Faso. Voitures, motos, vélos et tricycles : trouvez la bonne pièce,
            payez par Mobile Money, faites-vous livrer.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Boutique</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/catalogue">Catalogue</Link></li>
            <li><Link className="hover:text-ink" href="/vendre">Vendre une pièce</Link></li>
            <li><Link className="hover:text-ink" href="/demande">Demander une pièce</Link></li>
            <li><Link className="hover:text-ink" href="/compte">Mon compte</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Ouagadougou, Burkina Faso</li>
            <li><a className="hover:text-ink" href="tel:+22670000001">+226 70 00 00 01</a></li>
            <li>Lun – Sam · 8h – 19h</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Felix Mécanic · Paiement Orange Money & Moov Money · Livraison à domicile
      </div>
    </footer>
  );
}
