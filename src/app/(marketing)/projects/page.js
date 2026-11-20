import { SocialLinks, ShareButtons } from "@/components/public";
import { SECTORS } from "@/lib/site";
import { ArrowRight, Download, Eye } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Scope & Samples — What We Deliver",
  description:
    "The MEP BIM services DATUM Studios delivers, and six downloadable demonstration drawing sheets showing the standard we work to.",
};

// Why this page no longer shows a project list
// ─────────────────────────────────────────────────────────────────────────
// This page previously read PORTFOLIO from src/lib/site.js, which named eight
// third-party landmark developments (residential towers, an international
// airport terminal, a large district, a mall and others) together with areas,
// sheet counts and a municipal filing. None of it could be evidenced, and no
// publication permission existed.
//
// It also rendered `getFeaturedProjects(24)` from the studio database on a
// PUBLIC page. That table holds internal and seeded demonstration data, so it
// did not belong on a public route at all and has been removed.
//
// Nothing here is recorded as false. The withdrawn copy is retained in
// Withdrawn_Public_Claims_Internal_Record.md (sales package) and in
// Claims_Register.md. Reinstate only with evidence plus written permission.

const SCOPE = [
  {
    title: "MEP Shop Drawings",
    tag: "Start point",
    what: "Layouts, sections, risers and agreed schematics produced from your approved design, with dimensions, levels, tags, equipment details and schedules.",
    check: "Checked against the model before issue. No design change without the responsible party approving it.",
    start: "One discipline, or a fixed number of sheets.",
  },
  {
    title: "MEP Coordination",
    tag: "Start point",
    what: "Federated review resolving where services fight for space — not only geometric overlaps but lost access and maintenance clearances.",
    check: "Every issue carries an owner, a proposal, an approval and a recheck result. No clash-free guarantee is given.",
    start: "One zone or one floor.",
  },
  {
    title: "MEP BIM Modelling",
    tag: "Start point",
    what: "Mechanical piping, HVAC, electrical, plumbing and drainage, fire protection and ELV, to a model requirement agreed in writing first.",
    check: "Parameters, levels, naming and shared coordinate system verified before handover.",
    start: "One discipline, one level.",
  },
  {
    title: "Combined Services & Builders' Work",
    tag: "On request",
    what: "Composite plans and coordinated sections, with an opening, sleeve and penetration schedule by reference, size and location.",
    check: "Coordinated from the resolved model. Structural adequacy stays with the responsible party.",
    start: "One floor.",
  },
  {
    title: "MEP QA/QC",
    tag: "On request",
    what: "Independent check of the model and drawing set: parameters, systems, naming, levels, dimensions, schedules and revision status.",
    check: "Findings are returned against a written checklist, traceable to a specific file, view or sheet.",
    start: "Per deliverable.",
  },
  {
    title: "As-Built & Handover",
    tag: "On request",
    what: "Final models and drawings reflecting verified site conditions, with registers, revision history and the agreed asset data.",
    check: "Nothing is changed without an authorised instruction. Superseded revisions are archived, not deleted.",
    start: "Per project.",
  },
];

const SAMPLES = [
  { ref: "M-201", title: "Plumbing and Drainage — Level 02 Layout", discipline: "Plumbing & drainage" },
  { ref: "M-301", title: "HVAC Coordination — Supply Air Routing", discipline: "HVAC / mechanical" },
  { ref: "M-401", title: "Electrical Containment — Trays and Drops", discipline: "Electrical" },
  { ref: "M-501", title: "Combined Services and Builders' Work — Openings", discipline: "Multi-trade" },
  { ref: "M-601", title: "Clash Issue and Recheck — CL-014", discipline: "Coordination" },
  { ref: "M-701", title: "As-Built Revision Record", discipline: "As-built" },
];

const SAMPLE_FILES = [
  "demo-01-plumbing-drainage-layout",
  "demo-02-hvac-coordination",
  "demo-03-electrical-containment",
  "demo-04-combined-builders-work-openings",
  "demo-05-clash-issue-and-recheck",
  "demo-06-as-built-revision-record",
];

export default function ProjectsPage() {
  return (
    <div className="bg-hud-950">
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16">
          <span className="eyebrow">Scope &amp; Samples</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">
            What we deliver — and proof of the standard we work to.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            We do not publish a list of named client projects. Instead, this page states the scope we
            offer and links to six drawing sheets you can open and download, so you can judge the
            work yourself. Every sheet is stamped DEMONSTRATION — NOT A CLIENT PROJECT.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-sand-300/70">
            Client drawings are never published without written permission. If a project reference
            would help you decide, ask us directly and we will confirm what we can share.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <span key={s} className="rounded-full border border-sand-500/20 bg-sand-500/[0.06] px-3 py-1 text-xs font-semibold text-sand-200/80">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <ShareButtons title="DATUM Studios — MEP BIM scope and samples" tone="light" />
          </div>
        </div>
      </section>

      {/* SCOPE */}
      <section className="py-16">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-sand-50 sm:text-3xl">Delivery scope</h2>
          <p className="mt-2 max-w-2xl text-sand-200/70">
            Every item below can start small. The stated starting scope is the smallest unit that
            produces a usable deliverable.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {SCOPE.map((s) => (
              <article key={s.title} className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-extrabold text-sand-50">{s.title}</h3>
                  <span className="rounded-full border border-sand-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sand-300">
                    {s.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm text-sand-200/80">{s.what}</p>
                <p className="mt-3 text-sm text-sand-300/75">
                  <span className="font-semibold text-sand-300">How it is checked: </span>
                  {s.check}
                </p>
                <p className="mt-3 text-sm text-sand-300/75">
                  <span className="font-semibold text-sand-300">Start at: </span>
                  {s.start}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLES */}
      <section className="border-t border-hud-line/40 bg-hud-900 py-16">
        <div className="container-x">
          <span className="eyebrow">Demonstration sheets</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">Open and download the samples</h2>
          <p className="mt-2 max-w-3xl text-sand-200/70">
            Six internally consistent sheets sharing one coordinate system, so grid references, tags
            and routes carry across the set exactly as they would on a real issue. These are
            demonstration drawings produced by us. They are not client projects and must not be used
            for construction.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SAMPLES.map((s, i) => (
              <article key={s.ref} className="flex flex-col rounded-2xl border border-sand-500/15 bg-hud-950/60 p-5">
                <p className="font-mono text-xs text-sand-400">{s.ref}</p>
                <h3 className="mt-1 font-bold text-sand-50">{s.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-sand-300/70">{s.discipline}</p>
                <a
                  href={`/samples/${SAMPLE_FILES[i]}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-sand-500/25 px-3 py-2 text-xs text-sand-200 hover:bg-sand-500/10"
                >
                  <Eye size={14} /> Preview
                </a>
                <a
                  href={`/samples/${SAMPLE_FILES[i]}.svg`}
                  download
                  className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-olive-800 px-3 py-2.5 text-sm font-semibold text-sand-50 hover:bg-olive-700"
                >
                  <Download size={14} /> Download SVG
                </a>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/contact" className="btn-accent px-6 py-3 text-base">
              Request a project quote <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Follow us */}
      <section className="border-t border-sand-500/10">
        <div className="container-x flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-sand-300">Follow us</p>
          <SocialLinks size={18} keys={["linkedin", "youtube"]} />
        </div>
      </section>
    </div>
  );
}