"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { cn } from "../lib/cn";
import { PUBLIC_NAV, SOCIALS, SITE, SERVICES } from "@/lib/site";
import { Linkedin, Instagram, Facebook, Youtube, Twitter, Menu, X, Share2, Link2, Mail, Phone, MapPin, Search, ArrowRight } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import UserMenu from "./UserMenu";

const ICONS = { linkedin: Linkedin, instagram: Instagram, facebook: Facebook, youtube: Youtube, x: Twitter };

// Search index built from static site data
const SEARCH_INDEX = [
  ...SERVICES.map((s) => ({ id: s.code, title: s.name, type: "Service", href: `/services#${s.code.toLowerCase()}`, summary: s.blurb || s.tagline })),
  { id: "about", title: "About DATUM BIM Engineering", type: "Page", href: "/about", summary: "Company background, mission, vision and BIM delivery values." },
  { id: "projects", title: "Projects & Portfolio", type: "Page", href: "/projects", summary: "Landmark BIM projects delivered across 30+ countries." },
  { id: "capabilities", title: "BIM Capabilities & LOD", type: "Page", href: "/capabilities", summary: "LOD 100–500, QA/QC checklist, ISO 19650 delivery process." },
  { id: "careers", title: "Careers", type: "Page", href: "/careers", summary: "Join the DATUM BIM team — open roles in BIM, engineering and coordination." },
  { id: "contact", title: "Contact & Get a Quote", type: "Page", href: "/contact", summary: "Request a BIM, laser scanning or staffing consultation." },
  { id: "resources", title: "Resources & Insights", type: "Page", href: "/resources", summary: "Case studies, white papers and BIM guides." },
  { id: "group", title: "Datum Group", type: "Page", href: "/group", summary: "The Datum Group of companies — Initiative, Central, Capabilities, Developments, Holdings, Productions, Stores." },
];

export function SocialLinks({ className, size = 18, tone = "light" }) {
  const base =
    tone === "light"
      ? "text-sand-200/70 hover:text-sand-100 hover:bg-sand-500/10"
      : "text-olive-600 hover:text-olive-900 hover:bg-olive-100";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {SOCIALS.map((s) => {
        const Icon = ICONS[s.key] || Link2;
        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={cn("grid h-9 w-9 place-items-center rounded-lg border border-transparent transition-colors", base)}
          >
            <Icon size={size} />
          </a>
        );
      })}
    </div>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const filtered = search.trim()
    ? SEARCH_INDEX.filter((item) =>
        `${item.title} ${item.summary} ${item.type}`.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-hud-line/50 bg-hud-900/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Logo light size={34} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(n.href) ? "bg-sand-500/15 text-sand-100" : "text-sand-200/70 hover:bg-sand-500/10 hover:text-sand-100"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right: search + CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Search */}
          <div className="relative">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-hud-line/60 bg-hud-800 px-3">
              <Search size={14} className="text-sand-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                placeholder="Search BIM services…"
                className="w-44 bg-transparent text-sm text-sand-100 placeholder-sand-400/50 outline-none"
              />
            </div>
            {searchOpen && filtered.length > 0 && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-hud-line/60 bg-hud-900 p-2 shadow-xl">
                {filtered.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setSearch("")}
                    className="block rounded-lg p-3 hover:bg-hud-800"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sand-400">{item.type}</p>
                    <p className="font-bold text-sand-100 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-sand-300/60 line-clamp-2">{item.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <SocialLinks size={15} />

          <Link href="/contact" className="btn-accent text-sm">
            Get Quote <ArrowRight size={14} />
          </Link>

          {/* Show user menu if logged in, otherwise show Login link */}
          <UserMenu compact />
        </div>

        {/* Mobile menu toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-sand-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-hud-line/50 bg-hud-900 px-5 py-3 lg:hidden">
          {/* Mobile search */}
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-hud-line/60 bg-hud-800 px-3 py-2">
            <Search size={14} className="text-sand-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm text-sand-100 placeholder-sand-400/50 outline-none"
            />
          </div>
          {filtered.length > 0 && (
            <div className="mb-3 rounded-xl border border-hud-line/50 bg-hud-800 p-2">
              {filtered.map((item) => (
                <Link key={item.id} href={item.href} onClick={() => { setOpen(false); setSearch(""); }} className="block rounded-lg p-2 hover:bg-hud-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sand-400">{item.type}</p>
                  <p className="text-sm font-bold text-sand-100">{item.title}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {PUBLIC_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold",
                  isActive(n.href) ? "bg-sand-500/15 text-sand-100" : "text-sand-200/70 hover:bg-sand-500/10"
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="btn-accent mt-2 justify-center">
              Get Quote <ArrowRight size={14} />
            </Link>
            <Link href="/console" onClick={() => setOpen(false)} className="mt-1 rounded-lg border border-hud-line/60 px-3 py-2 text-center text-sm font-semibold text-sand-200/70 hover:bg-hud-800">
              Client Login
            </Link>
            <SocialLinks size={16} className="mt-3" />
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hud-line/50 bg-hud-950 text-sand-200/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + socials */}
        <div className="lg:col-span-1">
          <Logo light size={38} />
          <p className="mt-4 max-w-xs text-sm text-sand-200/60 leading-6">
            {SITE.tagline}. A global building-design production partner delivering ISO 19650-compliant BIM and
            multidisciplinary engineering from {SITE.city}.
          </p>
          <SocialLinks size={18} className="mt-5" />
        </div>

        {/* Services list */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-300">Our Services</p>
          <ul className="space-y-2 text-sm">
            {SERVICES.slice(0, 7).map((s) => (
              <li key={s.code}>
                <Link href={`/services#${s.code.toLowerCase()}`} className="text-sand-200/60 hover:text-sand-100 transition-colors">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-300">Quick Links</p>
          <ul className="space-y-2 text-sm">
            {PUBLIC_NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-sand-200/60 hover:text-sand-100 transition-colors">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/resources" className="text-sand-200/60 hover:text-sand-100 transition-colors">Resources</Link>
            </li>
            <li>
              <Link href="/console" className="text-sand-200/60 hover:text-sand-100 transition-colors">Portals & Login</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter + contact */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-300">Newsletter</p>
          <p className="mb-3 text-sm text-sand-200/60 leading-6">
            Subscribe for BIM, scanning, VDC and digital construction updates.
          </p>
          <NewsletterForm />

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-300">Contact</p>
            <ul className="space-y-2.5 text-sm text-sand-200/60">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-sand-400" />
                <span>{SITE.addr}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-sand-400" />
                <a href={`mailto:${SITE.email}`} className="hover:text-sand-100 transition-colors">{SITE.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-sand-400" />
                <a href={`tel:${SITE.phone}`} className="hover:text-sand-100 transition-colors">{SITE.phone}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-hud-line/40">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-sand-300/50 sm:flex-row">
          <p>© {year} {SITE.name} Engineering Consultancy. All rights reserved.</p>
          <p className="stencil">ISO 19650 · BIM Level 2 · Global Delivery</p>
        </div>
      </div>
    </footer>
  );
}

// Social share buttons for content pages (project details etc.)
export function ShareButtons({ title = "Datum Studios", tone = "dark" }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "https://datumstudios.co";
  const enc = encodeURIComponent(url);
  const encT = encodeURIComponent(title);
  const targets = [
    { key: "linkedin", label: "LinkedIn", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
    { key: "facebook", label: "Facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { key: "x", label: "X", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc}&text=${encT}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const chip =
    tone === "dark"
      ? "border-olive-300 text-olive-700 hover:bg-olive-100"
      : "border-sand-500/30 text-sand-200 hover:bg-sand-500/10";
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-olive-600">
        <Share2 size={14} /> Share
      </span>
      {targets.map((t) => (
        <a
          key={t.key}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${t.label}`}
          className={cn("grid h-8 w-8 place-items-center rounded-lg border transition-colors", chip)}
        >
          <t.Icon size={15} />
        </a>
      ))}
      <button onClick={copy} className={cn("grid h-8 w-8 place-items-center rounded-lg border transition-colors", chip)} aria-label="Copy link">
        <Link2 size={15} />
      </button>
      {copied && <span className="text-xs font-semibold text-health-green">Copied!</span>}
    </div>
  );
}