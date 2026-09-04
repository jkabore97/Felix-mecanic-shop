import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { CheckoutForm } from "./checkout-form";
import { DELIVERY_CITIES } from "@/lib/delivery";

export const metadata: Metadata = { title: "Commander" };

export default async function CheckoutPage() {
  const user = await requireUser("/commande");
  return (
    <div className="container-x py-8">
      <p className="eyebrow">Dernière étape</p>
      <h1 className="h2 mt-1">Livraison & paiement</h1>
      <CheckoutForm
        cities={DELIVERY_CITIES}
        defaults={{ name: user.name, phone: user.phone, city: user.city ?? DELIVERY_CITIES[0].name, address: user.address ?? "" }}
      />
    </div>
  );
}
