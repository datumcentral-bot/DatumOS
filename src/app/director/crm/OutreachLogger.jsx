"use client";

import { useTransition } from "react";
import { logOutreach } from "./actions";
import { Plus } from "lucide-react";

export function OutreachLogger({ todayCount = 0 }) {
  const [isPending, startTransition] = useTransition();
  const log = (n) => startTransition(async () => await logOutreach(n));

  const remaining = Math.max(0, 25 - todayCount);
  const pct = Math.min(100, Math.round((todayCount / 25) * 100));

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-brand-900">
            {todayCount}
            <span className="text-base font-normal text-slate-400"> / 25</span>
          </p>
          <p className="text-xs text-slate-500">{remaining > 0 ? `${remaining} touches to hit today's target` : "Target hit ✅"}</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => log(1)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-50"
          >
            <Plus size={13} /> 1
          </button>
          <button
            onClick={() => log(5)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-800 disabled:opacity-50"
          >
            <Plus size={13} /> 5
          </button>
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-health-green" : "bg-accent-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
