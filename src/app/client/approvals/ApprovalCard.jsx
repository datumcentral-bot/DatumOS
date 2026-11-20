"use client";

import { useState, useTransition } from "react";
import { decideApproval } from "./actions";
import { CheckCircle2, PenLine, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui";

const TONE = { APPROVED: "green", CHANGES_REQUESTED: "amber", PENDING: "slate" };
const LABEL = { APPROVED: "Approved", CHANGES_REQUESTED: "Changes Requested", PENDING: "Awaiting Review" };

export function ApprovalCard({ approval, projectCode }) {
  const [isPending, startTransition] = useTransition();
  const [showMarkup, setShowMarkup] = useState(false);
  const [markup, setMarkup] = useState(approval.markup || "");
  const [status, setStatus] = useState(approval.status);

  const decide = (decision) => {
    startTransition(async () => {
      await decideApproval(approval.id, decision, decision === "CHANGES_REQUESTED" ? markup : null);
      setStatus(decision);
      setShowMarkup(false);
    });
  };

  const decided = status !== "PENDING";

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-900">{approval.title}</p>
            <p className="text-xs text-slate-500">
              {projectCode}
              {approval.document ? ` · ${approval.document.fileName}` : ""}
            </p>
          </div>
        </div>
        <Badge tone={TONE[status]}>{LABEL[status]}</Badge>
      </div>

      {approval.markup && status === "CHANGES_REQUESTED" && (
        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">Your markup:</span> {approval.markup}
        </div>
      )}

      {showMarkup && (
        <div className="mt-3">
          <label className="text-xs font-medium text-slate-500">Digital markup / redline note</label>
          <textarea
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-400"
            placeholder="e.g. Please adjust dimension on grid line B…"
          />
        </div>
      )}

      {!decided && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => decide("APPROVED")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-health-green px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> Approve
          </button>
          {showMarkup ? (
            <button
              onClick={() => decide("CHANGES_REQUESTED")}
              disabled={isPending || !markup.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-health-amber px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <PenLine size={14} /> Submit markup
            </button>
          ) : (
            <button
              onClick={() => setShowMarkup(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <PenLine size={14} /> Request changes
            </button>
          )}
        </div>
      )}

      {decided && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock size={11} /> Decision recorded{approval.reviewer ? ` by ${approval.reviewer}` : ""}.
        </p>
      )}
    </div>
  );
}
