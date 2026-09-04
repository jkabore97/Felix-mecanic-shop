import { Check } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STEPS } from "@/lib/format";

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") return <span className="badge-danger">Commande annulée</span>;
  const idx = ORDER_STATUS_STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_STATUS_STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="flex flex-col items-center gap-2 text-center">
            <span className={`grid size-7 place-items-center rounded-full text-[11px] font-bold ${done ? "bg-accent text-white" : "bg-soft text-muted"}`}>
              {i < idx ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={`text-[11px] leading-tight ${done ? "font-semibold text-ink" : "text-muted"}`}>{ORDER_STATUS_LABEL[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}
