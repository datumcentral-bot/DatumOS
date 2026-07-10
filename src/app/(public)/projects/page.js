import { getFeaturedProjects } from "@/lib/queries";
import { ShareButtons } from "@/components/public";
import { ProjectCard } from "@/components/cards";
import { PORTFOLIO, SECTORS } from "@/lib/site";
import { MapPin, Ruler, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Projects",
  description: "Landmark BIM projects delivered by DATUM BIM ENGINEERING — Manarat Residence, Dubai Airport T4, Riyadh KAFD, Masdar City, London Central Hospital and more.",
};

const STATUS_TONE = {
  Completed: "bg-health-green/15 text-health-green border-health-green/30",
  "In Progress": "bg-health-amber/15 text-health-amber border-health-amber/30",
};

export default async function ProjectsPage() {
  const projects = await getFeaturedProjects(24);

  return (
    <div className="bg-hud-950">
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16">
          <span className="eyebrow">Portfolio · Digital excellence in action</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">
            Partnerships worldwide, delivering clarity.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            250+ BIM projects across 30+ countries — from super-tall towers and international airports to hospitals,
            data centers and heritage restoration.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <span key={s} className="rounded-full border border-sand-500/20 bg-sand-500/[0.06] px-3 py-1 text-xs font-semibold text-sand-200/80">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <ShareButtons title="DATUM BIM ENGINEERING — Portfolio" tone="light" />
          </div>
        </div>
      </section>

      {/* FEATURED LANDMARK PROJECTS (from company profile) */}
      <section className="py-16">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-sand-50 sm:text-3xl">Featured landmark projects</h2>
          <p className="mt-2 max-w-2xl text-sand-200/70">Selected engagements demonstrating full-discipline coordination to LOD 400–500 under ISO 19650.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO.map((p) => (
              <div key={p.name} className="group overflow-hidden rounded-2xl border border-sand-500/15 bg-sand-500/[0.03]">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-olive-700 to-hud-950">
                  <div className="absolute inset-0 bg-grid opacity-40" />
                  <div className="absolute left-4 top-4">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[p.status] || "bg-sand-500/15 text-sand-200 border-sand-500/30"}`}>{p.status}</span>
                  </div>
                  <div className="absolute bottom-3 right-4">
                    <span className="stencil rounded bg-hud-950/60 px-2 py-0.5 text-xs font-bold text-sand-200">{p.lod}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-sand-50">{p.name}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sand-200/60">
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-sand-400" /> {p.loc}</span>
                    <span className="flex items-center gap-1"><Ruler size={13} className="text-sand-400" /> {p.area}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sand-300/70">{p.type}</p>
                  <p className="mt-3 text-sm text-sand-200/70">{p.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.disc.map((d) => (
                      <span key={d} className="rounded-md bg-olive-700 px-2 py-0.5 text-[10px] font-bold text-sand-50">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE SNAPSHOT FROM DATUMOS — using ProjectCard */}
      <section className="border-t border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-health-green animate-pulse-dot" />
            <span className="eyebrow">Live from DatumOS</span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Engagements currently in production</h2>
          <p className="mt-2 max-w-2xl text-sand-200/70">A real-time snapshot of active projects running through our ERP — progress and disciplines update as the studio works.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact" className="btn-accent px-6 py-3 text-base">
              Start your project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}