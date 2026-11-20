import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hud-950 px-4 py-20 text-center">
      {/* HUD decorative corners */}
      <div className="relative w-full max-w-lg">
        <div className="absolute -left-4 -top-4 h-8 w-8 border-l-2 border-t-2 border-sand-500/40" />
        <div className="absolute -right-4 -top-4 h-8 w-8 border-r-2 border-t-2 border-sand-500/40" />
        <div className="absolute -bottom-4 -left-4 h-8 w-8 border-b-2 border-l-2 border-sand-500/40" />
        <div className="absolute -bottom-4 -right-4 h-8 w-8 border-b-2 border-r-2 border-sand-500/40" />

        <div className="rounded-2xl border border-hud-line/50 bg-hud-900 p-10">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10">
            <AlertTriangle size={28} className="text-red-400" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.28em] text-sand-400">Error 404</p>
          <h1 className="mt-3 text-3xl font-extrabold text-sand-50 sm:text-4xl">Page not found</h1>
          <p className="mt-4 text-sand-200/60">
            The BIM page you requested does not exist or has been moved. Check the URL or navigate back to a known location.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="btn-accent px-5 py-2.5">
              <Home size={16} /> Return home
            </Link>
            <Link href="/services" className="btn-outline border-sand-500/30 px-5 py-2.5 text-sand-200 hover:bg-sand-500/10">
              <Search size={16} /> Browse services
            </Link>
          </div>

          <div className="mt-8 border-t border-hud-line/40 pt-6">
            <p className="text-xs text-sand-300/40 stencil">DATUM BIM ENGINEERING · ISO 19650 · DatumOS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
