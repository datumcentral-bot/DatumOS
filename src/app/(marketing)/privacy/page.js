import { SITE } from "@/lib/site";
import { Mail, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy",
  description:
    "How DATUM BIM ENGINEERING handles the personal information and project data you submit through this website.",
};

// This page describes only what this application actually does today:
// enquiry data is posted to /api/contact, stored in the studio's own CRM
// database, and used to reply. No third-party advertising or analytics
// trackers are embedded on the public pages.
export default function PrivacyPage() {
  return (
    <div className="bg-hud-950">
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16">
          <span className="eyebrow">Privacy</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">
            What happens to the information you send us
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            This page describes the enquiry and quote-request forms on this website. It does not
            describe the separate client portal, which has its own access controls.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x max-w-3xl space-y-10 text-sand-200/80">
          <section>
            <h2 className="text-xl font-extrabold text-sand-50">What we collect</h2>
            <p className="mt-3">
              When you submit the quote or enquiry form we receive the fields you fill in: your
              name, company, email address, phone or WhatsApp number, project country, the service
              and MEP disciplines you select, the approximate scope you describe, the input drawing
              formats you tell us about, any deadline you give, and your message.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-sand-50">Why we collect it</h2>
            <p className="mt-3">
              To assess your project, prepare a quotation, reply to you, and keep a record of the
              enquiry. We use it for no other purpose and we do not sell or share it with
              advertisers. There are no advertising or third-party analytics trackers embedded in
              these public pages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-sand-50">Where it is stored</h2>
            <p className="mt-3">
              Enquiries are written to our own project-management database and appear in the
              studio&apos;s internal pipeline. Access is restricted to the staff who need it to
              answer your enquiry. If you submit a WhatsApp or email draft instead, the message is
              handled by WhatsApp or your own mail provider, whose own privacy terms also apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-sand-50">How long we keep it</h2>
            <p className="mt-3">
              Enquiries that do not become projects are reviewed periodically and deleted when they
              are no longer needed. Enquiries that become projects are retained for the duration of
              the project and its contractual record-keeping obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-sand-50">Your choices</h2>
            <p className="mt-3">
              You can ask us to show you what we hold about you, correct it, or delete it. Contact us
              at{" "}
              <a href={`mailto:${SITE.email}`} className="text-sand-400 underline">
                {SITE.email}
              </a>{" "}
              or {SITE.phone}. We respond to enquiries within one business day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-sand-50">Project confidentiality</h2>
            <p className="mt-3 flex items-start gap-3">
              <ShieldCheck size={20} className="mt-1 shrink-0 text-sand-400" />
              <span>
                Drawings and models you send us for a quotation are treated as confidential. They
                are used only to assess and price your scope, and they are not published, reused or
                shown as a portfolio example unless you give written permission.
              </span>
            </p>
          </section>

          <section className="border-t border-sand-500/10 pt-8">
            <p className="flex items-center gap-2 text-sm text-sand-300/70">
              <Mail size={15} />
              Questions about this page?{" "}
              <a href={`mailto:${SITE.email}`} className="text-sand-400 underline">
                {SITE.email}
              </a>
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}