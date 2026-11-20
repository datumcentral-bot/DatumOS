"use client";

import { useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Send, MessageCircle, Mail } from "lucide-react";
import { SITE } from "@/lib/site";

// Services are limited to what the studio actually delivers. Nothing is listed
// here that the team cannot currently resource or supervise.
const SERVICES = [
  "MEP BIM Modelling",
  "MEP Coordination",
  "Clash Detection & Resolution",
  "BIM Management / CDE Support",
  "MEP Shop Drawings",
  "Combined Services & Builders' Work Drawings",
  "MEP QA/QC & Model Checking",
  "As-Built Models & Handover",
  "Model-Based Quantities",
  "Mixed scope — please advise",
];

const DISCIPLINES = [
  "Mechanical / HVAC",
  "Mechanical piping",
  "Electrical",
  "Plumbing & drainage",
  "Fire protection",
  "ELV / fire alarm",
  "Builders' work",
  "Not sure yet",
];

const INPUT_FORMATS = [
  "Native Revit (.rvt)",
  "IFC",
  "DWG",
  "PDF / scanned drawings",
  "Point cloud / scan",
  "Not issued yet",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function waLink(body) {
  return `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
}

function mailLink(subject, body) {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function QuoteForm({ compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState([]);
  const [sentText, setSentText] = useState("");
  const [sentSubject, setSentSubject] = useState("MEP BIM enquiry");
  const formRef = useRef(null);
  const inFlight = useRef(false);

  function collect(fd) {
    return {
      name: (fd.get("name") || "").toString().trim(),
      company: (fd.get("company") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      country: (fd.get("country") || "").toString().trim(),
      service: (fd.get("service") || "").toString().trim(),
      disciplines: Array.from(fd.getAll("disciplines")).filter(Boolean).join(", "),
      scope: (fd.get("scope") || "").toString().trim(),
      inputFormats: Array.from(fd.getAll("inputFormats")).filter(Boolean).join(", "),
      deadline: (fd.get("deadline") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
      website: (fd.get("website") || "").toString().trim(),
    };
  }

  function compose(d) {
    const lines = [
      `Name: ${d.name}`,
      `Company: ${d.company || "-"}`,
      `Email: ${d.email}`,
      `Phone: ${d.phone || "-"}`,
      `Country: ${d.country || "-"}`,
      `Service: ${d.service}`,
      `Disciplines: ${d.disciplines || "-"}`,
      `Input formats supplied: ${d.inputFormats || "-"}`,
      `Deadline: ${d.deadline || "-"}`,
      "",
      "Scope:",
      d.scope || d.message,
    ];
    if (d.scope && d.message) lines.push("", "Additional message:", d.message);
    return lines.join("\n");
  }

  // Human-readable subject for the fallback email draft.
  function subjectOf(d) {
    const who = d.company || d.name;
    const what = d.service || "MEP BIM enquiry";
    return who ? `${what} — ${who}` : what;
  }

  function validate(d) {
    const e = [];
    if (!d.name) e.push("Please enter your name.");
    if (!d.email) e.push("Please enter your email address.");
    else if (!EMAIL_RE.test(d.email)) e.push("Please enter a valid email address.");
    if (!d.service) e.push("Please select the service you need.");
    if (!d.scope && !d.message) e.push("Please describe your scope or requirements.");
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (inFlight.current) return; // duplicate-submit guard
    inFlight.current = true;

    const d = collect(new FormData(ev.currentTarget));
    const body = compose(d);
    const localErrors = validate(d);
    setErrors(localErrors);
    setSentText(body);
    setSentSubject(subjectOf(d));
    if (localErrors.length) {
      setStatus("error");
      setMessage(localErrors.join(" "));
      inFlight.current = false;
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": publicRequestKey(d) },
        body: JSON.stringify(d),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        // Only shown after the server confirmed the record was written.
        setStatus("success");
        setReference(data.reference || "");
        setMessage(data.message);
        formRef.current?.reset();
      } else {
        setStatus("error");
        setMessage(
          data.message ||
            "The enquiry could not be recorded. Please use WhatsApp or email below so nothing is lost."
        );
      }
    } catch {
      setStatus("error");
      setMessage(
        `The enquiry could not be sent from this page. Please use WhatsApp or email ${SITE.email} so nothing is lost.`
      );
    } finally {
      inFlight.current = false;
    }
  }

  const cls =
    "field w-full bg-hud-900 text-sand-50 border-sand-500/20";
  const lbl = "field-label text-sand-300";

  if (status === "success") {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-2xl border border-health-green/30 bg-health-green/10 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={40} className="text-health-green" />
        <h3 className="text-lg font-bold text-sand-50">Enquiry recorded</h3>
        <p className="text-sm text-sand-200/80">{message}</p>
        {reference && (
          <p className="text-xs text-sand-300/60">
            Your reference: <span className="font-mono">{reference}</span>
          </p>
        )}
        <p className="text-xs text-sand-300/60">
          This confirmation means the enquiry was stored in our pipeline. A written response
          from a person is a separate step.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setReference("");
            setMessage("");
          }}
          className="btn-outline mt-2 border-sand-500/30 text-sand-100 hover:bg-sand-500/10"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {!compact && (
        <div className="mb-2">
          <h3 className="text-xl font-extrabold text-sand-50">Request a project quote</h3>
          <p className="mt-1 text-sm text-sand-200/60">
            Tell us the discipline and drawing scope. A BIM lead replies within one business day.
          </p>
        </div>
      )}

      {/* Honeypot — hidden from users, catches naive bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="hp-website">Website</label>
        <input id="hp-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
        <div>
          <label className={lbl} htmlFor="q-name">Full name *</label>
          <input id="q-name" name="name" required maxLength={120} className={cls} placeholder="Jane Smith" />
        </div>
        <div>
          <label className={lbl} htmlFor="q-email">Work email *</label>
          <input id="q-email" name="email" type="email" required maxLength={200} className={cls} placeholder="jane@company.com" />
        </div>
        <div>
          <label className={lbl} htmlFor="q-company">Company / organisation</label>
          <input id="q-company" name="company" maxLength={160} className={cls} placeholder="Company Ltd" />
        </div>
        <div>
          <label className={lbl} htmlFor="q-phone">Phone / WhatsApp</label>
          <input id="q-phone" name="phone" maxLength={40} className={cls} placeholder="+971 50 000 0000" />
        </div>
        <div>
          <label className={lbl} htmlFor="q-country">Project country</label>
          <input id="q-country" name="country" maxLength={80} className={cls} placeholder="United Arab Emirates" />
        </div>
        <div>
          <label className={lbl} htmlFor="q-deadline">Required date / deadline</label>
          <input id="q-deadline" name="deadline" maxLength={120} className={cls} placeholder="e.g. shop drawings by 2026-12-01" />
        </div>
      </div>

      <div>
        <label className={lbl} htmlFor="q-service">Service required *</label>
        <select id="q-service" name="service" required className={cls}>
          <option value="">Select a service…</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <fieldset className="border-0 p-0">
        <legend className={lbl}>MEP disciplines involved</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {DISCIPLINES.map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm text-sand-200/80">
              {/* h-6 w-6 = 24x24 CSS px, the WCAG 2.5.8 (AA) minimum target size.
                  The browser default checkbox is 13x13, which fails it. */}
              <input type="checkbox" name="disciplines" value={d} className="h-6 w-6 shrink-0 accent-[#6b8e23]" />
              {d}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0">
        <legend className={lbl}>Input drawings / formats supplied</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {INPUT_FORMATS.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm text-sand-200/80">
              <input type="checkbox" name="inputFormats" value={f} className="h-6 w-6 shrink-0 accent-[#6b8e23]" />
              {f}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className={lbl} htmlFor="q-scope">Approximate scope *</label>
        <textarea
          id="q-scope"
          name="scope"
          rows={compact ? 3 : 4}
          maxLength={4000}
          className={cls}
          placeholder="e.g. HVAC and electrical coordination for one floor, plus shop drawings for 40 sheets from client-approved Revit models."
        />
      </div>

      <div>
        <label className={lbl} htmlFor="q-message">Anything else we should know</label>
        <textarea
          id="q-message"
          name="message"
          rows={compact ? 2 : 3}
          maxLength={4000}
          className={cls}
          placeholder="Contractor or consultant role, current stage, who approves design changes, target programme…"
        />
      </div>

      {status === "error" && (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <p className="flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </p>
          <p className="mt-3 font-semibold text-sand-100">
            Send it yourself in one tap — your details are already filled in:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={waLink(sentText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2 border-sand-500/30 text-sand-100"
            >
              <MessageCircle size={15} /> Open WhatsApp message
            </a>
            <a
              href={mailLink(sentSubject, sentText)}
              className="btn-outline inline-flex items-center gap-2 border-sand-500/30 text-sand-100"
            >
              <Mail size={15} /> Open email draft
            </a>
          </div>
          <p className="mt-2 text-xs text-sand-300/60">
            These open WhatsApp / your mail app with a prepared draft. Nothing is sent until you
            press send there.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        aria-busy={status === "loading"}
        className="btn-accent w-full justify-center py-3 text-base disabled:opacity-60"
      >
        {status === "loading" ? (
          "Sending…"
        ) : (
          <>
            <Send size={16} /> Submit Project Details
          </>
        )}
      </button>

      <p className="text-center text-xs text-sand-300/50">
        Or call / WhatsApp {SITE.phone} · {SITE.email}
      </p>
    </form>
  );
}
function publicRequestKey(body) {
  const signature=JSON.stringify(body), previous=JSON.parse(sessionStorage.getItem('datum-public-enquiry')||'null');
  if(previous?.signature===signature)return previous.key;
  const key=crypto.randomUUID();sessionStorage.setItem('datum-public-enquiry',JSON.stringify({signature,key}));return key;
}
