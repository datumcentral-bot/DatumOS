import Link from "next/link";
import { ArrowRight, Download, FileText, AlertCircle, PlayCircle } from "lucide-react";

// Every file listed here exists in /public/samples and is verified to open.
// Nothing in this list is a client project. Do not add an entry without
// checking the file is present and readable.

const SAMPLES = [
  {
    file: "demo-01-plumbing-drainage-layout",
    ref: "M-201",
    title: "Plumbing and Drainage — Level 02 Layout",
    discipline: "Plumbing & drainage",
    purpose:
      "Shows a soil stack with branch connections, a drainage schedule, and the fall notes a drawing set must carry.",
    scope: "One level, one stack, two branches, indicative sizes.",
    status: "Demonstration drawing",
  },
  {
    file: "demo-02-hvac-coordination",
    ref: "M-301",
    title: "HVAC Coordination — Supply Air Routing",
    discipline: "HVAC / mechanical",
    purpose:
      "Shows duct routing checked against a ceiling void limit, with the maintenance access clearance stated rather than assumed.",
    scope: "One level, supply air only, diffuser positions indicated.",
    status: "Demonstration drawing",
  },
  {
    file: "demo-03-electrical-containment",
    ref: "M-401",
    title: "Electrical Containment — Trays and Drops",
    discipline: "Electrical",
    purpose:
      "Shows tray routing, containment drops to distribution boards, and the schedule entries a containment drawing carries.",
    scope: "One level, containment only. No circuit design.",
    status: "Demonstration drawing",
  },
  {
    file: "demo-04-combined-builders-work-openings",
    ref: "M-501",
    title: "Combined Services and Builders' Work — Openings",
    discipline: "Combined services / builders' work",
    purpose:
      "Shows a composite plan with every service crossing, and the opening and sleeve schedule that goes with it.",
    scope: "Two openings coordinated from a resolved model, not from one drawing.",
    status: "Demonstration drawing",
  },
  {
    file: "demo-05-clash-issue-and-recheck",
    ref: "M-601",
    title: "Clash Issue and Recheck — CL-014",
    discipline: "Coordination / clash resolution",
    purpose:
      "Shows the full loop: detection, ownership, proposed change, approval before the model edit, correction, recheck, recorded closure.",
    scope: "One clash group, recorded end to end.",
    status: "Demonstration drawing",
  },
  {
    file: "demo-06-as-built-revision-record",
    ref: "M-701",
    title: "As-Built Revision Record",
    discipline: "As-built / handover",
    purpose:
      "Shows a site change reflected in the model and drawing, with the supersession of the previous revision recorded.",
    scope: "One authorised site instruction and its effect.",
    status: "Demonstration drawing",
  },
];

export const metadata = {
  title: "Sample Deliverables — MEP BIM Drawings",
  description:
    "Download demonstration MEP BIM drawing sheets from DATUM Studios: drainage layout, HVAC coordination, containment, openings, clash resolution and as-built revision records.",
};

export default function SamplesPage() {
  return (
    <div className="bg-hud-950">
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16 lg:py-20">
          <span className="eyebrow">Sample deliverables</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-sand-50 sm:text-5xl">
            Downloadable MEP BIM drawing sheets
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-sand-200/70">
            These are <strong className="text-sand-100">demonstration drawings we produced to show
            our drawing standard</strong> — not client projects and not completed commissions. Each
            sheet shares one coordinate system so the same grid references, tags and routes carry
            across the set, which is how we work.
          </p>

          <div className="mt-8 rounded-2xl border border-sand-400/30 bg-sand-500/[0.06] p-6">
            <h2 className="flex items-center gap-2 font-extrabold text-sand-50">
              <AlertCircle size={18} className="text-sand-400" />
              How to read these sheets
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-sand-200/80 sm:grid-cols-2">
              <li>Not for construction. Sizes and offsets are indicative for demonstration.</li>
              <li>Do not scale from these drawings.</li>
              <li>Every sheet is stamped DEMONSTRATION — NOT A CLIENT PROJECT.</li>
              <li>Client drawings are never published without written permission.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {SAMPLES.map((s) => (
            <article key={s.file} className="flex flex-col rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-sand-400">{s.ref}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-sand-50">{s.title}</h2>
                  <p className="mt-1 text-xs uppercase tracking-wider text-sand-300/70">{s.discipline}</p>
                </div>
                <span className="shrink-0 rounded-full border border-sand-500/25 px-3 py-1 text-[10px] uppercase tracking-wider text-sand-300">
                  {s.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-sand-200/80">{s.purpose}</p>
              <p className="mt-2 text-sm text-sand-300/70">
                <span className="font-semibold text-sand-300">Scope shown: </span>
                {s.scope}
              </p>

              <a
                href={`/samples/${s.file}.svg`}
                download={`${s.ref}-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.svg`}
                className="btn-accent mt-5 inline-flex items-center justify-center gap-2"
              >
                <Download size={15} /> Download sheet (SVG)
              </a>
              <a
                href={`/samples/${s.file}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sand-300/90 underline hover:text-sand-100"
              >
                <FileText size={13} /> Open the PNG preview
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* SERVICE INTRODUCTION VIDEO */}
      <section className="border-t border-hud-line/40 bg-hud-900/50 py-16">
        <div className="container-x">
          <span className="eyebrow">Service introduction</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50 sm:text-3xl">
            82 seconds on what we deliver
          </h2>
          <p className="mt-2 max-w-3xl text-sand-200/70">
            Caption-led, no voice-over. It covers modelling, coordination and clash resolution, shop
            drawings, builders&rsquo; work and QA, and as-built handover — and states plainly what we do
            not promise.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <video
                className="w-full rounded-2xl border border-sand-500/20 bg-black"
                width={1920}
                height={1080}
                controls
                preload="metadata"
                playsInline
                poster="/media/datum-mep-service-intro-thumbnail.png"
              >
                <source src="/media/datum-mep-service-intro.mp4" type="video/mp4" />
                {/* WebVTT is the only caption format a <track> element renders.
                    This previously pointed at the .srt file, which browsers
                    reject silently, so the captions never actually appeared
                    despite the track being present. The SRT is still offered
                    as a separate download below. */}
                <track
                  kind="captions"
                  src="/media/datum-mep-service-intro.vtt"
                  srcLang="en"
                  label="English"
                  default
                />
                Your browser cannot play this video. Download it instead:
                <a href="/media/datum-mep-service-intro.mp4">MP4</a>
              </video>
              <p className="mt-3 text-xs text-sand-300/60">
                H.264 MP4, 1920×1080, 82 seconds. Captions are supplied as a WebVTT
                track for in-player display; SRT and VTT files are both available
                to download.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/media/datum-mep-service-intro.mp4"
                download
                className="btn-accent w-full justify-center"
              >
                <Download size={15} /> Download MP4
              </a>
              <a
                href="/media/datum-mep-service-intro.vtt"
                download
                className="btn-outline w-full justify-center border-sand-500/30 text-sand-200 hover:bg-sand-500/10"
              >
                <FileText size={15} /> Download captions (VTT)
              </a>
              <a
                href="/media/datum-mep-service-intro.srt"
                download
                className="btn-outline w-full justify-center border-sand-500/30 text-sand-200 hover:bg-sand-500/10"
              >
                <FileText size={15} /> Download captions (SRT)
              </a>
              <div className="rounded-2xl border border-sand-500/15 bg-hud-950/60 p-5 text-sm text-sand-200/80">
                <p className="flex items-center gap-2 font-semibold text-sand-50">
                  <PlayCircle size={15} className="text-sand-400" />
                  What it does not claim
                </p>
                <ul className="mt-3 space-y-2 text-xs text-sand-300/75">
                  <li>No clash-free model is promised.</li>
                  <li>No design change is made without approval.</li>
                  <li>No client project, client name or figure is shown.</li>
                  <li>No screen recording of an unverified feature.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-hud-line/40 bg-hud-900/50 py-16">
        <div className="container-x rounded-2xl border border-sand-400/25 bg-sand-500/[0.05] p-8">
          <h2 className="text-2xl font-extrabold text-sand-50">Want the same standard on your project?</h2>
          <p className="mt-3 max-w-3xl text-sand-200/80">
            These sheets are the standard we work to. Send us the discipline, the drawings you hold
            and the date you need them, and we will come back with a written scope and a quotation.
            Most first engagements are a single discipline, a single floor, or a fixed number of
            drawings.
          </p>
          <Link href="/contact" className="btn-accent mt-6 inline-flex">
            Request a project quote <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}