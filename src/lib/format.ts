import type { Condition, OrderStatus, PaymentMethod, ProductStatus, RequestStatus, Role } from "@prisma/client";

export function displayPhone(phone: string) {
  if (phone.startsWith("+")) return phone;
  if (/^\d{8}$/.test(phone)) return "+226 " + phone; // ancien format local
  return "+" + phone;
}

export function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount).replace(/ | /g, " ")} FCFA`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export function formatShortDate(date: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}

export const CONDITION_LABEL: Record<Condition, string> = {
  NEW: "Neuf",
  USED: "Occasion",
  REFURBISHED: "Reconditionné",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  PENDING: "En attente de validation",
  APPROVED: "En ligne",
  REJECTED: "Refusée",
  SOLD: "Vendue",
  ARCHIVED: "Archivée",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Paiement en attente",
  PAID: "Payée",
  ASSIGNED: "Livreur assigné",
  PICKED_UP: "En cours de livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "ASSIGNED", "PICKED_UP", "DELIVERED"];

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  ORANGE_MONEY: "Orange Money",
  MOOV_MONEY: "Moov Money",
  CASH_ON_DELIVERY: "Paiement à la livraison",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  OPEN: "Reçue",
  IN_PROGRESS: "Recherche en cours",
  FOUND: "Pièce trouvée",
  CLOSED: "Clôturée",
};

export const ROLE_LABEL: Record<Role, string> = {
  BUYER: "Client",
  MANAGER: "Gestionnaire",
  COURIER: "Livreur",
};

export function statusTone(status: string): "neutral" | "info" | "success" | "warning" | "danger" {
  switch (status) {
    case "APPROVED":
    case "DELIVERED":
    case "FOUND":
    case "PAID":
      return "success";
    case "PENDING":
    case "PENDING_PAYMENT":
    case "OPEN":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    case "ASSIGNED":
    case "PICKED_UP":
    case "IN_PROGRESS":
      return "info";
    default:
      return "neutral";
  }
}
