/** Villes desservies et frais de livraison (FCFA). Modifiable par le gestionnaire dans le code pour l'instant. */
export const DELIVERY_CITIES: Array<{ name: string; fee: number }> = [
  { name: "Ouagadougou", fee: 1500 },
  { name: "Bobo-Dioulasso", fee: 2000 },
  { name: "Koudougou", fee: 3500 },
  { name: "Ouahigouya", fee: 4000 },
  { name: "Banfora", fee: 4000 },
  { name: "Autre ville", fee: 5000 },
];

export function deliveryFeeFor(city: string) {
  return DELIVERY_CITIES.find((c) => c.name === city)?.fee ?? DELIVERY_CITIES[DELIVERY_CITIES.length - 1].fee;
}

/** Numéros Mobile Money de Felix Mécanic affichés pour le paiement. */
export const PAYMENT_NUMBERS = {
  ORANGE_MONEY: "+226 70 00 00 01",
  MOOV_MONEY: "+226 70 00 00 01",
};
