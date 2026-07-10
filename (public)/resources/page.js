import Link from "next/link";
import { ResourceCard } from "@/components/cards";
import { ShareButtons } from "@/components/public";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata = {
  title: "Resources & Insights",
  description: "BIM case studies, white papers, guides and webinars from DATUM BIM ENGINEERING — practical knowledge for digital construction professionals.",
};

// Static resource library — in a full implementation these would come from the DB
const RESOURCES = [
  {
    id: "r1",
    title: "ISO 19650 Implementation Guide for MEP Contractors",
    type: "Guide",
    summary: "A step-by-step walkthrough of adopting ISO 19650 information management on live MEP projects — naming conventions, CDE states, suitability codes and handover packages.",
    publishedAt: "2024-11-15",
    href: "/contact",
  },
  {
    id: "r2",
    title: "Scan-to-BIM Workflow: From Point Cloud to LOD 400 Model",
    type: "White Paper",
    summary: "How DATUM BIM ENGINEERING processes terrestrial and drone LiDAR scans into fully coordinated Revit models — registration, noise filtering, clash-free delivery.",
    publishedAt: "2024-09-03",
    href: "/contact",
  },
  {
    id: "r3",
    title: "Manarat Residence — Full-Discipline BIM Case Study",
    type: "Case Study",
    summary: "How we delivered a 42-storey residential tower in Lahore with zero RFI backlog at handover — AR, ST, MEP and BIM coordination under a single federated model.",
    publishedAt: "2024-07-20",
    href: "/projects",
  },
  {
    id: "r4",
    title: "Dubai Airport T4 — MEP Coordination at Scale",
    type: "Case Study",
    summary: "Coordinating 1.2M m² of terminal MEP across 14 sub-contractors using Navisworks clash detection and a live CDE — 3,400 clashes resolved before construction.",
    publishedAt: "2024-05-10",
    href: "/projects",
  },
  {
    id: "r5",
    title: "BIM Staffing Models: Project-Based vs. Dedicated Team",
    type: "Guide",
    summary: "Choosing the right engagement model for your BIM production needs — when to use a project-based team, a dedicated embedded resource, or staff augmentation.",
    publishedAt: "2024-03-28",
    href: "/contact",
  },
  {
    id: "r6",
    title: "5D BIM Cost Estimation: Linking Quantities to the Model",
    type: "White Paper",
    summary: "Practical techniques for embedding cost data into Revit families and exporting live BOQs — reducing quantity surveying time by up to 60%.",
    publishedAt: "2024-02-14",
    href: "/contact",
  },
  {
    id: "r7",
    title: "Digital Twin Fundamentals for Facility Managers",
    type: "Webinar",
    summary: "A recorded session covering how to transition from a construction BIM model to an operational digital twin — asset tagging, COBie export and FM system integration.",
    publishedAt: "2023-12-05",
    href: "/contact",
  },
  {
    id: "r8",
    title: "QA/QC Checklist for BIM Deliverables (20-Point Framework)",
    type: "Guide",
    summary: "The mandatory 20-point quality gate used internally at DATUM BIM ENGINEERING — model health, naming compliance, clash status, LOD verification and client sign-off.",
    publishedAt: "2023-10-18",
    href: "/capabilities",
  },
  {
    id: "r9",
    title: "Riyadh KAFD — Structural BIM for Super-Tall Towers",
    type: "Case Study",
    summary: "Delivering LOD 500 structural models for three towers exceeding 300m — rebar detailing, connection design and as-built documentation under Saudi Aramco standards.",
    publishedAt: "2023-08-22",
    href: "/projects",
  },
];

const TYPES = ["All", "Case Study", "White Paper", "Guide", "Webinar"];

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
              <h2 className="text-xl font-extrabold text-sand-50">{RESOURCES.length} resources</h2>
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
          <h2 className="text-2xl font-extrabold text-sand-50">Want a custom BIM strategy session?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sand-200/70">
            Our team can run a free 30-minute discovery call to assess your project&apos;s BIM maturity and recommend a delivery approach.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-accent px-6 py-3 text-base">
              Book a discovery call <ArrowRight size={16} />
            </Link>
            <Link href="/capabilities" className="btn-outline border-sand-500/30 px-6 py-3 text-base text-sand-200 hover:bg-sand-500/10">
              View our capabilities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
