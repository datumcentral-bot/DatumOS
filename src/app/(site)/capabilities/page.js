import Link from "next/link";
import { LOD_LEVELS, BIM_PROCESS, ENGAGEMENT, SOFTWARE, PRODUCTS } from "@/lib/site";
import { ArrowRight, CheckCircle2, Layers } from "lucide-react";

export const metadata = {
  title: "Capabilities",
  description: "BIM capabilities across all LOD levels, a rigorous 20-point QA/QC process, our ISO 19650 implementation workflow, engagement process, software portfolio and BIM-enabled tools.",
};

// The 20-point QA/QC checklist (from the BIM Services doc + standard ISO 19650-2 checks).
const QA_CHECKS = [
  { id: "QA-01", desc: "Verify overall model dimensions against control coordinates", method: "Manual / BIM Collaborate", freq: "Per Phase" },
  { id: "QA-02", desc: "Check for unintended model element duplication / overlap", method: "Dynamo Script", freq: "Weekly" },
  { id: "QA-03", desc: "Validate required parameters per BEP are populated correctly", method: "Custom Revit Plugin", freq: "Per Submission" },
  { id: "QA-04", desc: "Verify classification and coding (Uniclass / Omniclass)", method: "Solibri / Navisworks", freq: "Per Phase" },
  { id: "QA-05", desc: "Verify file-naming conventions per BS EN ISO 19650-2", method: "Manual Audit", freq: "Per Submission" },
  { id: "QA-06", desc: "Check model structure and layering against template", method: "Model Checker", freq: "Weekly" },
  { id: "QA-07", desc: "Run interference check across all federated disciplines", method: "Navisworks", freq: "Weekly" },
  { id: "QA-08", desc: "Review clash-test results and assign actions", method: "Navisworks / BIM 360", freq: "Weekly" },
  { id: "QA-09", desc: "Confirm level / grid alignment across all models", method: "Manual / Model Checker", freq: "Per Phase" },
  { id: "QA-10", desc: "Validate shared coordinates & survey point", method: "Manual Audit", freq: "Per Submission" },
  { id: "QA-11", desc: "Check worksets & ownership are correctly assigned", method: "Revit Audit", freq: "Weekly" },
  { id: "QA-12", desc: "Verify view templates & sheet standards applied", method: "Model Checker", freq: "Per Submission" },
  { id: "QA-13", desc: "Confirm room / space data integrity & boundaries", method: "Solibri", freq: "Per Phase" },
  { id: "QA-14", desc: "Validate quantities & schedules against model", method: "Revit Schedules", freq: "Per Submission" },
  { id: "QA-15", desc: "Check purge of unused families / imports / CAD", method: "Dynamo Script", freq: "Weekly" },
  { id: "QA-16", desc: "Verify LOD / LOI meets the specified requirement", method: "Manual Review", freq: "Per Phase" },
  { id: "QA-17", desc: "Confirm COBie data completeness for handover", method: "Solibri / Excel", freq: "Per Milestone" },
  { id: "QA-18", desc: "Model performance / file-size health check", method: "Revit Audit", freq: "Weekly" },
  { id: "QA-19", desc: "Suitability status (S0–S4) & revision coding correct", method: "CDE Audit", freq: "Per Submission" },
  { id: "QA-20", desc: "Final Information-Manager sign-off before issue", method: "Manual Authorisation", freq: "Per Submission" },
];

export default function CapabilitiesPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="border-b border-hud-line/50 bg-hud-950 bg-grid">
        <div className="container-x py-16 lg:py-20">
          <span className="eyebrow">BIM capabilities &amp; assurance</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-sand-50 sm:text-5xl">
            Every model, verified before it leaves the studio
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            We operate at all Levels of Development (LOD 100 → 500) and run a rigorous, systematic QA/QC process aligned
            with ISO 19650 on every deliverable.
          </p>
        </div>
      </section>

      {/* LOD FRAMEWORK */}
      <section className="bg-hud-900 py-16">
        <div className="container-x">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-sand-400" />
            <h2 className="text-2xl font-extrabold text-sand-50 sm:text-3xl">LOD framework</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sand-200/70">Following AIA G202, UniFormat and BS 1192 standards — complete lifecycle support from concept to as-built.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOD_LEVELS.map((l) => (
              <div key={l.lod} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <div className="flex items-center justify-between">
                  <span className="stencil text-lg font-extrabold text-sand-300">{l.lod}</span>
                  <span className="rounded-md bg-olive-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sand-50">{l.phase}</span>
                </div>
                <p className="mt-3 text-sm text-sand-200/70">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QA/QC 20-POINT */}
      <section className="bg-hud-950 py-16">
        <div className="container-x">
          <span className="eyebrow">Our rigorous QA/QC process</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">A 20-point checklist on every submission</h2>
          <p className="mt-2 max-w-2xl text-sand-200/70">Every model undergoes systematic verification before delivery. In DatumOS, tasks cannot be marked complete until their QA/QC checklist is satisfied.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-sand-500/15">
            <table className="w-full text-left text-sm">
              <thead className="bg-hud-800 text-sand-300">
                <tr>
                  <th className="px-4 py-3 font-bold">Check</th>
                  <th className="px-4 py-3 font-bold">Description</th>
                  <th className="hidden px-4 py-3 font-bold md:table-cell">Method</th>
                  <th className="hidden px-4 py-3 font-bold sm:table-cell">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hud-line/40">
                {QA_CHECKS.map((c) => (
                  <tr key={c.id} className="bg-sand-500/[0.02] hover:bg-sand-500/[0.05]">
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-sand-300">{c.id}</td>
                    <td className="px-4 py-3 text-sand-100/90">{c.desc}</td>
                    <td className="hidden px-4 py-3 text-sand-200/60 md:table-cell">{c.method}</td>
                    <td className="hidden px-4 py-3 sm:table-cell"><span className="rounded-md bg-sand-500/10 px-2 py-0.5 text-xs font-semibold text-sand-300">{c.freq}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BIM IMPLEMENTATION PROCESS */}
      <section className="border-y border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <span className="eyebrow">Implementation</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Our 6-phase BIM process</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BIM_PROCESS.map((p) => (
              <div key={p.n} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-sand-500/15 text-sm font-extrabold text-sand-300">{p.n}</span>
                <h3 className="mt-3 font-bold text-sand-50">{p.title}</h3>
                <p className="mt-2 text-sm text-sand-200/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT PROCESS */}
      <section className="bg-hud-950 py-16">
        <div className="container-x">
          <span className="eyebrow">Working with us</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Our proven engagement process</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {ENGAGEMENT.map((e) => (
              <div key={e.n} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <span className="stencil text-3xl font-extrabold text-sand-400/70">{e.n}</span>
                <h3 className="mt-2 font-bold text-sand-50">{e.title}</h3>
                <p className="mt-2 text-sm text-sand-200/70">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIM-ENABLED TOOLS */}
      <section className="border-y border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <span className="eyebrow">BIM-enabled tools</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Products designed to enhance your workflows</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <h3 className="font-bold text-sand-50">{p.title}</h3>
                <p className="mt-1 text-xs text-sand-300/70">{p.sub}</p>
                <ul className="mt-4 space-y-1.5">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-sand-200/80">
                      <CheckCircle2 size={14} className="shrink-0 text-sand-400" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOFTWARE */}
      <section className="bg-hud-950 py-16">
        <div className="container-x">
          <span className="eyebrow">Technology stack</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Software portfolio</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {SOFTWARE.map((s) => (
              <span key={s} className="rounded-lg border border-sand-500/20 bg-sand-500/[0.04] px-3.5 py-1.5 text-sm font-semibold text-sand-100">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-olive-800">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-x relative flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="max-w-2xl text-2xl font-extrabold text-sand-50 sm:text-3xl">See our assurance framework in action.</h2>
          <Link href="/contact" className="btn-accent px-6 py-3 text-base">Book a Health Check <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
