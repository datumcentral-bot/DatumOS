import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2, Boxes, Layers, Ruler, HardHat, ClipboardCheck, Archive, Calculator, Layers3, GitBranch, FileText } from "lucide-react";

export const metadata = {
  title: "MEP BIM Services — Modelling, Coordination, Clash Resolution & Shop Drawings",
  description:
    "DATUM Studios provides MEP BIM modelling, federated coordination, clash detection and resolution, BIM management, all MEP shop drawings, combined services and builders' work, QA/QC, as-built handover and model-based quantities. Powered by DatumBIM OS.",
};

// Section data is deliberately written as what is delivered and what is
// excluded, so a prospective client can see the boundary before enquiring.
const SECTIONS = [
  {
    id: "mep-modelling",
    letter: "A",
    icon: Boxes,
    title: "MEP BIM Modelling",
    summary:
      "3D models for mechanical piping, HVAC, electrical, plumbing and drainage, fire protection, ELV and fire alarm — built to a model requirement agreed before modelling starts.",
    inputs: [
      "Approved design information (drawings, calculations, schedules, specification)",
      "Client-agreed model requirements: accuracy, parameter set, level of detail, naming",
      "Discipline boundaries and responsibility matrix",
    ],
    outputs: [
      "Discipline models with agreed parameters and shared project standards",
      "Model views and exports for coordination and issue",
      "A recorded handover of models, together with the open-items list",
    ],
    qa: [
      "System and parameter check before every issue",
      "Naming, level and grid conformance check",
      "Model-versus-drawing consistency check",
    ],
    exclusions: [
      "Design certification, calculations and engineering sign-off are not part of modelling",
      "Accuracy beyond the agreed model requirement",
    ],
  },
  {
    id: "coordination",
    letter: "B",
    icon: Layers,
    title: "MEP Coordination",
    summary:
      "Federated review that resolves where services physically fight for the same space — not only where geometry overlaps, but where access and maintenance are impossible.",
    inputs: [
      "Discipline models and the latest architectural / structural models",
      "Agreed coordination zones, priority rules and tolerance settings",
      "Ceiling space, riser and plant constraints agreed with the design team",
    ],
    outputs: [
      "Federated review sessions and recorded coordination issues",
      "Mark-up proposals showing a route that resolves each issue",
      "Access and maintenance clearances checked against agreed dimensions",
    ],
    qa: [
      "Every issue is assigned to a responsible discipline",
      "Resolved issues are re-tested in the next run, not closed on sight",
    ],
    exclusions: [
      "We do not move or resize engineering design without the responsible party's approval",
      "Structural adequacy of any opening or penetration is not assessed by us",
    ],
  },
  {
    id: "clash",
    letter: "C",
    icon: GitBranch,
    title: "Clash Detection & Resolution",
    summary:
      "A repeatable process rather than a one-off test: agreed tests and tolerances, detection, grouping, ownership, proposal, approved correction, recheck, recorded closure.",
    inputs: ["Federated model", "Agreed test types and tolerances", "Named responsibility for each discipline"],
    outputs: [
      "Clash groups with an owner and a proposed resolution for each",
      "A record of the approved correction",
      "A recheck run showing the group closed",
    ],
    qa: [
      "Recheck after correction, not a claim that the model is clash-free",
      "Tolerance-blind tests are reported separately from hard clashes",
    ],
    exclusions: [
      "No '100% clash-free' guarantee — coordination quality depends on the information we are given",
      "Model changes are applied only after the responsible party approves them",
    ],
  },
  {
    id: "bim-management",
    letter: "D",
    icon: FileText,
    title: "BIM Management",
    summary:
      "The information-management layer: how the project is set up, who owns what, what is issued when, and how quality is recorded.",
    inputs: ["The project programme and information-release schedule", "The contract's information requirements", "Named client-side and contractor-side roles"],
    outputs: [
      "BIM Execution Plan support and agreed naming / status conventions",
      "Delivery planning, registers and review cadence",
      "Meeting structure, minutes and information-request tracking",
    ],
    qa: ["Information requests tracked to closure", "Issue status visible to all parties"],
    exclusions: [
      "We are not the approving authority on the contract",
      "Statutory approvals and authority submissions are excluded",
    ],
  },
  {
    id: "shop-drawings",
    letter: "E",
    icon: Ruler,
    title: "All MEP Shop Drawings",
    summary:
      "Shop drawings produced from your supplied approved design — the drawings a fabricator or installer can actually work from.",
    inputs: [
      "Supplied approved design — we do not originate the engineering design",
      "Drawing standards, templates and title block requirements",
      "Required sheet list and the discipline split",
    ],
    outputs: [
      "Discipline layout plans, sections, risers and agreed schematic diagrams",
      "Dimensions, levels, tags, equipment details and referenced schedules",
      "Composite plans where more than one discipline is involved",
    ],
    qa: [
      "Model, drawing and schedule checked against each other before issue",
      "Every drawing carries an issue and revision status",
    ],
    exclusions: [
      "Calculations, design certification and authority submissions are excluded",
      "Site surveys, fabrication and spool drawings require separate agreement",
    ],
  },
  {
    id: "combined-builders",
    letter: "F",
    icon: HardHat,
    title: "Combined Services & Builders' Work",
    summary:
      "The interface drawings that decide whether a building can actually be built — openings, sleeves and penetrations coordinated across trades.",
    inputs: ["Coordination-clash-free composite model", "Structural and architectural background information", "Builder's work and penetration schedules"],
    outputs: [
      "Composite plans and coordinated sections",
      "Opening, sleeve and penetration schedules with sizes and locations",
      "Builders' work plans, set-out details and plinth information",
    ],
    qa: ["Penetrations checked against the coordinated services layout before issue"],
    exclusions: [
      "Structural approval of every opening and penetration remains with the responsible party",
      "We do not certify that a penetration is structurally safe",
    ],
  },
  {
    id: "qa-qc",
    letter: "G",
    icon: ClipboardCheck,
    title: "MEP QA/QC",
    summary:
      "Independent checks on the model and drawing set before it leaves the studio, so problems are found here rather than on site.",
    inputs: ["The model and drawing set submitted for checking", "The agreed standard it must meet"],
    outputs: [
      "Consistency check across model, drawings and schedules",
      "Parameter, system, naming, level and grid checks",
      "Dimension and revision verification, with a returned issue list",
    ],
    qa: ["Every finding is traceable to a specific file, view or sheet"],
    exclusions: ["QA/QC checks conformance to the agreed standard, not design correctness"],
  },
  {
    id: "as-built",
    letter: "H",
    icon: Archive,
    title: "As-Built Models & Handover",
    summary:
      "Closing the loop: the model and drawings reflect what is actually on site, with the registers and data needed to operate the building.",
    inputs: ["Authorised redlines or verified site information", "Client and contractor as-built records", "Agreed asset data requirements"],
    outputs: [
      "Final models and drawings reflecting verified site conditions",
      "Registers, revision history and marked-up records",
      "Agreed asset data set for handover",
    ],
    qa: ["As-built updates are based on authorised information, not assumption"],
    exclusions: [
      "We do not verify site conditions ourselves unless site verification is in scope",
      "Operation and maintenance data is limited to what is supplied",
    ],
  },
  {
    id: "quantities",
    letter: "I",
    icon: Calculator,
    title: "Model-Based Quantities",
    summary:
      "Schedules and quantities taken from the model, always published with the measurement scope stated so they can be relied on or challenged.",
    inputs: ["The model and its agreed level of detail", "The measurement rules to be applied"],
    outputs: ["Model-based schedules and quantities", "A written statement of what the measurement covers"],
    qa: ["Measurement scope, exclusions and tolerances stated on the output"],
    exclusions: [
      "Quantities are not a bill of quantities and carry no commercial certification",
      "Wastage, labour and programme are not included",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-hud-950">
      {/* HEADER */}
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16 lg:py-20">
          <span className="eyebrow">DATUM Studios — MEP BIM Services</span>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight text-sand-50 sm:text-5xl">
            MEP modelling, coordination and shop drawings — with the boundaries written down
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-sand-200/70">
            We support contractors and consultants who need MEP models coordinated, clashes resolved
            and shop drawings produced from approved design. Every section below states what we need
            from you, what you receive, how it is checked, and what is not included.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-accent">
              Request a project quote <ArrowRight size={14} />
            </Link>
            <a href="#boundaries" className="btn-outline border-sand-500/30 text-sand-200 hover:bg-sand-500/10">
              Read the scope boundaries
            </a>
          </div>
        </div>
      </section>

      {/* DISCIPLINES */}
      <section className="py-14">
        <div className="container-x">
          <span className="eyebrow">Disciplines covered</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50">MEP scope we take on</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Mechanical piping",
              "HVAC & mechanical",
              "Electrical power & lighting",
              "Electrical containment",
              "Plumbing & drainage",
              "Fire protection",
              "ELV & fire alarm",
              "Builders' work",
            ].map((d) => (
              <span
                key={d}
                className="rounded-full border border-sand-500/25 bg-sand-500/[0.06] px-4 py-2 text-sm text-sand-200"
              >
                {d}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-sand-300/70">
            Discipline availability is arranged project by project. We confirm the team and the
            supervision arrangements in the quotation rather than implying every discipline is
            permanently in-house — see{" "}
            <a href="#boundaries" className="text-sand-400 underline">
              delivery boundaries
            </a>
            .
          </p>
        </div>
      </section>

      {/* SECTIONS A–I */}
      <section className="pb-16">
        <div className="container-x space-y-8">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-xl border border-sand-400/30 bg-sand-500/10 p-3">
                    <Icon size={22} className="text-sand-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand-400">
                      Section {s.letter}
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold text-sand-50">{s.title}</h2>
                    <p className="mt-3 max-w-3xl text-sand-200/80">{s.summary}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sand-300">
                      What we need from you
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {s.inputs.map((i) => (
                        <li key={i} className="flex gap-2 text-sm text-sand-200/80">
                          <span className="text-sand-400">→</span>
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sand-300">
                      What you receive
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {s.outputs.map((o) => (
                        <li key={o} className="flex gap-2 text-sm text-sand-200/80">
                          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-sand-400" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-sand-500/12 bg-hud-900/40 p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sand-300">
                      How it is checked
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {s.qa.map((q) => (
                        <li key={q} className="flex gap-2 text-sm text-sand-200/75">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sand-400" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-300">
                      <AlertCircle size={14} /> Not included unless agreed
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {s.exclusions.map((e) => (
                        <li key={e} className="flex gap-2 text-sm text-sand-200/75">
                          <span className="text-red-400">—</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* DELIVERY PROCESS */}
      <section className="border-t border-hud-line/40 bg-hud-900/50 py-16">
        <div className="container-x">
          <span className="eyebrow">How an engagement runs</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50">From enquiry to handover</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              { n: "01", t: "Enquiry", d: "You send the discipline, drawings you hold and the date you need them." },
              { n: "02", t: "Scope agreed", d: "We confirm inputs, deliverables, model requirements and the fee in writing." },
              { n: "03", t: "Production", d: "Modelling or drawings start against the agreed requirement." },
              { n: "04", t: "Coordination", d: "Issues are raised, owned, proposed, approved and rechecked." },
              { n: "05", t: "Issue & handover", d: "Checked deliverables are issued with registers and open items." },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border border-sand-500/15 bg-hud-950/60 p-5">
                <span className="font-mono text-xs text-sand-400">{s.n}</span>
                <h3 className="mt-2 font-bold text-sand-50">{s.t}</h3>
                <p className="mt-2 text-sm text-sand-200/75">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-sand-300/70">
            Revisions are handled against the revision policy stated in your quotation. Nothing in
            this page replaces the written agreement.
          </p>
        </div>
      </section>

      {/* DATUMBIM OS */}
      <section className="py-16">
        <div className="container-x">
          <div className="rounded-2xl border border-sand-400/25 bg-sand-500/[0.05] p-8">
            <span className="eyebrow">Supporting platform</span>
            <h2 className="mt-3 text-2xl font-extrabold text-sand-50">
              DatumBIM OS — the system our delivery is recorded in
            </h2>
            <p className="mt-4 max-w-3xl text-sand-200/80">
              DatumBIM OS is our own delivery and project-information platform. It is how the work
              on this site is tracked, reviewed and evidenced, rather than a claim about your
              project. The modules described below exist as working areas inside the platform used
              by our team.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: FileText, t: "Registers and revisions", d: "Drawing and document registers with issue and revision status recorded against each item." },
                { icon: GitBranch, t: "Coordination issues", d: "Each issue carries a description, an owner, a proposed resolution and a recorded closure after recheck." },
                { icon: ClipboardCheck, t: "QA records", d: "Check results are stored against the item checked, so a returned issue list can be evidenced rather than asserted." },
                { icon: Layers3, t: "Project status", d: "Milestones and deliverables are visible per project to the people working on it." },
                { icon: HardHat, t: "Client submissions", d: "Documents prepared for a client or authority are logged as submissions with their issue state." },
                { icon: Layers, t: "Review comments", d: "Review notes are attached to the item they concern instead of living in inboxes." },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.t} className="rounded-xl border border-sand-500/15 bg-hud-950/50 p-5">
                    <Icon size={20} className="text-sand-400" />
                    <h3 className="mt-3 font-bold text-sand-50">{m.t}</h3>
                    <p className="mt-2 text-sm text-sand-200/75">{m.d}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-sm text-sand-300/70">
              DatumBIM OS is used internally and is accessible only to authorised users. It is not
              a public tool and is not offered to clients as a licensed product. Ask us for a
              demonstration of any specific module.
            </p>
          </div>
        </div>
      </section>

      {/* BOUNDARIES */}
      <section id="boundaries" className="scroll-mt-24 border-t border-hud-line/40 bg-hud-900/50 py-16">
        <div className="container-x">
          <span className="eyebrow">Scope boundaries</span>
          <h2 className="mt-3 text-2xl font-extrabold text-sand-50">What needs separate agreement</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Shop drawings are produced from your supplied approved design. We do not originate or certify the engineering design.",
              "Engineering calculations, load sizing and design certification are excluded unless separately agreed.",
              "Authority or municipality submissions are excluded; we can prepare documentation, the submission decision is not ours.",
              "Site surveys, testing and commissioning are excluded unless separately agreed.",
              "Fabrication, shop-fabrication and spool drawings require separate agreement with the fabricator.",
              "Quantities are model-based and state their measurement scope. They are not a priced bill of quantities.",
              "Structural adequacy of openings, sleeves and penetrations remains with the responsible party.",
              "Discipline resourcing and supervision arrangements are confirmed per project in the quotation.",
            ].map((b) => (
              <div key={b} className="flex gap-3 rounded-xl border border-sand-500/15 bg-hud-950/50 p-5">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-sand-400" />
                <p className="text-sm text-sand-200/80">{b}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-sand-400/25 bg-sand-500/[0.05] p-8">
            <h2 className="text-2xl font-extrabold text-sand-50">Send one floor, one discipline or one drawing package</h2>
            <p className="mt-3 max-w-3xl text-sand-200/80">
              We are set up for limited, priced scopes as well as full packages. If you want to test
              the service, ask for a quote on a single discipline, a single floor, a defined area, or
              a defined number of drawings. That keeps the commitment small and the quality check
              straightforward.
            </p>
            <Link href="/contact" className="btn-accent mt-6 inline-flex">
              Request a quote <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}