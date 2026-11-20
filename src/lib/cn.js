// Utility: class name merger (no "use client" — safe for Server Components)
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
