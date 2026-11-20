"use client";

import { useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   Client journey explorer — the interactive half of /client-journey.

   Structure (in order on the page):
     1. Journey overview  — ten numbered stage buttons that jump into the
        detailed walkthrough below (they control the same tab panel).
     2. The journey step by step — WAI-ARIA tablist, ten stages, each with
        purpose / what you provide / what DATUM does / what you receive /
        platform-or-procedure / next step, a sanitised demonstration figure
        (stages 1-9) or an honest "no published screen" note (stage 10).
     3. Role walkthroughs — the four actual roles, rows in the order
        ACCESS > LANDING SCREEN > ACTIONS > HANDOFF > LIMITATIONS > LOGOUT
        > WHEN SOMETHING FAILS.

   Every screenshot referenced here was captured from the running platform by
   tools/journey-capture.mjs: real screens, sanitised demonstration content,
   verified against a deny-list of every person, company, project, e-mail and
   phone in the database (Evidence/client-journey/screenshot-manifest.txt).
   Each figure repeats the required caption in HTML text beside the image.

   Copy rules: British English; no prices, no turnaround promises, no claims
   about features that are not verified; unverified or client-invisible parts
   state the current manual procedure instead.
   ══════════════════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    title: "Enquiry",
    blurb: "What you send and the reference you get back.",
    img: "/journey/stage-01-enquiry.png",
    alt: "Enquiry form on the DATUM contact page with fields for name, e-mail, company, service and message",
    caption: "Enquiry form — demonstration screen.",
    purpose:
      "Open the engagement properly: your requirement is recorded, referenced and answered — not left in an inbox.",
    input:
      "Project location and type, the disciplines you need, what drawings or models you already hold, approximate size where relevant, the outputs you need, your programme and current project stage — plus how to reach you.",
    action:
      "DATUM records the enquiry in the platform as a lead with its own reference, reviews what you sent, and replies — asking clarifying questions first where the scope is unclear.",
    result:
      "Confirmation on screen with your enquiry reference, and a written reply from DATUM. Quote that reference in any follow-up so nothing is chased twice.",
    kind: "Platform function",
    where:
      "the enquiry and its reference are recorded in DatumBIM OS; the reply itself comes from DATUM by e-mail or WhatsApp.",
    next: "Scope and quotation.",
    notes: ["A reference is issued for every submitted enquiry."],
  },
  {
    title: "Scope and quotation",
    blurb: "Agreed deliverables, exclusions and terms — in writing.",
    img: "/journey/stage-02-scope.png",
    alt: "Request-a-quote form with fields for contact details, discipline, scope description and dates",
    caption: "Quote request form — demonstration screen.",
    purpose:
      "Agree exactly what will be delivered, what it does not include and on what terms — before any work starts.",
    input:
      "The discipline and deliverables you want, any exclusions, the revision allowance you expect, responsibilities on both sides, milestones, and any commercial points you need covered.",
    action:
      "DATUM reviews your input, clarifies the scope, and issues a written scope covering deliverables, exclusions, revision allowance, responsibilities, agreed milestones and commercial terms — together with a written quotation for that scope.",
    result:
      "A written scope and quotation you can read side by side with any alternative offer, with questions answered in writing before you commit.",
    kind: "Service procedure",
    where:
      "quotations are issued through DATUM's commercial process and accepted directly with DATUM; the platform logs the enquiry but does not issue prices or take payment.",
    next: "Once the scope and commercial terms are agreed, DATUM provisions your account.",
    notes: [
      "No fixed prices, delivery dates or guarantees are published here — every quotation is written for one specific scope, and any dates are agreed with you in writing.",
    ],
  },
  {
    title: "Account provisioning and login",
    blurb: "How your seat is created and how you sign in.",
    img: "/journey/stage-03-account.png",
    alt: "DatumBIM OS sign-in screen with e-mail and password fields and the initiate-session button",
    caption: "Sign-in screen — demonstration capture, no credentials shown.",
    purpose:
      "Give your organisation its own controlled access to the project records.",
    input:
      "Nothing to register or install: DATUM creates the seat for you. You only need the sign-in details DATUM sends you.",
    action:
      "A DATUM administrator creates your user manually, links it to your organisation's projects, and issues your sign-in details to you directly.",
    result:
      "You sign in at the Login page with your e-mail and password and land on the Command Hub, where your role decides which portals appear. Your seat sees your organisation's records only.",
    kind: "Platform function",
    where:
      "provisioning, role scoping and the Command Hub are all part of DatumBIM OS; issuing the sign-in details is done by DATUM.",
    next: "Project setup.",
    notes: [
      "There is no self-service registration and no password-reset e-mail: recovery is contacting DATUM through the confirmed details below, and an administrator restores your access.",
      "The demo role buttons on the login page only fill in the e-mail address — they do not create access. The password is issued by DATUM.",
      "Wrong credentials keep you on the login page with an access-denied message; sessions last 8 hours, and END SESSION signs you out immediately.",
    ],
  },
  {
    title: "Project setup",
    blurb: "Your project record, status and delivery team.",
    img: "/journey/stage-04-setup.png",
    alt: "Project portfolio screen showing project cards with codes, statuses and progress information",
    caption: "Project portfolio as DATUM's delivery team sees it — demonstration content.",
    purpose: "Create the single project record both sides work from.",
    input: "The agreed scope from stage 2, and a named point of contact on your side.",
    action:
      "DATUM creates the project record — reference, scope, deliverables and milestones — assigns the delivery team for each discipline, and links your organisation to it.",
    result:
      "The project appears on your dashboard with its status and progress, so you can follow the engagement from day one instead of waiting for update e-mails.",
    kind: "Platform function",
    where: "project records, team assignments and status live in DatumBIM OS.",
    next: "Information submission.",
    notes: [],
  },
  {
    title: "Information submission",
    blurb: "Drawings and models into one controlled register.",
    img: "/journey/stage-05-submission.png",
    alt: "Client documents screen listing shared documents with title, type, revision and status",
    caption: "Shared documents in the client portal — demonstration records.",
    purpose: "Put the source information under one controlled register.",
    input:
      "Design drawings, specifications, existing models, relevant schedules, coordination requirements, and the agreed naming and revision information.",
    action:
      "You upload through your portal's Documents screen, or use the agreed file-transfer route where that is arranged; DATUM registers each file against the project with a revision and a status.",
    result:
      "A shared document register both sides follow — one source of truth instead of competing e-mail attachments.",
    kind: "Platform function",
    where:
      "the register, revisions and statuses are platform functions; larger or manually handled transfers follow the transfer route agreed in your scope.",
    next: "MEP modelling and coordination.",
    notes: [
      "Uploads accept PDF, images, Office documents, ZIP archives and model files such as IFC, within the platform's configured 50 MB per-file limit.",
    ],
  },
  {
    title: "MEP modelling and coordination",
    blurb: "DATUM's modelling, clash review and open points.",
    img: "/journey/stage-06-coordination.png",
    alt: "BIM coordination register listing clash records with discipline, severity and status",
    caption: "Coordination register in the delivery workspace — demonstration records.",
    purpose:
      "Produce a coordinated model across every commissioned discipline before anything is issued.",
    input: "Your stage-5 information, plus answers to coordination queries as they arise.",
    action:
      "DATUM's modelling team builds the model in Revit for HVAC, electrical, plumbing and drainage, fire protection and ELV where commissioned; coordinates the disciplines, clash-checks the federation, and records every open point with an owner and a status until it is closed — including combined services and builders' work requirements.",
    result:
      "A coordinated model and closed-out coordination records. Your portal shows what belongs to you — shared documents, review status and meeting records — while the internal clash register stays with the delivery team.",
    kind: "Service procedure",
    where:
      "modelling and clash review happen in DATUM's Revit and Navisworks workflow; DatumBIM OS tracks the coordination records and every open point.",
    next: "Shop drawings and QA review.",
    notes: [
      "The platform does not design systems or remove clashes by itself — coordination is DATUM's work, tracked in the platform.",
      "Automated clash runs rely on the model-check integration being configured for the deployment; where it is not, clash checks are produced through the standard model-review workflow and issued to you as documents.",
    ],
  },
  {
    title: "Shop drawings and QA review",
    blurb: "Identified, checked drawings released through the register.",
    img: "/journey/stage-07-qa.png",
    alt: "Document control register listing drawings with document code, discipline, revision and approval status",
    caption: "Document control register — demonstration records.",
    purpose:
      "Turn the coordinated model into identified, checked, releasable drawing deliverables.",
    input: "Your standards and preferences from the agreed scope, and any comments from earlier review rounds.",
    action:
      "DATUM prepares the model-based drawings — plans, sections and details — runs the coordination checks agreed for the scope, and takes each drawing through review before release: every drawing carries a document code and a revision.",
    result:
      "Deliverables appear in the document register with their code, revision and status, so you can see at a glance what is issued, what is in review and what has been superseded.",
    kind: "Both",
    where:
      "drawing production and QA happen in DATUM's Revit/Navisworks workflow; identification, revision tracking and the release status are platform functions in the document register (CDE).",
    next: "Client review and revisions.",
    notes: [
      "Automated model-QA through the model-check integration is not demonstrated on this deployment; QA is performed through DATUM's standard review workflow.",
    ],
  },
  {
    title: "Client review and revisions",
    blurb: "Your comments, answered issues, tracked revisions.",
    img: "/journey/stage-08-review.png",
    alt: "Client dashboard showing the organisation's projects with progress and milestone information",
    caption: "Client dashboard — demonstration content.",
    purpose:
      "You check the work; comments are recorded, issues are answered, and revisions stay traceable.",
    input: "Review comments and decisions at each review round, through your named DATUM coordinator.",
    action:
      "DATUM records your feedback against the project, assigns and answers issues, updates revisions, and marks superseded work as superseded rather than overwriting it.",
    result:
      "Your dashboard and the shared document register show current revisions and status; meeting records capture the review discussion, so decisions are traceable either way.",
    kind: "Both",
    where:
      "the register, dashboard and meeting records are platform functions; feedback currently moves through your named coordinator, shared documents and meetings.",
    next: "Delivery.",
    notes: [
      "Formal client sign-off is maintained by DATUM's delivery team: the client-side approvals screen is still being finalised, so review feedback moves through shared documents, meetings and coordinator feedback — recorded against the project either way.",
      "No automated approval or automatic notification is claimed here: neither has been tested on this deployment.",
    ],
  },
  {
    title: "Delivery",
    blurb: "Issued deliverables with revisions and outstanding items.",
    img: "/journey/stage-09-delivery.png",
    alt: "Delivery workspace task board with columns for planned, in-progress, review and completed work",
    caption: "Delivery workspace — demonstration records.",
    purpose:
      "Issue the agreed deliverables with full traceability and a clear record of anything outstanding.",
    input: "Your confirmation of review or acceptance at the agreed review step.",
    action:
      "DATUM tracks each deliverable through review states on the delivery board — every item carries a revision, a status and a due date agreed with you. The delivered set is checked and issued through the shared document register in the formats agreed in your scope.",
    result:
      "The delivered set with its drawing/model register and revision identification, plus an honest list of any outstanding items rather than a silent gap.",
    kind: "Both",
    where:
      "review states, the register and the revision history are platform functions; the issue itself happens in the formats agreed in your scope.",
    next: "As-built and closure, where commissioned.",
    notes: [
      "Only formats actually agreed in your scope are issued — the delivery register shows exactly what was issued and at which revision.",
    ],
  },
  {
    title: "As-built and closure",
    blurb: "Final records and handover, where commissioned.",
    img: null,
    nofig:
      "Closure happens in DATUM's internal handover register and is confirmed to you in writing — there is no client-facing closure screen on this deployment yet, and we would rather say so than show you an unfinished screen.",
    purpose: "Record the final state of the works and close the engagement cleanly.",
    input:
      "Site-information inputs and the agreed as-built updates, where as-built services are commissioned.",
    action:
      "DATUM updates the records from reliable site information, prepares the final set, records the handover in the platform's handover register, and confirms closure to you.",
    result:
      "The final as-built set and written closure confirmation; your portal keeps the project history available to you afterwards.",
    kind: "Service procedure",
    where:
      "handover is recorded in DATUM's internal register with platform support; questions after closure go to your usual DATUM contact.",
    next: null,
    notes: [
      "As-built scope depends on what is commissioned and on reliable site information — no retention period or ongoing support is guaranteed on this page.",
    ],
  },
];

const ROLES = [
  {
    label: "Director",
    seat: "DATUM leadership seat (staff)",
    img: "/journey/role-console-director.png",
    alt: "Command hub listing the portals a Director seat can open, marked access scoped to Director clearance",
    caption: "Command hub with role-scoped portals — demonstration capture.",
    rows: [
      ["Access", "Created by a DATUM administrator — manual onboarding, never self-registered. A full-clearance staff seat covering the whole engagement."],
      ["Landing screen", "The Command Hub, which lists each portal together with the clearance your role carries."],
      ["Actions", "Delivery oversight end to end: projects and portfolio, assignments, coordination and QA review, teams, CRM, finance and platform administration — the whole engagement in one seat."],
      ["Handoff", "Work moves between delivery roles internally while this seat keeps sight of the entire engagement; deliverable release stays with this seat."],
      ["Limitations", "Nothing inside the platform is refused for this seat; platform administration itself sits behind DATUM's own controls."],
      ["Logout", "END SESSION ends the session; sessions also expire after 8 hours, so you sign in again after that."],
      ["When something fails", "Errors return a safe message with a reference code — pass that code to the platform administrator."],
    ],
  },
  {
    label: "Member",
    seat: "Delivery team seat (staff)",
    img: "/journey/role-console-member.png",
    alt: "Command hub listing the portals a Member seat can open, marked access scoped to Member clearance",
    caption: "Command hub with role-scoped portals — demonstration capture.",
    rows: [
      ["Access", "Created by a DATUM administrator and assigned to projects; the seat sees the work assigned to it, not the whole company."],
      ["Landing screen", "The Command Hub, then your workspace — the task board for everything assigned to you."],
      ["Actions", "Assigned-work functions: tasks and board, documents, coordination records, SOPs, meetings, knowledge base and timesheets — with reporting and review handoff to the next role."],
      ["Handoff", "Work is reassigned inside the task board; your DATUM coordinator remains your single point of contact."],
      ["Limitations", "Finance, settings, administration and other staff-only registers refuse this seat with an access message."],
      ["Logout", "END SESSION ends the session; sessions also expire after 8 hours, so you sign in again after that."],
      ["When something fails", "Errors return a safe message with a reference code — quote it to your coordinator."],
    ],
  },
  {
    label: "Revit",
    seat: "Modelling seat (staff)",
    img: "/journey/role-console-revit.png",
    alt: "Command hub listing the portals a Revit seat can open, marked access scoped to Revit clearance",
    caption: "Command hub with role-scoped portals — demonstration capture.",
    rows: [
      ["Access", "Created by a DATUM administrator for the modelling team."],
      ["Landing screen", "The Command Hub, then the D-Cortex control room for model work."],
      ["Actions", "Verified integration-related functions: model browser, elements, views and levels, sheets and schedules, family library, QA and model checks, clash tools and read-only assistant tools. The seat does not drive Revit or change the model automatically — modelling happens in DATUM's own Revit workflow."],
      ["Handoff", "Model issues are written to the coordination register so the delivery team can track them to closure."],
      ["Limitations", "Client financial, HR and administration records are refused for this seat."],
      ["Logout", "END SESSION ends the session; sessions also expire after 8 hours, so you sign in again after that."],
      ["When something fails", "Errors return a safe message with a reference code — quote it to your coordinator."],
    ],
  },
  {
    label: "Client",
    seat: "Your organisation's seat",
    img: "/journey/role-console-client.png",
    alt: "Command hub listing the portals a Client seat can open, marked access scoped to Client clearance",
    caption: "Command hub with role-scoped portals — demonstration capture.",
    rows: [
      ["Access", "DATUM creates your seat, links it to your organisation's projects and sends your sign-in details to you directly. The seat is scoped to your own organisation's records."],
      ["Landing screen", "The Command Hub, then your client dashboard — scoped to your organisation alone."],
      ["Actions", "Your projects and their progress, shared documents with their revisions and status, meetings, invoices issued to your organisation, the knowledge base and support requests — with review comments raised through your named coordinator."],
      ["Handoff", "Your named DATUM coordinator stays constant even when the delivery role changes internally."],
      ["Limitations", "Staff-only registers — finance, risks, settings, internal coordination — are refused, and you cannot reach another organisation's records. The client-side approvals screen is still being finalised, so formal review feedback moves through shared documents, meetings and your coordinator."],
      ["Logout", "END SESSION ends the session; sessions also expire after 8 hours, so you sign in again after that."],
      ["When something fails", "Errors return a safe message with a reference code — pass it to your coordinator so the record can be traced."],
    ],
  },
];

/* Shared roving-tab keyboard control (WAI-ARIA tabs pattern). */
function tabKey(event, index, count, apply) {
  let next = null;
  if (event.key === "ArrowRight") next = (index + 1) % count;
  else if (event.key === "ArrowLeft") next = (index - 1 + count) % count;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = count - 1;
  if (next === null) return;
  event.preventDefault();
  apply(next);
}

function Figure({ src, alt, caption }) {
  return (
    <figure className="cj-fig">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <figcaption>{caption} Demonstration — not a client project.</figcaption>
    </figure>
  );
}

export default function JourneyExplorer() {
  const stepRefs = useRef([]);
  const roleRefs = useRef([]);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(3); // Client — the seat a visitor holds

  /* Overview button: select the stage, move focus to its tab, scroll the
     detailed walkthrough into view (auto scroll when the visitor prefers
     reduced motion). */
  const jump = (i) => {
    setStep(i);
    stepRefs.current[i]?.focus();
    const target = document.getElementById("cj-steps-h");
    if (target) {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const facts = [
    ["Purpose", STEPS[step].purpose],
    ["What you provide", STEPS[step].input],
    ["What DATUM does", STEPS[step].action],
    ["What you receive", STEPS[step].result],
    ["Platform or procedure", null], // rendered specially below
    ["Next step", STEPS[step].next],
  ];

  return (
    <>
      {/* ── JOURNEY OVERVIEW ──────────────────────────────────────────── */}
      <section className="cj-section" aria-labelledby="cj-ov-h">
        <h2 className="cj-h2" id="cj-ov-h">The journey at a glance</h2>
        <p className="cj-h2sub">
          Ten stages from first enquiry to closure. Pick any stage to open its
          detailed explanation below — what you provide, what DATUM does, what
          you receive, and whether it runs in the platform or through our
          service procedure.
        </p>
        <div className="cj-ov">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              id={`cj-ov-${i}`}
              aria-controls="cj-step-panel"
              className="cj-ov-btn"
              onClick={() => jump(i)}
            >
              <b className="n" aria-hidden="true">{i + 1}</b>
              <span>
                <strong>{s.title}</strong>
                <em>{s.blurb}</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── STEPS ─────────────────────────────────────────────────────── */}
      <section className="cj-section" aria-labelledby="cj-steps-h">
        <h2 className="cj-h2" id="cj-steps-h">The journey, step by step</h2>
        <p className="cj-h2sub">
          Ten stages: enquiry, scope and quotation, account provisioning and
          login, project setup, information submission, MEP modelling and
          coordination, shop drawings and QA review, client review and
          revisions, delivery, then as-built and closure. Choose a step to see
          what happens, what you supply and what the screens actually look like.
        </p>

        <div className="cj-tabs" role="tablist" aria-label="Journey stages">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              id={`cj-step-tab-${i}`}
              aria-selected={step === i}
              aria-controls="cj-step-panel"
              tabIndex={step === i ? 0 : -1}
              className="cj-tab"
              onClick={() => setStep(i)}
              onKeyDown={(e) =>
                tabKey(e, step, STEPS.length, (n) => {
                  setStep(n);
                  stepRefs.current[n]?.focus();
                })
              }
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
            >
              <b>{i + 1}</b> {s.title}
            </button>
          ))}
        </div>

        <div
          className="cj-card cj-panel"
          role="tabpanel"
          id="cj-step-panel"
          aria-labelledby={`cj-step-tab-${step}`}
          tabIndex={0}
        >
          <div className="cj-grid">
            <div>
              <p className="cj-kicker">Step {step + 1} of {STEPS.length}</p>
              <h3 className="cj-step-title">{STEPS[step].title}</h3>
              <dl className="cj-rows">
                {facts.map(([k, v]) => {
                  if (k === "Platform or procedure") {
                    return (
                      <div className="cj-row" key={k}>
                        <dt>{k}</dt>
                        <dd>
                          <b>{STEPS[step].kind}.</b> {STEPS[step].where}
                        </dd>
                      </div>
                    );
                  }
                  if (!v) return null;
                  return (
                    <div className="cj-row" key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  );
                })}
              </dl>
              {STEPS[step].notes.length > 0 && (
                <div className="cj-notes">
                  {STEPS[step].notes.map((n, i) => (
                    <p key={i}>{n}</p>
                  ))}
                </div>
              )}
            </div>
            {STEPS[step].img ? (
              <Figure
                src={STEPS[step].img}
                alt={STEPS[step].alt}
                caption={STEPS[step].caption}
              />
            ) : (
              <div className="cj-nofig" role="note">
                <strong>No published screen for this stage.</strong>
                <p>{STEPS[step].nofig}</p>
              </div>
            )}
          </div>

          <div className="cj-controls">
            <button
              type="button"
              className="cj-btn"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              ← Previous step
            </button>
            <button
              type="button"
              className="cj-btn"
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
            >
              Next step →
            </button>
            <span className="cj-count" aria-live="polite">
              Step {step + 1} of {STEPS.length} — {STEPS[step].title}
            </span>
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────────────────── */}
      <section className="cj-section" aria-labelledby="cj-roles-h">
        <h2 className="cj-h2" id="cj-roles-h">Who does what — walkthrough for every role</h2>
        <p className="cj-h2sub">
          The platform supports four roles: Director, Member, Revit and Client.
          Pick one to see its access, landing screen, actions, handoff,
          limitations and logout — plus what happens if something fails. There is
          no fifth role, and no screen on this site promises one.
        </p>

        <div className="cj-tabs" role="tablist" aria-label="Portal roles">
          {ROLES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              role="tab"
              id={`cj-role-tab-${i}`}
              aria-selected={role === i}
              aria-controls="cj-role-panel"
              tabIndex={role === i ? 0 : -1}
              className="cj-tab"
              onClick={() => setRole(i)}
              onKeyDown={(e) =>
                tabKey(e, role, ROLES.length, (n) => {
                  setRole(n);
                  roleRefs.current[n]?.focus();
                })
              }
              ref={(el) => {
                roleRefs.current[i] = el;
              }}
            >
              <b>{r.label === "Client" ? "★" : "•"}</b> {r.label}
            </button>
          ))}
        </div>

        <div
          className={`cj-card cj-panel${role === 3 ? " cj-panel-you" : ""}`}
          role="tabpanel"
          id="cj-role-panel"
          aria-labelledby={`cj-role-tab-${role}`}
          tabIndex={0}
        >
          <div className="cj-grid">
            <div>
              <p className="cj-kicker">
                {role === 3 ? "This is your seat" : "Staff seat"}
              </p>
              <h3 className="cj-step-title">{ROLES[role].label}</h3>
              <p className="cj-seat">{ROLES[role].seat}</p>
              <dl className="cj-rows">
                {ROLES[role].rows.map(([k, v]) => (
                  <div className="cj-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Figure
              src={ROLES[role].img}
              alt={ROLES[role].alt}
              caption={ROLES[role].caption}
            />
          </div>
        </div>
      </section>
    </>
  );
}
