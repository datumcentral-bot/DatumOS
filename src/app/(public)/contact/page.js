import { ContactForm } from "./ContactForm";
import { SocialLinks } from "@/components/public";
import { QuoteForm } from "@/components/QuoteForm";
import { SITE, OFFICES } from "@/lib/site";
import { Mail, Phone, MapPin, Clock, MessageCircle, FileText } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Contact DATUM BIM ENGINEERING — info@datum-bim.com, +92 334 4063563. Head office Lahore, regional offices in Dubai, Karachi and Islamabad.",
};

export default function ContactPage() {
  return (
    <div className="bg-hud-950">
      <section className="border-b border-hud-line/50 bg-hud-900 bg-grid">
        <div className="container-x py-16">
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-sand-50 sm:text-5xl">
            Tell us about your project.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-200/70">
            Share scope, disciplines and timeline — we&apos;ll respond within one business day with a proposed scope
            and engagement model (project-based, dedicated team, or staff augmentation).
          </p>
        </div>
      </section>

      {/* TWO-COLUMN: Quote Form + Contact Details */}
      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          {/* Left: Get a Free Quote (QuoteForm from TSX) */}
          <div>
            <div className="mb-6 flex items-center gap-2">
              <FileText size={18} className="text-sand-400" />
              <h2 className="text-xl font-extrabold text-sand-50">Get a Free Quote</h2>
            </div>
            <div className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
              <QuoteForm />
            </div>
          </div>

          {/* Right: General enquiry + contact details */}
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-extrabold text-sand-50">General Enquiry</h2>
              <div className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <ContactForm />
              </div>
            </div>

            <div className="rounded-2xl border border-sand-500/15 bg-sand-500/[0.03] p-7">
              <h3 className="font-bold text-sand-50">Contact details</h3>
              <ul className="mt-5 space-y-4 text-sm text-sand-200/80">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-sand-400" />
                  <span>{SITE.addr}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-sand-400" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-sand-100">{SITE.email}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-sand-400" />
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-sand-100">{SITE.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle size={18} className="shrink-0 text-sand-400" />
                  <a href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-sand-100">WhatsApp · {SITE.whatsapp}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={18} className="shrink-0 text-sand-400" />
                  <span>Mon–Fri · Coverage across GMT / GST / EST timezones</span>
                </li>
              </ul>
              {OFFICES && OFFICES.length > 0 && (
                <div className="mt-6 border-t border-sand-500/10 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-300">Our offices</p>
                  <ul className="space-y-3 text-sm">
                    {OFFICES.map((o) => (
                      <li key={o.city} className="flex items-start gap-2 text-sand-200/70">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-sand-400" />
                        <span><span className="font-semibold text-sand-200">{o.city}</span> — {o.address}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 border-t border-sand-500/10 pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-300">Follow us</p>
                <SocialLinks size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}