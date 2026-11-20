import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "DATUM BIM — Engineering Consultancy",
  description: "DATUM BIM ENGINEERING CONSULTANCY — ISO 19650 compliant BIM solutions. Director console access.",
};

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-hud-950 text-sand-50 font-sans">
      {/* Navbar */}
      <nav className="border-b border-hud-line/50 bg-hud-950/80 backdrop-blur sticky top-0 z-50">
        <div className="container-x px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-olive-600 flex items-center justify-center text-sand-50 font-bold">D</div>
            <span className="text-xl font-extrabold tracking-tight">DATUM<span className="text-olive-400">BIM</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-sand-300/70">
            <Link href="/about" className="hover:text-sand-50 transition">About</Link>
            <Link href="/services" className="hover:text-sand-50 transition">Services</Link>
            <Link href="/projects" className="hover:text-sand-50 transition">Projects</Link>
            <Link href="/capabilities" className="hover:text-sand-50 transition">Capabilities</Link>
            <Link href="/contact" className="hover:text-sand-50 transition">Contact</Link>
          </div>
          <Link href="/director" className="bg-sand-50 text-hud-950 font-bold px-5 py-2 rounded hover:bg-sand-400 transition">
            Director Console
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-10" />
        <div className="container-x relative z-10 max-w-4xl text-center">
          <span className="inline-block px-3 py-1 rounded-full border border-olive-500/40 bg-olive-900/40 text-olive-400 text-xs font-bold uppercase tracking-wider mb-6">
            DATUM STUDIOS · ISO 19650
          </span>
          <h1 className="mt-4 max-w-2xl text-5xl font-extrabold tracking-tight sm:text-7xl">
            BIM Engineering<br />
            <span className="text-olive-400">Command Centre</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sand-200/70 leading-relaxed">
            ISO 19650 compliant Building Information Modeling consultancy. Director console access for project
            coordination, approvals, evidence, and enterprise lifecycle management.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/director"
              className="btn-primary bg-sand-50 text-hud-950 font-bold px-8 py-4 rounded text-lg shadow-lg hover:bg-sand-300 transition flex items-center justify-center gap-2"
            >
              Enter Director Console <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-hud-line/40 bg-hud-900 py-20">
        <div className="container-x">
          <span className="eyebrow text-center block mb-8">Platform capabilities</span>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Director Console", desc: "Full project oversight and approvals" },
              { label: "BIM Coordination", desc: "Clash detection and model review" },
              { label: "Client Portal", desc: "Client-specific project access" },
              { label: "Live Collaboration", desc: "Real-time meeting and chat rooms" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-sand-500/15 bg-sand-500/[0.03] p-6">
                <h3 className="text-lg font-bold text-sand-50">{f.label}</h3>
                <p className="mt-2 text-sm text-sand-200/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hud-950 py-24 text-center">
        <div className="container-x px-4">
          <h2 className="text-3xl font-extrabold text-sand-50 sm:text-4xl mb-6">Ready to start?</h2>
          <p className="text-lg text-sand-200/70 max-w-2xl mx-auto mb-8">
            Enter the Director console to manage projects, teams, and deliveries.
          </p>
          <Link
            href="/director"
            className="inline-block bg-olive-600 text-sand-50 font-bold px-8 py-3 rounded hover:bg-olive-500 transition"
          >
            Access Director Console
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hud-line/50 bg-hud-950 py-12">
        <div className="container-x px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-sand-400/60">
          <p>DATUM STUDIOS ENGINEERING CONSULTANCY &bull; ISO 19650</p>
          <p>Director access: /director</p>
        </div>
      </footer>
    </div>
  );
}
