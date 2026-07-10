"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

// ── Toast system ──────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel",
              t.tone === "err"
                ? "border-health-red/30 bg-red-50 text-health-red"
                : t.tone === "warn"
                ? "border-health-amber/30 bg-amber-50 text-health-amber"
                : "border-health-green/30 bg-green-50 text-health-green"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastCtx);
  return ctx || (() => {});
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-hud-950/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className={cn("mt-10 w-full rounded-2xl border border-line bg-white shadow-panel", width)} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-sm font-bold text-olive-900">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-olive-500 hover:bg-olive-100">
            <X size={17} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────────────
export function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && <p className="mt-1 text-xs text-olive-400">{hint}</p>}
    </div>
  );
}

export function SubmitButton({ children, pending, className }) {
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary justify-center disabled:opacity-60", className)}>
      {pending ? "Saving…" : children}
    </button>
  );
}
