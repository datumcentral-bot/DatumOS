"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

const SERVICES = [
  "BIM Services",
  "3D Laser Scanning Services",
  "Shop Drawings",
  "VDC Services",
  "GIS Services",
  "Architectural BIM Services",
  "Structural BIM Services",
  "MEP BIM Services",
  "BIM Coordination / Clash Detection",
  "4D BIM Scheduling",
  "5D BIM Cost Estimation",
  "Facility Management Services",
  "Rebar Detailing Services",
  "Others",
];

const PROJECT_TYPES = [
  "Commercial",
  "Government",
  "Industrial",
  "Residential",
  "Institutional",
  "Healthcare",
  "Hospitality",
  "Civil and Infrastructure",
];

export function QuoteForm({ compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setMessage(data.message);
        e.target.reset();
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please email us directly at info@datum-bim.com");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-hud-line/60 bg-hud-900 px-4 py-3 text-sm text-sand-100 placeholder-sand-400/50 outline-none transition focus:border-sand-400 focus:ring-1 focus:ring-sand-400/30";
  const selectCls =
    "w-full rounded-xl border border-hud-line/60 bg-hud-900 px-4 py-3 text-sm text-sand-100 outline-none transition focus:border-sand-400 focus:ring-1 focus:ring-sand-400/30";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-health-green/30 bg-health-green/10 p-8 text-center">
        <CheckCircle2 size={40} className="text-health-green" />
        <p className="text-sm font-semibold text-sand-100">{message}</p>
        <button
          onClick={() => setStatus("idle")}
          className="rounded-lg border border-sand-500/30 px-4 py-2 text-sm text-sand-300 hover:bg-sand-500/10"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!compact && (
        <div className="mb-2">
          <h3 className="text-xl font-extrabold text-sand-50">Get a Free Quote</h3>
          <p className="mt-1 text-sm text-sand-200/60">
            Share your project requirements and our team will respond within one business day.
          </p>
        </div>
      )}

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
        <input name="name" required placeholder="Full name *" className={inputCls} />
        <input name="email" type="email" required placeholder="Email address *" className={inputCls} />
        <input name="phone" placeholder="Phone number" className={inputCls} />
        <input name="company" placeholder="Company / Organisation" className={inputCls} />
        <select name="service" required className={selectCls}>
          <option value="">Select service *</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="projectType" required className={selectCls}>
          <option value="">Select project type *</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="message"
        required
        rows={compact ? 3 : 5}
        placeholder="Project scope, location, drawings, LOD, timeline or scanning needs *"
        className={inputCls}
      />

      {status === "error" && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-accent w-full justify-center py-3 text-base disabled:opacity-60"
      >
        {status === "loading" ? (
          "Submitting..."
        ) : (
          <>
            <Send size={16} /> Submit Project Details
          </>
        )}
      </button>
    </form>
  );
}
