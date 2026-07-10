import { ShareButtons } from "@/components/public";
import { SITE } from "@/lib/site";
import { MapPin, Clock, ArrowRight } from "lucide-react";

export const metadata = { title: "Careers — Datum Studios" };

const ROLES = [
  { title: "Senior BIM Coordinator", div: "BIM & Digital Delivery", type: "Full-time", loc: "Lahore (Hybrid)", desc: "Lead federated coordination, clash detection and CDE management on international projects." },
  { title: "Structural Revit Modeler", div: "Structural", type: "Full-time", loc: "Lahore (On-site)", desc: "Produce analysis-driven structural models and detailing to LOD 350." },
  { title: "MEP Modeler (HVAC)", div: "Mechanical", type: "Full-time", loc: "Lahore (On-site)", desc: "Model ductwork and plant, coordinate clash-free with other disciplines." },
  { title: "QA/QC Reviewer", div: "BIM & Digital Delivery", type: "Full-time", loc: "Lahore (Hybrid)", desc: "Own the mandatory QA gate — verify deliverables against SOP checklists and standards." },
  { title: "Architectural Technologist", div: "Architecture", type: "Contract", loc: "Remote", desc: "Develop construction documentation and coordinated architectural BIM." },
  { title: "Business Development Executive", div: "Studio", type: "Full-time", loc: "Lahore", desc: "Drive the 25/day outreach discipline and grow the international pipeline." },
];

const PERKS = ["International project exposure", "ISO 19650 & BIM training", "Modern toolchain (Autodesk AEC, Solibri, ACC)", "Clear growth path", "Hybrid flexibility", "Performance bonuses"];

export default function CareersPage() {
  return (
    <div className="bg-hud-950">
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16">
          <span className="eyebrow">Join the studio</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">
            Build world-class projects — from Lahore, for the world.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            We hire engineers and BIM specialists who treat delivery as a discipline. Grow your craft on international
            projects with a modern toolchain and a strong quality culture.
          </p>
          <div className="mt-6">
            <ShareButtons title="Careers at Datum Studios" tone="light" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-sand-50">Open positions</h2>
            <div className="mt-6 space-y-4">
              {ROLES.map((r) => (
                <div key={r.title} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6 transition-colors hover:border-sand-400/30">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-sand-50">{r.title}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sand-300/70">{r.div}</p>
                    </div>
                    <a href={`mailto:${SITE.email}?subject=Application: ${encodeURIComponent(r.title)}`} className="btn-accent">
                      Apply <ArrowRight size={15} />
                    </a>
                  </div>
                  <p className="mt-3 text-sm text-sand-200/70">{r.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-sand-300/70">
                    <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {r.type}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {r.loc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="sticky top-24 rounded-2xl border border-sand-500/15 bg-sand-500/[0.04] p-6">
              <h3 className="font-bold text-sand-50">Why Datum Studios</h3>
              <ul className="mt-4 space-y-2.5">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-sand-200/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sand-400" /> {p}
                  </li>
                ))}
              </ul>
              <a href={`mailto:${SITE.email}?subject=General Application`} className="btn-outline mt-6 w-full justify-center border-sand-500/30 text-sand-100 hover:bg-sand-500/10">
                Send an open application
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
