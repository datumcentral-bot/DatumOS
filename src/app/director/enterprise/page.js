"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Handshake, ScrollText, BadgeCheck, FolderCheck, Boxes } from "lucide-react";

/**
 * DatumOS — Enterprise Lifecycle hub (DN008/DN018)
 * Director-facing surface for Proposal → Quotation → Contract → Acceptance →
 * Handover → Digital Twin. All data flows through authenticated, scoped APIs
 * (/api/proposals etc.); this page only renders what the API returns.
 */

const TABS = [
  { key: "proposals", label: "Proposals", api: "/api/proposals", icon: FileText, color: "border-blue-400 text-blue-300" },
  { key: "quotations", label: "Quotations", api: "/api/quotations", icon: ScrollText, color: "border-violet-400 text-violet-300" },
  { key: "contracts", label: "Contracts", api: "/api/contracts", icon: Handshake, color: "border-emerald-400 text-emerald-300" },
  { key: "acceptances", label: "Acceptances", api: "/api/acceptances", icon: BadgeCheck, color: "border-amber-400 text-amber-300" },
  { key: "handovers", label: "Handovers", api: "/api/handovers", icon: FolderCheck, color: "border-cyan-400 text-cyan-300" },
  { key: "digitalTwins", label: "Digital Twins", api: "/api/digital-twins", icon: Boxes, color: "border-pink-400 text-pink-300" },
];

const STATUS_STYLES = {
  DRAFT: "bg-slate-700 text-slate-200",
  SUBMITTED: "bg-blue-900 text-blue-200",
  REVISED: "bg-indigo-900 text-indigo-200",
  WON: "bg-emerald-900 text-emerald-200",
  LOST: "bg-rose-900 text-rose-200",
  WITHDRAWN: "bg-slate-800 text-slate-300",
  SENT: "bg-blue-900 text-blue-200",
  ACCEPTED: "bg-emerald-900 text-emerald-200",
  DECLINED: "bg-rose-900 text-rose-200",
  SIGNED: "bg-emerald-900 text-emerald-200",
  ACTIVE: "bg-emerald-900 text-emerald-200",
  COMPLETED: "bg-teal-900 text-teal-200",
  TERMINATED: "bg-rose-900 text-rose-200",
  ON_HOLD: "bg-amber-900 text-amber-200",
  PLANNED: "bg-slate-700 text-slate-200",
  PENDING_REVIEW: "bg-amber-900 text-amber-200",
  REJECTED: "bg-rose-900 text-rose-200",
  CERTIFIED: "bg-emerald-900 text-emerald-200",
  IN_PROGRESS: "bg-amber-900 text-amber-200",
  CLOSED: "bg-teal-900 text-teal-200",
  BUILDING: "bg-amber-900 text-amber-200",
  RETIRED: "bg-slate-800 text-slate-300",
};

function badge(status) {
  const cls = STATUS_STYLES[status] ?? "bg-slate-800 text-slate-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default function EnterpriseLifecyclePage() {
  const [active, setActive] = useState("proposals");
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", status: "" });

  const tab = TABS.find((t) => t.key === active) ?? TABS[0];

  const load = useCallback(
    async (key) => {
      const t = TABS.find((x) => x.key === key);
      if (!t) return;
      try {
        const res = await fetch(t.api);
        const data = await res.json();
        if (!res.ok) {
          setError(`API ${res.status}: ${data?.error ?? "unauthorised"}`);
          return;
        }
        setRecords((prev) => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
        setError("");
      } catch (e) {
        setError(`Failed to load ${t.label.toLowerCase()}: ${e.message}`);
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    load(active).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const create = async () => {
    if (!form.title) {
      setError("Title is required");
      return;
    }
    try {
      const res = await fetch(tab.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          ...(tab.key === "proposals" ? { proposalNo: `P-${Date.now().toString().slice(-6)}` } : {}),
          ...(tab.key === "quotations" ? { quoteNo: `Q-${Date.now().toString().slice(-6)}` } : {}),
          ...(tab.key === "contracts" ? { contractNo: `C-${Date.now().toString().slice(-6)}` } : {}),
          ...(form.status ? { status: form.status } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Create failed (${res.status}): ${data?.error ?? "unknown"}`);
        return;
      }
      setForm({ title: "", status: "" });
      load(active);
    } catch (e) {
      setError(`Create error: ${e.message}`);
    }
  };

  const rows = Array.isArray(records[active]) ? records[active] : [];
  const Icon = tab.icon;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mb-6 max-w-6xl">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
          <Icon className="h-7 w-7 text-cyan-400" /> Enterprise Lifecycle
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          LEAD → OPPORTUNITY → CLIENT → PROPOSAL → QUOTATION → CONTRACT → PROJECT → ACCEPTANCE → HANDOVER → AIM / DIGITAL TWIN
        </p>
      </div>

      <div className="mb-6 flex max-w-6xl flex-wrap gap-2">
        {TABS.map((t) => {
          const TIcon = t.icon;
          const count = Array.isArray(records[t.key]) ? records[t.key].length : 0;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex items-center gap-2 rounded-xl border bg-slate-900 px-4 py-2 text-sm font-semibold transition ${
                active === t.key ? `${t.color} ring-1 ring-current` : "border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <TIcon className="h-4 w-4" /> {t.label} <span className="text-xs text-slate-500">({count})</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 max-w-6xl rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="mb-6 flex max-w-6xl items-end gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            New {tab.label.slice(0, -1)} title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={`e.g. ${tab.label.slice(0, -1)} for Riverside Tower`}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
        </div>
        <div className="w-44">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Status</label>
          <input
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            placeholder={tab.key === "contracts" ? "SIGNED" : "DRAFT"}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
        </div>
        <button
          onClick={create}
          className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-cyan-500"
        >
          + Create
        </button>
      </div>

      <div className="max-w-6xl overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Ref / Title</th>
              <th className="px-4 py-3">Client / Project</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No records yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="bg-slate-950/40 hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{r.title || r.name || r.deliverable}</div>
                    <div className="text-xs text-slate-500">
                      {r.proposalNo || r.quoteNo || r.contractNo || r.engine || r.phase || r.certificateRef || ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{r.client?.companyName ?? r.project?.name ?? r.handedTo ?? r.reviewedBy ?? "—"}</div>
                    <div className="text-xs text-slate-500">{r.project?.code ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {r.value != null || r.total != null
                      ? `${r.currency ?? "AED"} ${(r.value ?? r.total ?? 0).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{badge(r.status)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}