import Link from "next/link";
import { SERVICES, SERVICE_GROUPS, ADVANCED_MODULES, SECTORS } from "@/lib/site";
import { ServiceCard } from "@/components/cards";
import {
  ArrowRight, CheckCircle2, Database, Compass, Boxes, Workflow, ScanLine, FlaskConical,
} from "lucide-react";

export const metadata = {
  title: "Services",
  description: "End-to-end BIM consultancy — Information Management, 3D Modelling & Coordination, Reality Capture, Automation and advanced digital-construction modules.",
};

const GROUP_ICONS = { Database, Compass, Boxes, Workflow, ScanLine, FlaskConical };

export default function ServicesPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="border-b border-hud-line/50 bg-hud-950 bg-grid">
        <div className="container-x py-16 lg:py-20">
          <span className="eyebrow">Comprehensive BIM Consultancy</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-sand-50 sm:text-5xl">
            End-to-end digital construction services
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            Providing a seamless information thread throughout your project lifecycle — from strategy and information
            management to intelligent 3D models, reality capture and automation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-accent">Get a Quote <ArrowRight size={14} /></Link>
            <Link href="/capabilities" className="btn-outline border-sand-500/30 text-sand-200 hover:bg-sand-500/10">View Capabilities</Link>
          </div>
        </div>
      </section>

      {/* SERVICE CARDS QUICK OVERVIEW */}
      <section className="bg-hud-900 py-14" id="services-overview">
        <div className="container-x">
          <span className="eyebrow">All disciplines at a glance</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50">Seven coordinated divisions</h2>
          <p className="mt-2 max-w-2xl text-sand-200/70">
            Led by our flagship BIM &amp; Digital Delivery division — all disciplines producing a single federated model.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICES.map((s) => (
              <ServiceCard
                key={s.code}
                service={{ id: s.code, code: s.code, name: s.name, description: s.blurb, colorHex: s.color, isFlagship: !!s.flagship }}
                href={`/services#${s.code.toLowerCase()}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* DISCIPLINE DIVISIONS (detailed) */}
      <section className="bg-hud-950 py-16" id="divisions">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-sand-50">Engineering divisions — detailed</h2>
          <p className="mt-2 max-w-2xl text-sand-200/70">Seven coordinated disciplines producing a single federated model — led by our flagship BIM &amp; Digital Delivery division.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.code} id={s.code.toLowerCase()} className={`rounded-2xl border p-6 ${s.flagship ? "border-sand-400/40 bg-sand-500/[0.07]" : "border-sand-500/15 bg-sand-500/[0.03]"}`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl text-sm font-extrabold text-sand-50" style={{ background: s.color }}>{s.code}</span>
                  {s.flagship && <span className="eyebrow">Flagship</span>}
                </div>
                <h3 className="mt-4 text-lg font-bold text-sand-50">{s.name}</h3>
                <p className="mt-3 text-sm text-sand-200/70">{s.blurb}</p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sand-400 hover:text-sand-200 transition-colors">
                  Get a quote <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE SERVICE GROUPS */}
      <section className="bg-hud-900 py-16">
        <div className="container-x">
          <span className="eyebrow">Core service areas</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Six pillars of digital delivery</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_GROUPS.map((g) => {
              const GROUP_ICONS = { Database, Compass, Boxes, Workflow, ScanLine, FlaskConical };
              const Icon = GROUP_ICONS[g.icon] || Boxes;
              return (
                <div key={g.title} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6 transition-colors hover:border-sand-400/30">
                  <Icon size={22} className="text-sand-400" />
                  <h3 className="mt-4 text-lg font-bold text-sand-50">{g.title}</h3>
                  <p className="mt-2 text-sm text-sand-200/70">{g.description}</p>
                  {g.items && (
                    <ul className="mt-4 space-y-1.5">
                      {g.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-sand-200/70">
                          <CheckCircle2 size={13} className="shrink-0 text-sand-400" /> {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ADVANCED MODULES */}
      {ADVANCED_MODULES && ADVANCED_MODULES.length > 0 && (
        <section className="bg-hud-950 py-16">
          <div className="container-x">
            <span className="eyebrow">Advanced modules</span>
            <h2 className="mt-3 text-2xl font-extrabold text-sand-50">Next-generation digital delivery</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ADVANCED_MODULES.map((m) => (
                <div key={m.title} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                  <h3 className="text-base font-bold text-sand-50">{m.title}</h3>
                  <p className="mt-2 text-sm text-sand-200/70">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-hud-line/50 bg-hud-900 py-16">
        <div className="container-x text-center">
          <h2 className="text-2xl font-extrabold text-sand-50">Ready to start your project?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sand-200/70">
            Tell us your scope, disciplines and timeline — we'll respond within one business day.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-accent px-6 py-3 text-base">Get a Free Quote <ArrowRight size={16} /></Link>
            <Link href="/capabilities" className="btn-outline border-sand-500/30 px-6 py-3 text-base text-sand-200 hover:bg-sand-500/10">View Capabilities</Link>
          </div>
        </div>
      </section>
    </div>
  );
}