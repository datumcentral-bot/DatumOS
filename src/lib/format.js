// Shared formatting + domain helpers used across all three portals.

export function money(n, currency = "USD") {
  const val = Number(n || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(val);
}

export function moneyK(n) {
  const val = Number(n || 0);
  if (Math.abs(val) >= 1000) return "$" + (val / 1000).toFixed(1) + "k";
  return "$" + val.toFixed(0);
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateShort(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function daysUntil(d) {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// Health / status colour maps -----------------------------------------------

export const HEALTH_STYLES = {
  GREEN: { dot: "bg-health-green", text: "text-health-green", bg: "bg-green-50", label: "On Track" },
  AMBER: { dot: "bg-health-amber", text: "text-health-amber", bg: "bg-amber-50", label: "At Risk" },
  RED: { dot: "bg-health-red", text: "text-health-red", bg: "bg-red-50", label: "Critical" },
};

export const PIPELINE_STAGES = [
  { key: "TO_CONTACT", label: "To Contact" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "MEETING_BOOKED", label: "Meeting Booked" },
  { key: "PROPOSAL_SENT", label: "Proposal Sent" },
  { key: "WON", label: "Won" },
];

export const TASK_STATUS = {
  TODO: { label: "To Do", cls: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  QA_REVIEW: { label: "QA Review", cls: "bg-amber-100 text-amber-800" },
  DONE: { label: "Done", cls: "bg-green-100 text-green-700" },
  BLOCKED: { label: "Blocked", cls: "bg-red-100 text-red-700" },
};

export const PRIORITY = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600",
  HIGH: "text-amber-600",
  URGENT: "text-red-600",
};

export const DIVISION_COLORS = {
  AR: "#8b5cf6",
  ST: "#234b84",
  ME: "#0e9a8c",
  EL: "#d97706",
  PL: "#0ea5e9",
  FP: "#dc2626",
  BIM: "#111827",
};

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Validate a delivery file name against the studio standard:
// <ProjectCode>-<Discipline>-<Zone>-<Type>-<Revision>
// e.g. DS-2405-ST-Z01-DWG-R03
export function validateFileName(name) {
  const re = /^DS-\d{4}-(AR|ST|ME|EL|PL|FP|BIM)-(Z\d{2}|SITE)-(DWG|MDL|RPT|SCH)-R\d{2}$/;
  return re.test(name);
}
