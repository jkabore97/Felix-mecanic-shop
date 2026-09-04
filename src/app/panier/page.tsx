import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Panier" };

export default function CartPage() {
  return (
    <div className="container-x py-8">
      <p className="eyebrow">Votre sélection</p>
      <h1 className="h2 mt-1">Panier</h1>
      <CartView />
    </div>
  );
}
