import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container-x py-16">
      <EmptyState
        title="Page introuvable"
        description="La page ou la pièce que vous cherchez n'existe pas ou n'est plus disponible."
        action={<Link href="/catalogue" className="btn-primary">Voir le catalogue</Link>}
      />
    </div>
  );
}
