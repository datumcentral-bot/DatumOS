import Link from "next/link";
import { GROUP } from "@/lib/site";
import { ArrowRight, Building2 } from "lucide-react";

export const metadata = {
  title: "Datum Group",
  description: "The Datum Group — a family of companies spanning BIM engineering, ventures, shared services, capabilities, developments, holdings, productions and stores.",
};

export default function GroupPage() {
  const flagship = GROUP.find((g) => g.flagship);
  const rest = GROUP.filter((g) => !g.flagship);
  return (
    <div className="bg-hud-950">
      {/* HEADER */}
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16 lg:py-20">
          <span className="eyebrow">One group, many capabilities</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">The Datum Group</h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            DATUM BIM ENGINEERING is the flagship digital-engineering practice within a wider family of companies —
            together spanning ventures, shared services, talent, development, holdings, media and products.
          </p>
        </div>
      </section>

      {/* FLAGSHIP */}
      {flagship && (
        <section className="py-14">
          <div className="container-x">
            <div className="grid items-center gap-8 rounded-3xl border border-sand-400/30 bg-sand-500/[0.05] p-8 lg:grid-cols-[300px_1fr] lg:p-10">
              <div className="grid h-32 place-items-center rounded-2xl bg-white/95 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagship.logo} alt={flagship.name} className="max-h-16 max-w-full object-contain" />
              </div>
              <div>
                <span className="eyebrow">Flagship company</span>
                <h2 className="mt-3 text-3xl font-extrabold text-sand-50">{flagship.name}</h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-sand-300/70">{flagship.tagline}</p>
                <p className="mt-4 max-w-xl text-sand-200/75">{flagship.text}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/services" className="btn-accent px-5 py-2.5">Our services <ArrowRight size={17} /></Link>
                  <Link href="/projects" className="btn-outline border-sand-500/30 px-5 py-2.5 text-sand-100 hover:bg-sand-500/10">View projects</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GROUP COMPANIES */}
      <section className="border-t border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-sand-400" />
            <h2 className="text-2xl font-extrabold text-sand-50 sm:text-3xl">Group companies</h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((g) => (
              <div key={g.key} className="overflow-hidden rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] transition-colors hover:border-sand-400/30">
                <div className="grid h-24 place-items-center bg-white/95 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.logo} alt={g.name} className="max-h-16 max-w-full object-contain" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-sand-50">{g.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sand-300/70">{g.tagline}</p>
                  <p className="mt-3 text-sm text-sand-200/70">{g.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-olive-800">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-x relative flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="max-w-2xl text-2xl font-extrabold text-sand-50 sm:text-3xl">Work with the Datum Group.</h2>
          <Link href="/contact" className="btn-accent px-6 py-3 text-base">Contact us <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
