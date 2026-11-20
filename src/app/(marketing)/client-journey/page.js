import Link from "next/link";
import JourneyExplorer from "@/components/JourneyExplorer";
import { SocialLinks } from "@/components/public";

/* ══════════════════════════════════════════════════════════════════════════
   /client-journey — public "How It Works" page (newly authorised feature,
   2026-10-10). White / navy / olive inside the scoped `.mk-light` theme.

   Honesty rules applied while writing this page:
   - No prices, no turnaround times, no guarantees that are not verified.
   - Unverified or client-invisible features state the current manual
     procedure instead of promising a screen (steps 7 and 9).
   - Every screenshot is sanitised demonstration content captured by
     tools/journey-capture.mjs and captioned "Demonstration — not a client
     project" in HTML text beside the image.
   - The platform is presented as the system DATUM works in; portal access is
     provided to clients as part of an engagement, never sold as software.
   ══════════════════════════════════════════════════════════════════════════ */

export const metadata = {
  title: "How It Works — Your Journey with DatumBIM OS",
  description:
    "See how your project moves from enquiry and scope agreement to coordination, review and delivery: the ten-stage client journey, the account and login guide, and what each DatumBIM OS portal role can see and do.",
};

const TOP_NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/samples", label: "Samples" },
  { href: "/client-journey", label: "How It Works", current: true },
  { href: "/contact", label: "Contact" },
];

const SUPPLY = [
  "Your enquiry: the service you need and how to reach you.",
  "The discipline, the drawings or models you hold, and the date you need the work by.",
  "Your organisation's information — drawings, models, briefs and mark-ups — through the portal or the agreed transfer route.",
  "Review comments and decisions at each review round, through your named coordinator.",
  "A named point of contact on your side, so questions and approvals do not get lost.",
];

const DATUM_DOES = [
  "Logs your enquiry against a reference and replies with a written scope and quotation.",
  "Creates your portal seat manually and links it to your organisation's projects.",
  "Sets up the project record: deliverables, milestones and the delivery team.",
  "Registers every document you share with a revision and a status.",
  "Models, coordinates, clash-checks and records every open point with an owner and a status.",
  "Tracks deliverables and revisions through review states, marks superseded work, and records the handover.",
];

const RECEIVE = [
  "A reference for your enquiry and a written scope with your quotation.",
  "Portal access for your organisation, scoped to your own projects only.",
  "A shared document register you can follow from day one — progress, meetings and documents in one place.",
  "Revision-controlled deliverables and the final as-built set at closure.",
  "Honest status at every stage: what is done, what is in review, what is next.",
];

const LOGIN_GUIDE = [
  ["Where you sign in", "The sign-in page at /login. Enter the e-mail address DATUM issued to you and your password, then select INITIATE SESSION."],
  ["Where you land", "A successful sign-in lands on the Command Hub (/console), where your role decides which portals appear."],
  ["Provisioning", "There is no self-service registration. DATUM creates your seat manually, links it to your organisation's projects, and sends your sign-in details to you directly."],
  ["Wrong credentials", "An incorrect e-mail or password keeps you on the sign-in page and shows an access-denied message; the page does not reveal which part was wrong."],
  ["Session expiry", "Sessions last 8 hours (as configured on this deployment), after which you sign in again. END SESSION signs you out immediately, and portal routes refuse access once signed out."],
  ["Recovery", "There is no password-reset e-mail. If you cannot sign in, contact DATUM at datumstuidos@gmail.com, +92 334 4063563 or WhatsApp, and an administrator restores your access and reissues your details."],
  ["Demo role buttons", "The role buttons under the sign-in form only fill in the e-mail address for you — they do not create access or open a session. Passwords are issued by DATUM."],
];

const FAQ = [
  ["Do we have to buy DatumBIM OS?", "No. The platform supports DATUM's own project delivery and information workflow. Commissioning our services never requires purchasing software — your organisation receives portal access as part of the engagement."],
  ["What should we send first?", "The discipline you need, what drawings or models you already hold, the outputs you require, your programme and current project stage — plus how to reach you. Stage 1 above lists the full set."],
  ["How do we get an account?", "DATUM provisions it manually after the scope is agreed: an administrator creates your seat, links it to your organisation's projects and sends your sign-in details. There is no sign-up form."],
  ["We have forgotten our password — what now?", "Contact DATUM through the details at the bottom of this page. There is no automated reset e-mail on this deployment; an administrator restores your access."],
  ["Can we see other clients' projects?", "No. Seats are scoped to your organisation's records only, and staff-only registers are refused for client seats — access is checked on every request, not just hidden in the interface."],
  ["Are these screenshots real client projects?", "No. Every image on this page is demonstration content, labelled “Demonstration — not a client project”, captured from the real screens with names and details replaced."],
  ["Do you guarantee turnaround or zero clashes?", "No — no fixed dates or clash guarantees are published. Your written scope states the deliverables, revision allowance and milestones you have agreed, and coordination points are tracked with owners until closed."],
  ["How do we review and approve work?", "Through your named coordinator, the shared document register and meetings — all recorded against the project. Formal sign-off is maintained by DATUM's delivery team while the client-side approvals screen is being finalised."],
  ["How do we contact you?", "datumstuidos@gmail.com, +92 334 4063563, or WhatsApp on +92 334 4063563 — all confirmed channels, listed at the bottom of this page."],
];

const LINK_CARDS = [
  {
    href: "/services",
    title: "Services",
    blurb:
      "Modelling, coordination, shop drawings, laser scanning and staffing — the disciplines we deliver against the journey above.",
    cta: "See what we deliver →",
  },
  {
    href: "/samples",
    title: "Samples",
    blurb:
      "Downloadable demonstration drawing sheets: drainage, HVAC, containment, openings, clash resolution and as-built records.",
    cta: "Open the sample sheets →",
  },
  {
    href: "/contact",
    title: "Request a Quote",
    blurb:
      "Tell us the discipline, what you hold and the date you need — you get a written scope and a written quotation back.",
    cta: "Start with an enquiry →",
  },
];

export default function ClientJourneyPage() {
  return (
    <div className="mk-light cj">
      {/* ── TOP BAR ── */}
      <header className="cj-top">
        <div className="cj-top-in">
          <Link href="/" className="cj-brand" aria-label="DATUM Studios — home">
            <span className="cj-brand-mark" aria-hidden="true">
              <img src="/brand/datum-bim-logo-light.png" alt="" width={18} height={24} />
            </span>
            <span className="cj-word">
              <b>DATUM</b>
              <span>STUDIOS</span>
            </span>
          </Link>
          <nav className="cj-nav" aria-label="Site">
            {TOP_NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={n.current ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
            <Link href="/contact" className="cj-cta">
              Request a Quote
            </Link>
          </nav>
        </div>
      </header>

      <main className="cj-main">
        {/* ── HERO ── */}
        <section className="cj-hero" aria-labelledby="cj-h1">
          <span className="cj-eyebrow">How it works</span>
          <h1 id="cj-h1">Your Journey with DatumBIM OS</h1>
          <p className="cj-lead">
            See how your project moves from enquiry and scope agreement to coordination, review
            and delivery
          </p>
          <p className="cj-sub">
            DatumBIM OS is the platform DATUM&rsquo;s own team works in: the same project
            records, document register and coordination trail you see on this page are what we
            use internally. It supports our workflow — it is not software you are asked to buy.
            When DATUM sets up your project, your organisation simply receives portal access as
            part of the engagement. Below is that journey, step by step, with the actual screens
            and a walkthrough for every role the platform supports.
          </p>
          <div className="cj-hero-cta">
            <Link href="/contact" className="cj-btn cj-cta-solid">
              Request a Quote
            </Link>
            <Link href="/samples" className="cj-btn cj-cta-ghost">
              View Demonstration Samples
            </Link>
          </div>
        </section>

        {/* ── INTERACTIVE STEPS + ROLE TABS ── */}
        <JourneyExplorer />

        {/* ── ACCOUNT AND LOGIN GUIDE ── */}
        <section className="cj-section" aria-labelledby="cj-login-h">
          <h2 className="cj-h2" id="cj-login-h">Your account and how you sign in</h2>
          <p className="cj-h2sub">
            The actual sign-in process on this deployment — described exactly as it behaves,
            with nothing added that does not exist.
          </p>
          <div className="cj-card">
            <dl className="cj-rows">
              {LOGIN_GUIDE.map(([k, v]) => (
                <div className="cj-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── WHAT MOVES EACH WAY ── */}
        <section className="cj-section" aria-labelledby="cj-exchange-h">
          <h2 className="cj-h2" id="cj-exchange-h">
            What you supply, what DATUM does, what you receive
          </h2>
          <p className="cj-h2sub">
            The whole journey in three columns. If a stage is not on this list, ask us about it
            before you commit — we would rather clarify than improvise.
          </p>
          <div className="cj-cols">
            <div className="cj-col">
              <h3>What you supply</h3>
              <ul>
                {SUPPLY.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="cj-col">
              <h3>What DATUM does</h3>
              <ul>
                {DATUM_DOES.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="cj-col">
              <h3>What you receive</h3>
              <ul>
                {RECEIVE.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FREQUENT QUESTIONS ── */}
        <section className="cj-section" aria-labelledby="cj-faq-h">
          <h2 className="cj-h2" id="cj-faq-h">Frequent questions</h2>
          <p className="cj-h2sub">
            Practical answers drawn from how the platform actually behaves — if a question is
            not answered here, ask us before you commit.
          </p>
          <div className="cj-faq">
            {FAQ.map(([q, a]) => (
              <div className="cj-faq-item" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── LINKS ── */}
        <section className="cj-section" aria-labelledby="cj-links-h">
          <h2 className="cj-h2" id="cj-links-h">See the work behind the journey</h2>
          <p className="cj-h2sub">
            Services show what we deliver, Samples show the standard we deliver at, and the
            quote form is where the journey above begins.
          </p>
          <div className="cj-links">
            {LINK_CARDS.map((c) => (
              <Link key={c.href} href={c.href} className="cj-link">
                <b>{c.title}</b>
                <span>{c.blurb}</span>
                <em>{c.cta}</em>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CONTACT AND ENQUIRY CTA ── */}
        <section className="cj-section" aria-labelledby="cj-contact-h">
          <h2 className="cj-h2" id="cj-contact-h">Start the journey</h2>
          <p className="cj-h2sub">
            Every engagement begins with an enquiry. Use whichever confirmed channel suits you
            — or start with the quote form.
          </p>
          <div className="cj-card cj-contact">
            <div className="cj-contact-links">
              <a href="mailto:datumstuidos@gmail.com">datumstuidos@gmail.com</a>
              <a href="tel:+923344063563">+92 334 4063563</a>
              <a
                href="https://wa.me/923344063563"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp +92 334 4063563
              </a>
            </div>
            <Link href="/contact" className="cj-btn cj-cta-solid">
              Request a Quote
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="cj-foot">
        <div className="cj-foot-in">
          <p>
            Questions about your project or your portal seat?{" "}
            <a href="mailto:datumstuidos@gmail.com">datumstuidos@gmail.com</a> ·{" "}
            <a
              href="https://wa.me/923344063563"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp +92 334 4063563
            </a>
          </p>
          <SocialLinks tone="dark" />
        </div>
      </footer>
    </div>
  );
}
