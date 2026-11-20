"use client";

import { useRef, useState } from "react";
import { Send, CheckCircle2, AlertCircle, MessageCircle, Mail } from "lucide-react";
import { SITE } from "@/lib/site";

// General enquiry form. Posts to the same /api/contact endpoint as the quote
// form so both public forms share one validated, rate-limited code path.
const GENERAL_SERVICES = [
  "MEP BIM Modelling",
  "MEP Coordination",
  "Clash Detection & Resolution",
  "BIM Management / CDE Support",
  "MEP Shop Drawings",
  "Combined Services & Builders' Work Drawings",
  "MEP QA/QC & Model Checking",
  "As-Built Models & Handover",
  "Model-Based Quantities",
  "Partnership / sub-contract",
  "Something else",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [draft, setDraft] = useState("");
  const inFlight = useRef(false);

  function compose(d) {
    return [
      `Name: ${d.name}`,
      `Company: ${d.company || "-"}`,
      `Email: ${d.email}`,
      `Phone: ${d.phone || "-"}`,
      `Country: ${d.country || "-"}`,
      `Subject: ${d.service || "General enquiry"}`,
      "",
      d.message || "(no detail provided)",
    ].join("\n");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;

    const fd = new FormData(e.currentTarget);
    const d = {
      name: (fd.get("name") || "").toString().trim(),
      company: (fd.get("company") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      country: (fd.get("country") || "").toString().trim(),
      service: (fd.get("service") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
      website: (fd.get("website") || "").toString().trim(),
    };
    setDraft(compose(d));

    const problems = [];
    if (!d.name) problems.push("Please enter your name.");
    if (!d.email) problems.push("Please enter your email address.");
    else if (!EMAIL_RE.test(d.email)) problems.push("Please enter a valid email address.");
    if (problems.length) {
      setStatus("error");
      setMessage(problems.join(" "));
      setPending(false);
      inFlight.current = false;
      return;
    }

    setPending(true);
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": publicRequestKey(d) },
        body: JSON.stringify({ ...d, service: d.service || "General enquiry", scope: d.message }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus("success");
        setReference(data.reference || "");
        setMessage(data.message);
        e.currentTarget.reset();
      } else {
        setStatus("error");
        setMessage(
          data.message || "The enquiry could not be recorded. Please use WhatsApp or email below."
        );
      }
    } catch {
      setStatus("error");
      setMessage(
        `The enquiry could not be sent from this page. Please use WhatsApp or email ${SITE.email}.`
      );
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-health-green/30 bg-health-green/10 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto text-health-green" size={40} />
        <h3 className="mt-4 text-lg font-bold text-sand-50">Enquiry recorded</h3>
        <p className="mt-2 text-sm text-sand-200/80">{message}</p>
        {reference && (
          <p className="mt-2 text-xs text-sand-300/60">
            Your reference: <span className="font-mono">{reference}</span>
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setReference("");
            setMessage("");
          }}
          className="btn-outline mt-6 border-sand-500/30 text-sand-100 hover:bg-sand-500/10"
        >
          Send another
        </button>
      </div>
    );
  }

  const cls = "field bg-hud-900 text-sand-50 border-sand-500/20";

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.04] p-7">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-hp">Website</label>
        <input id="cf-hp" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label text-sand-300" htmlFor="cf-name">Full name *</label>
          <input id="cf-name" name="name" required maxLength={120} className={cls} placeholder="Jane Smith" />
        </div>
        <div>
          <label className="field-label text-sand-300" htmlFor="cf-email">Work email *</label>
          <input id="cf-email" name="email" type="email" required maxLength={200} className={cls} placeholder="jane@company.com" />
        </div>
        <div>
          <label className="field-label text-sand-300" htmlFor="cf-company">Company</label>
          <input id="cf-company" name="company" maxLength={160} className={cls} placeholder="Company Ltd" />
        </div>
        <div>
          <label className="field-label text-sand-300" htmlFor="cf-phone">Phone / WhatsApp</label>
          <input id="cf-phone" name="phone" maxLength={40} className={cls} placeholder="+971 50 000 0000" />
        </div>
        <div>
          <label className="field-label text-sand-300" htmlFor="cf-country">Country</label>
          <input id="cf-country" name="country" maxLength={80} className={cls} placeholder="United Kingdom" />
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label text-sand-300" htmlFor="cf-service">Subject</label>
        <select id="cf-service" name="service" className={cls}>
          <option value="">Select a subject…</option>
          {GENERAL_SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="field-label text-sand-300" htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          maxLength={4000}
          className={cls}
          placeholder="Tell us briefly what you need…"
        />
      </div>

      {status === "error" && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm" role="alert">
          <p className="flex items-start gap-2 text-red-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(draft)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2 border-sand-500/30 text-sand-100"
            >
              <MessageCircle size={15} /> Open WhatsApp message
            </a>
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent("General enquiry")}&body=${encodeURIComponent(draft)}`}
              className="btn-outline inline-flex items-center gap-2 border-sand-500/30 text-sand-100"
            >
              <Mail size={15} /> Open email draft
            </a>
          </div>
          <p className="mt-2 text-xs text-sand-300/60">
            These open a prepared draft in WhatsApp or your mail app. Nothing is sent until you press send there.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="btn-accent mt-5 w-full justify-center py-3 text-base disabled:opacity-60"
      >
        {pending ? "Sending…" : (<>Send enquiry <Send size={16} /></>)}
      </button>

      <p className="mt-3 text-center text-xs text-sand-300/50">
        Confirmation appears only after your enquiry has been recorded. We reply to the email you give.
      </p>
    </form>
  );
}
function publicRequestKey(body) {
  const signature=JSON.stringify(body), previous=JSON.parse(sessionStorage.getItem('datum-public-enquiry')||'null');
  if(previous?.signature===signature)return previous.key;
  const key=crypto.randomUUID();sessionStorage.setItem('datum-public-enquiry',JSON.stringify({signature,key}));return key;
}
