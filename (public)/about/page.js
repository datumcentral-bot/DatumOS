import Link from "next/link";
import { SITE, OFFICES, VALUES, CERTS, STATS } from "@/lib/site";
import { ArrowRight, MapPin, Quote, ShieldCheck, Target, Eye } from "lucide-react";

export const metadata = {
  title: "About",
  description: "DATUM BIM ENGINEERING — a premier BIM solutions provider established 2021 in Lahore, Pakistan, serving the GCC, Middle East and beyond.",
};

const STATUS_TONE = {
  Compliant: "text-health-green border-health-green/40 bg-health-green/10",
  Accredited: "text-health-green border-health-green/40 bg-health-green/10",
  "Gold Partner": "text-sand-300 border-sand-400/40 bg-sand-500/10",
  "In Progress": "text-health-amber border-health-amber/40 bg-health-amber/10",
};

export default function AboutPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="border-b border-hud-line/50 bg-hud-950 bg-grid">
        <div className="container-x py-16 lg:py-20">
          <span className="eyebrow">About the firm</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-sand-50 sm:text-5xl">
            A premier Building Information Modeling solutions provider
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-sand-200/70">
            Established in {SITE.established} and headquartered in {SITE.city}, DATUM BIM ENGINEERING has rapidly emerged as
            a leading BIM service provider across the GCC, Middle East and South Asia — delivering world-class solutions to
            clients in commercial, residential, industrial, infrastructure and heritage sectors.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-sand-50 sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-sand-200/55">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION / MISSION */}
      <section className="bg-hud-900 py-16">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-8">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sand-500/15 text-sand-300"><Eye size={20} /></span>
            <h2 className="mt-4 text-xl font-extrabold text-sand-50">Our Vision</h2>
            <p className="mt-3 text-sand-200/75">
              To be the leading BIM solutions provider in the Middle East and South Asia region, recognised for delivering
              innovative, sustainable and technologically advanced building-information-modeling services that transform
              the construction industry and create lasting value for all stakeholders.
            </p>
          </div>
          <div className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-8">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sand-500/15 text-sand-300"><Target size={20} /></span>
            <h2 className="mt-4 text-xl font-extrabold text-sand-50">Our Mission</h2>
            <p className="mt-3 text-sand-200/75">
              To provide world-class BIM services that enable clients to achieve operational excellence, reduce
              construction costs, improve delivery times and enhance facility-management outcomes — through advanced BIM
              technologies, industry best practices and a customer-centric approach.
            </p>
          </div>
        </div>
      </section>

      {/* CEO MESSAGE */}
      <section className="bg-hud-950 py-16">
        <div className="container-x">
          <div className="rounded-2xl border border-sand-400/30 bg-sand-500/[0.05] p-8 lg:p-10">
            <Quote size={36} className="text-sand-400/60" />
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-sand-100/90">
              &ldquo;Building Information Modeling is fundamentally revolutionising the way buildings are designed,
              constructed and managed throughout their lifecycle. Our team is dedicated to leveraging the latest BIM
              technologies, software platforms and industry best practices to deliver projects that not only meet, but
              exceed, our clients&apos; expectations. We look forward to establishing long-term strategic partnerships and
              delivering excellence in every endeavour we undertake.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-olive-700 text-sm font-extrabold text-sand-50">SA</span>
              <div>
                <p className="font-bold text-sand-50">{SITE.ceo}</p>
                <p className="text-sm text-sand-200/60">Chief Executive Officer · DATUM BIM ENGINEERING</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="border-y border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <span className="eyebrow">What drives us</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Core values</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <div key={v.title} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <p className="stencil text-sm font-bold text-sand-400">0{i + 1}</p>
                <h3 className="mt-2 text-lg font-bold text-sand-50">{v.title}</h3>
                <p className="mt-2 text-sm text-sand-200/70">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-hud-950 py-16">
        <div className="container-x">
          <span className="eyebrow">Standards &amp; compliance</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Certifications &amp; accreditations</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CERTS.map((c) => (
              <div key={c.name} className="flex items-start justify-between gap-3 rounded-xl border border-sand-500/15 bg-sand-500/[0.03] p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={17} className="text-sand-400" />
                    <p className="font-bold text-sand-50">{c.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-sand-200/60">{c.type}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[c.status] || "text-sand-300 border-sand-400/40 bg-sand-500/10"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICES */}
      <section className="border-t border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <span className="eyebrow">Where we operate</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Offices</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICES.map((o) => (
              <div key={o.city} className={`rounded-2xl border p-6 ${o.primary ? "border-sand-400/40 bg-sand-500/[0.06]" : "border-sand-500/15 bg-sand-500/[0.03]"}`}>
                <MapPin size={18} className="text-sand-400" />
                <p className="mt-3 text-lg font-bold text-sand-50">{o.city}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-sand-300/70">{o.country} · {o.role}</p>
                <p className="mt-2 text-sm text-sand-200/65">{o.addr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-olive-800">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-x relative flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="max-w-2xl text-2xl font-extrabold text-sand-50 sm:text-3xl">Partner with a team that guarantees outcomes.</h2>
          <Link href="/contact" className="btn-accent px-6 py-3 text-base">Get in touch <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
