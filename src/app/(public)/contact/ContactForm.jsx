"use client";

import { useState } from "react";
import { submitContact } from "./actions";
import { Send, CheckCircle2 } from "lucide-react";
import { SERVICES } from "@/lib/site";

export function ContactForm() {
  const [status, setStatus] = useState(null); // {ok, message}
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await submitContact(fd);
    setStatus(res);
    setPending(false);
    if (res.ok) e.currentTarget.reset();
  }

  if (status?.ok) {
    return (
      <div className="rounded-2xl border border-health-green/30 bg-health-green/10 p-8 text-center">
        <CheckCircle2 className="mx-auto text-health-green" size={40} />
        <h3 className="mt-4 text-lg font-bold text-sand-50">Enquiry received</h3>
        <p className="mt-2 text-sm text-sand-200/80">{status.message}</p>
        <button onClick={() => setStatus(null)} className="btn-outline mt-6 border-sand-500/30 text-sand-100 hover:bg-sand-500/10">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.04] p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label text-sand-300">Full name *</label>
          <input name="name" required className="field bg-hud-900 text-sand-50 border-sand-500/20" placeholder="Jane Smith" />
        </div>
        <div>
          <label className="field-label text-sand-300">Work email *</label>
          <input name="email" type="email" required className="field bg-hud-900 text-sand-50 border-sand-500/20" placeholder="jane@company.com" />
        </div>
        <div>
          <label className="field-label text-sand-300">Company</label>
          <input name="company" className="field bg-hud-900 text-sand-50 border-sand-500/20" placeholder="Company Ltd" />
        </div>
        <div>
          <label className="field-label text-sand-300">Country</label>
          <input name="country" className="field bg-hud-900 text-sand-50 border-sand-500/20" placeholder="United Kingdom" />
        </div>
      </div>
      <div className="mt-4">
        <label className="field-label text-sand-300">Service of interest</label>
        <select name="service" className="field bg-hud-900 text-sand-50 border-sand-500/20">
          <option value="">Select a service…</option>
          {SERVICES.map((s) => (
            <option key={s.code} value={s.name}>{s.name}</option>
          ))}
          <option value="Multidisciplinary">Multidisciplinary / Full BIM</option>
        </select>
      </div>
      <div className="mt-4">
        <label className="field-label text-sand-300">Project details</label>
        <textarea name="message" rows={4} className="field bg-hud-900 text-sand-50 border-sand-500/20" placeholder="Tell us about scope, timeline and disciplines…" />
      </div>
      {status && !status.ok && <p className="mt-3 text-sm font-semibold text-health-red">{status.message}</p>}
      <button type="submit" disabled={pending} className="btn-accent mt-5 w-full justify-center py-3 text-base disabled:opacity-60">
        {pending ? "Sending…" : (<>Send enquiry <Send size={16} /></>)}
      </button>
      <p className="mt-3 text-center text-xs text-sand-300/50">Submitting adds you to our CRM pipeline — visible live in the Director&apos;s Command Center.</p>
    </form>
  );
}
