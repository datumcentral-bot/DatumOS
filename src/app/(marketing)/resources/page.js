import Link from "next/link";
import { ResourceCard } from "@/components/cards";
import { ShareButtons, SocialLinks } from "@/components/public";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata = {
  title: "Resources & Insights",
  description: "Downloadable MEP BIM demonstration drawing sheets and the reference material behind them — every item on this page actually opens.",
};

// Static resource library — in a full implementation these would come from the DB
// Resource library — every entry below points at something that ACTUALLY EXISTS.
// The previous list named nine items (case studies on named projects, white papers,
// webinars) with publication dates and figures such as "3,400 clashes resolved" and
// "reducing QS time by up to 60%". None of those documents exist anywhere in this
// repository, and the named-project case studies carried the same unevidenced claims
// withdrawn elsewhere. Withdrawn 2026-10-09; retained in the internal review record.
// Rule for this page: never list a document that cannot be opened.
const RESOURCES = [
  {
    id: "s1",
    title: "Sample 01 — Plumbing & Drainage: Level 02 Layout",
    type: "Drawing sheet",
    summary: "Soil stack, branch connections, drainage schedule and fall notes. One of six demonstration sheets sharing a single coordinate system. Openable and downloadable.",
    publishedAt: "2026-10-09",
    href: "/samples",
  },
  {
    id: "s2",
    title: "Sample 02 — HVAC Coordination: Supply Air Routing",
    type: "Drawing sheet",
    summary: "Duct routing checked against a ceiling void limit, with maintenance access clearance stated rather than assumed.",
    publishedAt: "2026-10-09",
    href: "/samples",
  },
  {
    id: "s3",
    title: "Sample 03 — Electrical Containment: Trays and Drops",
    type: "Drawing sheet",
    summary: "Tray routing, containment drops to distribution boards, and the schedule entries a containment drawing carries.",
    publishedAt: "2026-10-09",
    href: "/samples",
  },
  {
    id: "s4",
    title: "Sample 04 — Combined Services & Builders' Work: Openings",
    type: "Drawing sheet",
    summary: "Composite plan with every service crossing, plus the opening and sleeve schedule that goes with it.",
    publishedAt: "2026-10-09",
    href: "/samples",
  },
  {
    id: "s5",
    title: "Sample 05 — Clash Issue CL-014 and Recheck",
    type: "Drawing sheet",
    summary: "The full loop: detection, ownership, proposed change, approval before the model edit, correction, recheck, recorded closure.",
    publishedAt: "2026-10-09",
    href: "/samples",
  },
  {
    id: "s6",
    title: "Sample 06 — As-Built Revision Record",
    type: "Drawing sheet",
    summary: "A site change reflected in model and drawing, with the supersession of the previous revision recorded.",
    publishedAt: "2026-10-09",
    href: "/samples",
  },
  {
    id: "c1",
    title: "MEP Services — scope, inputs, outputs and exclusions",
    type: "Reference",
    summary: "Sections A to I, each stating what we need from you, what you receive, how it is checked, and what is excluded unless separately agreed.",
    publishedAt: "2026-10-09",
    href: "/services",
  },
  {
    id: "c2",
    title: "DatumBIM OS — what the platform does and does not claim",
    type: "Reference",
    summary: "Registers, revisions, coordination issues and QA records, with an explicit statement that it is internal and is not offered as a licensed product.",
    publishedAt: "2026-10-09",
    href: "/services",
  },
  {
    id: "c3",
    title: "How we handle enquiry information",
    type: "Reference",
    summary: "What is collected, why, where it is stored, how long it is kept, and how to ask for it back or have it deleted.",
    publishedAt: "2026-10-09",
    href: "/privacy",
  },
];

const TYPES = ["All", "Drawing sheet", "Reference"];

export default function ResourcesPage() {
  return (
    <div className="bg-hud-950">
      {/* HEADER */}
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16">
          <span className="eyebrow">Knowledge Hub</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">
            Resources &amp; Insights
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            Case studies, white papers, guides and webinars from the DATUM BIM ENGINEERING team — practical knowledge
            for digital construction professionals.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-sand-500/20 bg-sand-500/[0.06] px-3 py-1 text-xs font-semibold text-sand-200/80 cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <ShareButtons title="DATUM BIM ENGINEERING — Resources & Insights" tone="light" />
          </div>
        </div>
      </section>

      {/* RESOURCE GRID */}
      <section className="py-16">
        <div className="container-x">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-sand-400" />
              <h2 className="text-xl font-extrabold text-sand-50">{RESOURCES.length} items — all openable</h2>
            </div>
            <Link href="/contact" className="btn-accent text-sm">
              Request a consultation <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-hud-line/50 bg-hud-900 py-16">
        <div className="container-x text-center">
          <h2 className="text-2xl font-extrabold text-sand-50">Ready to price a limited package?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sand-200/70">
            Send us the discipline, the drawings you hold and the date you need them, and we will reply within one business day with either a firm quotation for a limited package or a clear list of what we still need.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-accent px-6 py-3 text-base">
              Send your project details <ArrowRight size={16} />
            </Link>
            <Link href="/capabilities" className="btn-outline border-sand-500/30 px-6 py-3 text-base text-sand-200 hover:bg-sand-500/10">
              View our capabilities
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
