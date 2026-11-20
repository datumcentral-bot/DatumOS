'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  SITE, STATS, OFFICES, SOCIALS, SECTORS, PORTFOLIO, TEAM, PRODUCTS, SOFTWARE,
  CERTS, VALUES, ASSURANCE, LOD_LEVELS, BIM_PROCESS, ENGAGEMENT, ADVANCED_MODULES,
  SERVICE_GROUPS, SERVICES as DISCIPLINES,
} from '@/lib/site';
import { QuoteForm } from '@/components/QuoteForm';

/* ══════════════════════════════════════════════════════════════════════════
   MONOCHROME VECTOR ICON SET
   Single-colour, stroke-based, 24x24 grid, 1.5 stroke. currentColor only, so
   every glyph inherits the existing olive / gold / sand palette. No emoji.
   ══════════════════════════════════════════════════════════════════════════ */
const ICONS = {
  hex: <><path d="M12 2.4 21 7.3v9.4L12 21.6 3 16.7V7.3L12 2.4Z" /><path d="M12 8.2 16.6 10.6v4.8L12 17.8 7.4 15.4v-4.8L12 8.2Z" /></>,
  coord: <><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><path d="M7 6h10M6.4 7.7l4.3 8.5M17.6 7.7l-4.3 8.5" /></>,
  struct: <><path d="M3 20.5h18M6.5 20.5V9L12 5l5.5 4v11.5M6.5 13.5h11M6.5 17h11M12 5v15.5" /></>,
  mep: <><path d="M3 7h6a3 3 0 1 0-3-3M3 11.5h13a3 3 0 1 1-3 3M3 17.5h9" /></>,
  arch: <><path d="M4 21V8l8-5 8 5v13M3 21h18M9.5 21v-6h5v6M8 10.5h8" /></>,
  compliance: <><path d="M9 3h6v3.5H9zM15 4.8h3a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.8a1 1 0 0 1 1-1h3" /><path d="m8.6 12.6 2.2 2.2 4.4-4.4" /></>,
  ai: <><rect x="7.5" y="7.5" width="9" height="9" rx="1" /><path d="M10 3v4.5M14 3v4.5M10 16.5V21M14 16.5V21M3 10h4.5M3 14h4.5M16.5 10H21M16.5 14H21" /></>,
  pin: <><path d="M12 21.2s7-5.7 7-11.2a7 7 0 1 0-14 0c0 5.5 7 11.2 7 11.2Z" /><circle cx="12" cy="10" r="2.6" /></>,
  trophy: <><path d="M7 3.5h10V9a5 5 0 0 1-10 0V3.5Z" /><path d="M7 5.5H4.6A2.4 2.4 0 0 0 7 10.4M17 5.5h2.4A2.4 2.4 0 0 1 17 10.4" /><path d="M12 14v3.2M9.2 20.5h5.6M10 17.2h4" /></>,
  shield: <><path d="M12 2.8 19 5.6v6.1c0 4.2-2.9 7.9-7 9.1-4.1-1.2-7-4.9-7-9.1V5.6l7-2.8Z" /><path d="m9 11.8 2.2 2.2 4.3-4.3" /></>,
  globe: <><circle cx="12" cy="12" r="8.8" /><path d="M3.2 12h17.6" /><path d="M12 3.2c2.5 2.6 3.8 5.6 3.8 8.8s-1.3 6.2-3.8 8.8c-2.5-2.6-3.8-5.6-3.8-8.8S9.5 5.8 12 3.2Z" /></>,
  bolt: <path d="M13.2 2.5 4.8 13.6H11l-.9 7.9 8.4-11.1H12l1.2-7.9Z" />,
  check: <><circle cx="12" cy="12" r="8.8" /><path d="m8.2 12.3 2.5 2.5 5.1-5.1" /></>,
  alert: <><path d="M12 3.4 21.8 20.4H2.2L12 3.4Z" /><path d="M12 10v4.6M12 17.6v.01" /></>,
  close: <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  phone: <path d="M4 5.2c0-.7.5-1.2 1.2-1.2h2.9l1.9 4.7-2.4 1.4a12.2 12.2 0 0 0 6.1 6.1l1.4-2.4 4.7 1.9v2.9c0 .7-.5 1.2-1.2 1.2A16.2 16.2 0 0 1 4 5.2Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1.2" /><path d="m3.6 6.4 8.4 6.4 8.4-6.4" /></>,
  chat: <><path d="M20.4 11.7a8.2 8.2 0 0 1-12.1 7L4 20.2l1.5-4.2a8.2 8.2 0 1 1 14.9-4.3Z" /><path d="M9.2 9.4c.3 2.9 2.3 4.9 5.2 5.2" /></>,
  linkedin: <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="2" /><path d="M7.6 10.6v6.2M7.6 7.4v.01M11.4 16.8v-6.2M11.4 13.4a2 2 0 0 1 4 0v3.4" /></>,
  instagram: <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.4 6.6v.01" /></>,
  youtube: <><rect x="2.6" y="5.4" width="18.8" height="13.2" rx="4" /><path d="m10.4 9.4 5 2.6-5 2.6V9.4Z" /></>,
  xsocial: <path d="m4.4 4.4 15.2 15.2M19.6 4.4 4.4 19.6" />,
  facebook: <path d="M13.6 21v-8.2h2.8l.5-3.2h-3.3V7.6c0-.9.3-1.6 1.6-1.6h1.8V3.1c-.6-.1-1.3-.1-2-.1-2.6 0-4.4 1.6-4.4 4.5v2.1H7.2v3.2h2.8V21h3.6Z" />,
  ruler: <><rect x="2.4" y="8" width="19.2" height="8" rx="1" /><path d="M7 8v3.2M11 8v4.4M15 8v3.2M19 8v4.4" /></>,
  layers: <><path d="m12 2.8 9 5-9 5-9-5 9-5Z" /><path d="m3.6 12.4 8.4 4.7 8.4-4.7M3.6 16.6 12 21.3l8.4-4.7" /></>,
  clock: <><circle cx="12" cy="12" r="8.8" /><path d="M12 6.4V12l3.6 2.5" /></>,
  merge: <><circle cx="7" cy="5.2" r="2.1" /><circle cx="7" cy="18.8" r="2.1" /><circle cx="17" cy="12" r="2.1" /><path d="M7 7.3v9.4M9.1 5.7 15.1 11M9.1 18.3l6-5.3" /></>,
  badge: <><path d="m12 2.6 2.4 1.9 3-.4 1 2.9 2.6 1.6-1 2.9 1 2.9-2.6 1.6-1 2.9-3-.4-2.4 1.9-2.4-1.9-3 .4-1-2.9L2.9 12l1-2.9-1-2.9 2.6-1.6 1-2.9 3 .4L12 2.6Z" /><path d="m9.1 12 2.2 2.2 4.3-4.3" /></>,
  lock: <><rect x="4.6" y="10.4" width="14.8" height="10.2" rx="1.2" /><path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8" /><path d="M12 14.4v2.4" /></>,
  database: <><ellipse cx="12" cy="6" rx="7.6" ry="3" /><path d="M4.4 6v12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V6M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3" /></>,
  compass: <><circle cx="12" cy="12" r="8.8" /><path d="m15.6 8.4-2.1 5.6-5.6 2.1 2.1-5.6 5.6-2.1Z" /></>,
  boxes: <><path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z" /><path d="m3.8 7.4 8.2 4.6 8.2-4.6M12 12v9.2" /></>,
  workflow: <><rect x="3" y="3" width="6.2" height="6.2" rx="1" /><rect x="14.8" y="14.8" width="6.2" height="6.2" rx="1" /><path d="M9.2 6.1h3.6a2 2 0 0 1 2 2v6.7" /><path d="m12.2 12.3 2.6 2.6 2.6-2.6" /></>,
  scan: <><path d="M4 8.4V5.2a1.2 1.2 0 0 1 1.2-1.2h3.2M15.6 4h3.2A1.2 1.2 0 0 1 20 5.2v3.2M20 15.6v3.2a1.2 1.2 0 0 1-1.2 1.2h-3.2M8.4 20H5.2A1.2 1.2 0 0 1 4 18.8v-3.2" /><path d="M4 12h16" /></>,
  flask: <><path d="M9 3h6M10 3v6.4L4.9 18.1A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.7-2.9L14 9.4V3" /><path d="M7.6 15.2h8.8" /></>,
  leaf: <><path d="M20.4 3.6C10.2 3.6 4.8 8.1 4.8 14.7a5.2 5.2 0 0 0 5.2 5.2c6.6 0 10.4-6.2 10.4-16.3Z" /><path d="M3.6 20.4 15 9" /></>,
  doc: <><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  cube: <><path d="M12 2.6 20.6 7v10L12 21.4 3.4 17V7L12 2.6Z" /><path d="m3.4 7 8.6 4.4L20.6 7M12 11.4v10" /></>,
  target: <><circle cx="12" cy="12" r="8.6" /><circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r="1" /></>,
  users: <><circle cx="9" cy="8" r="3.4" /><path d="M2.6 20a6.4 6.4 0 0 1 12.8 0M16 5.3a3.4 3.4 0 0 1 0 6.4M17.6 14.3A6.4 6.4 0 0 1 21.4 20" /></>,
  refresh: <><path d="M20.2 12a8.2 8.2 0 1 1-2.7-6.1" /><path d="M20.2 3.8v4.4h-4.4" /></>,
  arrow: <path d="M4.8 12h14.4M13.4 6.2 19.2 12l-5.8 5.8" />,
  sector: <><path d="M12 2.6 21.4 12 12 21.4 2.6 12 12 2.6Z" /><path d="M12 7.4 17 12l-5 4.6L7 12l5-4.6Z" /></>,
};

function Ico({ name, size = 20, sw = 1.5, style, className }) {
  const g = ICONS[name];
  if (!g) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true" focusable="false"
    >{g}</svg>
  );
}

/* ─── Animated Counter ─────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function StatValue({ value }) {
  const m = /^\s*(\d+(?:\.\d+)?)([\s\S]*)$/.exec(String(value));
  if (!m) return <span>{value}</span>;
  return <AnimatedCounter target={parseFloat(m[1])} suffix={m[2].trim()} />;
}

/* ─── Landing Services (detailed, source-aligned to SERVICE_GROUPS) ────── */
const SERVICES = [
  {
    ico: 'coord', code: 'BIM-01', title: 'BIM Coordination',
    desc: 'Full-cycle federated coordination across architecture, structure and MEP — from early design clash detection through to a fully reconciled as-built model.',
    points: ['Clash detection & resolution workflows', 'Federated model coordination', 'Coordination meeting reporting'],
    tags: ['Revit', 'Navisworks', 'ISO 19650'],
  },
  {
    ico: 'struct', code: 'ST-02', title: 'Structural Engineering',
    desc: 'Analysis-driven structural modelling, connection detailing and rebar coordination for RCC, steel, precast and post-tensioned systems across the GCC.',
    points: ['RCC, steel, precast & PT modelling', 'Connection detailing & rebar coordination', 'Analysis-to-model traceability'],
    tags: ['ETABS', 'SAFE', 'Tekla'],
  },
  {
    ico: 'mep', code: 'ME-03', title: 'MEP Engineering',
    desc: 'Complete mechanical, electrical, plumbing and fire-protection design modelled and coordinated to code, with fabrication-level documentation.',
    points: ['HVAC load calculation & plant modelling', 'Power, lighting & low-voltage containment', 'Sprinkler, alarm and life-safety design'],
    tags: ['Revit MEP', 'AutoCAD', 'Fabrication'],
  },
  {
    ico: 'arch', code: 'AR-04', title: 'Architectural BIM',
    desc: 'Parametric architectural modelling from concept through construction documentation, delivered to LOD 300–500 with full national submission packages.',
    points: ['Concept-to-construction documentation', 'LOD 300–500 deliverables', 'Design-to-construction packages'],
    tags: ['Revit', 'Rhino', 'LOD 500'],
  },
  {
    ico: 'compliance', code: 'BIM-05', title: 'ISO 19650 Compliance',
    desc: 'End-to-end ISO 19650 implementation — BIM Execution Plans, CDE setup, EIR development, naming validation and audit-ready information management.',
    points: ['BIM Execution Plan authoring', 'Common Data Environment setup', 'EIR development & data validation'],
    tags: ['BEP', 'CDE', 'EIR'],
  },
  {
    ico: 'ai', code: 'BIM-06', title: 'AI Project Management',
    desc: 'DatumOS-powered project tracking, automated clash classification, lead scoring and real-time delivery analytics across the whole portfolio.',
    points: ['Automated clash classification', 'Lead scoring & pipeline analytics', 'Real-time delivery dashboards'],
    tags: ['DatumOS', 'GPT-4o', 'Real-time'],
  },
];

const SERVICE_GROUP_ICONS = ['database', 'compass', 'boxes', 'workflow', 'scan', 'flask'];
const MODULE_ICONS = ['target', 'leaf', 'cube', 'sector', 'doc', 'database'];
const ASSURANCE_ICONS = ['shield', 'badge', 'clock', 'merge', 'lock'];

const SOCIAL_ICONS = {
  linkedin: 'linkedin', instagram: 'instagram', youtube: 'youtube', x: 'xsocial', facebook: 'facebook',
};
const SOCIAL_URLS = SOCIALS.reduce((a, s) => ({ ...a, [s.key]: s.href }), {});

const PROJ_STATUS_TONE = {
  'In Progress': { bg: 'rgba(107,142,35,0.2)', border: '#6b8e23', fg: '#6b8e23' },
  Completed: { bg: 'rgba(212,175,55,0.15)', border: '#7a6212', fg: '#7a6212' },
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitEmail, setExitEmail] = useState('');
  const [exitSubmitted, setExitSubmitted] = useState(false);
  const exitShown = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitShown.current) {
        exitShown.current = true;
        setTimeout(() => setShowExitPopup(true), 300);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const handleExitSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Exit Popup Lead', company: 'Unknown', email: exitEmail, source: 'EXIT_POPUP' }),
      });
    } catch (_) {}
    setExitSubmitted(true);
    setTimeout(() => setShowExitPopup(false), 2000);
  };

  const sectionHead = (kicker, title, accent, blurb) => (
    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
      <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>{kicker}</div>
      <h2 className="orbitron" style={{ fontSize: 'clamp(28px,4vw,48px)', color: '#12263a', marginBottom: blurb ? '16px' : 0 }}>
        {title} <span style={{ color: '#6b8e23' }}>{accent}</span>
      </h2>
      {blurb && <p style={{ color: '#5a6472', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>{blurb}</p>}
    </div>
  );

  return (
    // `mk-light` scopes the white/navy/olive marketing theme. Private screens
    // do not carry this class, so the global dark theme is untouched there.
    <div
      className="mk-light"
      style={{
        background: '#f7f6f2',
        color: '#12263a',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { scroll-behavior: smooth; }
        .orbitron { font-family: 'Orbitron', monospace; }
        .glow-olive { text-shadow: none; }
        .glow-gold { text-shadow: none; }
        .glass { background: rgba(18,38,58,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(107,142,35,0.2); }
        .btn-primary { background: linear-gradient(135deg, #6b8e23, #4a6318); color: #fff; border: 1px solid #6b8e23; padding: 14px 32px; font-family: 'Orbitron', monospace; font-size: 13px; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: linear-gradient(135deg, #7fa028, #5a7520); box-shadow: 0 0 20px rgba(107,142,35,0.5); transform: translateY(-2px); }
        .btn-outline { background: transparent; color: #4a6318; border: 1px solid #6b8e23; padding: 14px 32px; font-family: 'Orbitron', monospace; font-size: 13px; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-outline:hover { background: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.3); transform: translateY(-2px); }
        .scanline { position: relative; overflow: hidden; }
        .scanline::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(18,38,58,0.025) 2px, rgba(18,38,58,0.025) 4px); pointer-events: none; }
        .service-card { transition: all 0.3s; }
        .service-card:hover { transform: translateY(-6px); border-color: rgba(107,142,35,0.6) !important; box-shadow: 0 0 30px rgba(107,142,35,0.2); }
        .project-card:hover { border-color: rgba(212,175,55,0.5) !important; background: rgba(212,175,55,0.05) !important; }
        input, select, textarea { background: #ffffff; border: 1px solid #c9d2df; color: #12263a; padding: 12px 16px; font-family: 'Rajdhani', sans-serif; font-size: 15px; width: 100%; outline: none; transition: border-color 0.3s; }
        input:focus, select:focus, textarea:focus { border-color: #6b8e23; box-shadow: 0 0 10px rgba(107,142,35,0.2); }
        input::placeholder, textarea::placeholder { color: #5a6472; }
        select option { background: #ffffff; color: #12263a; }
        nav a { color: #3f4a5a; text-decoration: none; font-size: 13px; letter-spacing: 1px; transition: color 0.3s; }
        nav a:hover { color: #4a6318; }
        @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }
        @keyframes hero-glow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hero-badge { animation: pulse-dot 2s infinite; }
        .hero-icon { animation: float 4s ease-in-out infinite; }
        section[id] { scroll-margin-top: 70px; }
        .mono-box { display: flex; align-items: center; justify-content: center; color: #6b8e23; }
        .ico-tile { width: 52px; height: 52px; border: 1px solid rgba(107,142,35,0.35); background: rgba(107,142,35,0.08); display: flex; align-items: center; justify-content: center; color: #6b8e23; flex-shrink: 0; }
        .ico-tile-gold { border-color: rgba(212,175,55,0.35); background: rgba(107,142,35,0.10); color: #4a6318; }
        .ico-inline { display: inline-flex; vertical-align: -3px; margin-right: 6px; }
        .tick { color: #6b8e23; display: inline-flex; vertical-align: -2px; margin-right: 8px; flex-shrink: 0; }
        .spin { animation: spin 1s linear infinite; }
        .hoverable { transition: all 0.3s; }
        .hoverable:hover { transform: translateY(-4px); border-color: rgba(107,142,35,0.5) !important; box-shadow: 0 0 24px rgba(107,142,35,0.14); }
        .soc-box { width: 40px; height: 40px; background: rgba(107,142,35,0.1); border: 1px solid rgba(107,142,35,0.2); display: flex; align-items: center; justify-content: center; color: #6b8e23; transition: all 0.3s; }
        .soc-box:hover { background: rgba(107,142,35,0.22); border-color: rgba(107,142,35,0.55); color: #4a6318; }

        /* ── QuoteForm on the light homepage ──────────────────────────────
           The shared QuoteForm (also used by the dark /contact page) is
           coloured for that dark theme: sand-cream copy and slate labels.
           Measured against this page's cream background those tones collapse
           — checkbox labels and the intro paragraph sit at 1.04:1, the field
           labels at 2.37:1 (WCAG AA needs 4.5:1). Re-ink the component here
           only: navy labels, soft-ink paragraphs, a pale-red error panel.
           Every rule requires the .mk-light root, so the /contact instance
           keeps its dark treatment untouched. */
        .mk-light form label,
        .mk-light form legend { color: #12263a; }
        .mk-light form p { color: #3f4a5a; }
        /* The component also carries text-sand-50 (near-white) on every
           input/select/textarea. A class beats the element selector above,
           so typed values and the collapsed <select> label — not just the
           placeholder — rendered white-on-white here. The scoped selectors
           (one class + two elements) outrank the bare utility class; the
           dark /contact page still wins its own rules. */
        .mk-light form input,
        .mk-light form select,
        .mk-light form textarea { color: #12263a; }
        .mk-light form [role="alert"] { background: #fdecea; border-color: rgba(185,28,28,0.35); color: #7f1d1d; }
        .mk-light form [role="alert"] p { color: inherit; }

        /* ── Responsive navigation ──────────────────────────────────────
           The desktop link row was rendered unconditionally, so on a phone
           width it collided with the logo and ran off the right edge. The
           menuOpen state existed but nothing ever toggled it. These rules
           give the nav a real small-screen mode. */
        .nav-root { padding: 0 40px; }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-toggle {
          display: none; align-items: center; justify-content: center;
          width: 44px; height: 44px; background: #ffffff;
          border: 1px solid rgba(18,38,58,0.22); color: #12263a; cursor: pointer;
        }
        .nav-mobile { display: none; }
        @media (max-width: 860px) {
          .nav-root { padding: 0 20px; flex-wrap: wrap; height: auto; min-height: 70px; }
          .nav-links { display: none; }
          .nav-toggle { display: flex; }
          .nav-mobile.open {
            display: flex; flex-direction: column; gap: 4px;
            width: 100%; order: 3;
            padding: 18px 20px 24px;
            background: rgba(247,246,242,0.98);
            border-bottom: 1px solid rgba(18,38,58,0.12);
            box-shadow: 0 12px 24px rgba(18,38,58,0.08);
          }
          .nav-mobile a {
            color: #12263a; font-size: 13px; letter-spacing: 2px;
            padding: 12px 0; text-decoration: none; border-bottom: 1px solid rgba(18,38,58,0.08);
          }
          .nav-mobile a:last-child { border-bottom: none; }
        }
        /* The footer keeps the navy brand colour, so its icon tiles need the
           light-on-navy treatment rather than the light-page default. */
        footer .soc-box { color: #a6cc5c; border-color: rgba(166,204,92,0.4); background: rgba(166,204,92,0.12); }
        footer .soc-box:hover { color: #12263a; background: #a6cc5c; border-color: #a6cc5c; }
        footer .btn-outline { color: #a6cc5c; border-color: #a6cc5c; }
      `}} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(247,246,242,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(18,38,58,0.12)' : 'none',
        transition: 'all 0.3s', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px'
      }} className="nav-root">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#6b8e23,#4a6318)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#12263a', overflow: 'hidden' }}>
            {/* Real DATUM BIM logo emblem, cropped to the octagon (rows 0-598) and rendered white to match the tile's existing #fff treatment. */}
            <span style={{ width: '20px', height: '20px', overflow: 'hidden', display: 'block', lineHeight: 0 }}>
              <img
                src="/brand/datum-bim-logo-light.png"
                alt="Datum BIM Engineering"
                width={20}
                height={26}
                style={{ display: 'block', width: '20px', height: 'auto' }}
              />
            </span>
          </div>
          <div>
            <div className="orbitron" style={{ fontSize: '14px', fontWeight: 700, color: '#6b8e23', letterSpacing: '2px' }}>DATUM</div>
            <div style={{ fontSize: '9px', color: '#5a6472', letterSpacing: '3px' }}>STUDIOS</div>
          </div>
        </div>

        <div className="nav-links">
          {['Services', 'Projects', 'About', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="orbitron" style={{ fontSize: '11px', letterSpacing: '2px' }}>{item}</a>
          ))}
          {/* Route link (not a section anchor): the client-journey page. */}
          <Link href="/client-journey" className="orbitron" style={{ fontSize: '11px', letterSpacing: '2px', color: '#6b8e23', fontWeight: 700 }}>How It Works</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '10px 24px', fontSize: '11px' }}>LOGIN →</Link>
        </div>

        {/* Small-screen menu control. Hidden above 860px by .nav-toggle. */}
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(o => !o)}
        >
          <Ico name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>

        <div id="nav-mobile-menu" className={`nav-mobile${menuOpen ? ' open' : ''}`}>
          {['Services', 'Projects', 'About', 'Contact'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.toUpperCase()}
            </a>
          ))}
          <Link
            href="/client-journey"
            onClick={() => setMenuOpen(false)}
            style={{ color: '#6b8e23', fontWeight: 700 }}
          >
            HOW IT WORKS
          </Link>
          <Link
            href="/login"
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '11px', marginTop: '14px', alignSelf: 'flex-start' }}
            onClick={() => setMenuOpen(false)}
          >
            CLIENT PORTAL →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="scanline" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(107,142,35,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.05) 0%, transparent 50%), #f7f6f2',
        padding: '120px 40px 80px', textAlign: 'center', position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(107,142,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(107,142,35,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '34px' }}>
            <img
              // Dark artwork: the "-light" variant is white-on-transparent and
              // was invisible against the new white hero background.
              src="/brand/datum-bim-logo.png"
              alt="Datum BIM Engineering — Design Consultancy Services"
              width={600}
              height={766}
              style={{ width: 'clamp(130px, 17vw, 184px)', height: 'auto', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <div className="hero-badge" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b8e23' }} />
            <span className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px' }}>DATUM STUDIOS ENGINEERING CONSULTANCY</span>
            <div className="hero-badge" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b8e23' }} />
          </div>

          <h1 className="orbitron glow-olive" style={{ fontSize: 'clamp(36px,6vw,80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', color: '#12263a' }}>
            MEP BIM MODELLING,<br />
            <span style={{ color: '#6b8e23' }}>COORDINATION &amp; SHOP DRAWINGS</span>
          </h1>

          <p style={{ fontSize: '18px', color: '#3f4a5a', maxWidth: '660px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            BIM delivery support for contractors and consultants — MEP modelling, clash coordination and
            shop-drawing production, powered by <strong style={{ color: '#7a6212', fontWeight: 700 }}>DatumBIM OS</strong> for
            drawing registers, revisions, coordination issues and QA records.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#contact" className="btn-primary">START YOUR PROJECT</a>
            <a href="#services" className="btn-outline">EXPLORE SERVICES</a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '60px', flexWrap: 'wrap' }}>
            {[
              { label: 'ISO 19650', sub: 'CERTIFIED' },
              { label: 'BIM LEVEL 2', sub: 'COMPLIANT' },
              { label: 'GCC REGION', sub: 'COVERAGE' },
            ].map(({ label, sub }) => (
              <div key={label} className="glass" style={{ padding: '12px 24px', textAlign: 'center' }}>
                <div className="orbitron" style={{ fontSize: '13px', color: '#6b8e23', letterSpacing: '2px' }}>{label}</div>
                <div style={{ fontSize: '10px', color: '#5a6472', letterSpacing: '3px', marginTop: '4px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'rgba(107,142,35,0.08)', borderTop: '1px solid rgba(107,142,35,0.2)', borderBottom: '1px solid rgba(107,142,35,0.2)', padding: '48px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '32px', textAlign: 'center' }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="orbitron glow-gold" style={{ fontSize: '40px', fontWeight: 900, color: '#7a6212' }}>
                <StatValue value={value} />
              </div>
              <div style={{ fontSize: '11px', color: '#5a6472', letterSpacing: '3px', marginTop: '8px' }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ maxWidth: '900px', margin: '28px auto 0', textAlign: 'center', color: '#5a6472', fontSize: '11px', letterSpacing: '1px' }}>
          Figures as recorded in the DATUM company profile. They are not independently audited on this page — ask us for the basis of any number you need to rely on.
        </p>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {sectionHead('// CAPABILITIES', 'OUR', 'SERVICES', 'End-to-end BIM and engineering services for the most demanding construction projects in the region — delivered by seven specialist discipline divisions.')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '24px' }}>
          {SERVICES.map(({ ico, code, title, desc, points, tags }) => (
            <div key={title} className="glass service-card" style={{ padding: '32px', borderRadius: '2px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ margin: '-32px -32px 24px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                <img
                  src={`/services/${ico}.svg`}
                  alt={`${title} technical illustration`}
                  width={640}
                  height={220}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="ico-tile"><Ico name={ico} size={26} /></div>
                <span className="orbitron" style={{ fontSize: '10px', color: '#5a6472', letterSpacing: '2px' }}>{code}</span>
              </div>
              <h3 className="orbitron" style={{ fontSize: '16px', color: '#7a6212', marginBottom: '12px', letterSpacing: '1px' }}>{title}</h3>
              <p style={{ color: '#3f4a5a', fontSize: '14px', lineHeight: 1.7, marginBottom: '18px' }}>{desc}</p>
              <ul style={{ listStyle: 'none', marginBottom: '20px' }}>
                {points.map(pt => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', color: '#5a6472', fontSize: '13px', lineHeight: 1.6, marginBottom: '7px' }}>
                    <span className="tick"><Ico name="check" size={13} sw={2} /></span>{pt}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(107,142,35,0.15)', border: '1px solid rgba(107,142,35,0.3)', color: '#6b8e23', padding: '4px 10px', fontSize: '11px', letterSpacing: '1px' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCIPLINES & SECTORS ── */}
      <section style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(107,142,35,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {sectionHead('// DISCIPLINES', 'SEVEN', 'DIVISIONS', 'One coordinated information model, delivered by specialist teams under a single BIM Execution Plan and a single Common Data Environment.')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {DISCIPLINES.map(d => (
              <div key={d.code} className="glass hoverable" style={{ padding: '24px', borderRadius: '2px' }}>
                <div style={{ margin: '-24px -24px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                  <img
                    src={`/services/div-${d.code.toLowerCase()}.svg`}
                    alt={`${d.name} discipline division technical illustration`}
                    width={600}
                    height={180}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div className="mono-box" style={{ width: '40px', height: '40px', border: '1px solid rgba(107,142,35,0.35)', background: 'rgba(107,142,35,0.08)' }}>
                    <span className="orbitron" style={{ fontSize: '13px', color: '#6b8e23' }}>{d.code}</span>
                  </div>
                  <div>
                    <div className="orbitron" style={{ fontSize: '13px', color: '#12263a' }}>{d.name}</div>
                    <div style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '2px', marginTop: '2px' }}>{d.tagline}</div>
                  </div>
                  {d.flagship && (
                    <span style={{ marginLeft: 'auto', fontSize: '9px', letterSpacing: '1px', color: '#7a6212', border: '1px solid rgba(212,175,55,0.4)', padding: '3px 7px' }}>FLAGSHIP</span>
                  )}
                </div>
                <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7 }}>{d.blurb}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '56px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '20px', textAlign: 'center' }}>// SECTORS SERVED</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SECTORS.map(s => (
                <span key={s} className="glass" style={{ padding: '10px 20px', fontSize: '13px', color: '#3f4a5a', letterSpacing: '1px' }}>{s}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '64px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '24px', textAlign: 'center' }}>// SERVICE FRAMEWORK</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
              {SERVICE_GROUPS.map((g, i) => (
                <div key={g.title} className="glass hoverable" style={{ padding: '26px', borderRadius: '2px' }}>
                  <div style={{ margin: '-26px -26px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                    <img
                      src={`/services/fw-${i}.svg`}
                      alt={`${g.title} service framework illustration`}
                      width={600}
                      height={180}
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <Ico name={SERVICE_GROUP_ICONS[i]} size={24} style={{ color: '#6b8e23', flexShrink: 0 }} />
                    <h3 className="orbitron" style={{ fontSize: '13px', color: '#7a6212', letterSpacing: '1px' }}>{g.title}</h3>
                  </div>
                  <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7, marginBottom: '14px' }}>{g.text}</p>
                  <ul style={{ listStyle: 'none' }}>
                    {g.items.map(it => (
                      <li key={it} style={{ display: 'flex', alignItems: 'center', color: '#4e5866', fontSize: '12px', marginBottom: '6px' }}>
                        <span className="tick" style={{ color: '#7a6212' }}><Ico name="arrow" size={11} sw={2} /></span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DELIVERY ASSURANCE ── */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {sectionHead('// HOW WE WORK', 'DELIVERY', 'PRACTICE', 'Five working practices that apply to every engagement. These are process commitments, not guarantees - see the scope boundaries for what we do not claim.')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {ASSURANCE.map((a, i) => (
            <div key={a.title} className="glass hoverable" style={{ padding: '28px', borderRadius: '2px' }}>
              <div style={{ margin: '-28px -28px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                <img
                  src={`/services/as-${i}.svg`}
                  alt={`${a.title} assurance illustration`}
                  width={600}
                  height={180}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
              <div className="ico-tile ico-tile-gold" style={{ marginBottom: '18px' }}><Ico name={ASSURANCE_ICONS[i]} size={26} /></div>
              <h3 className="orbitron" style={{ fontSize: '14px', color: '#12263a', marginBottom: '10px', letterSpacing: '1px' }}>{a.title}</h3>
              <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7 }}>{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(107,142,35,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {sectionHead('// SCOPE', 'WHAT WE', 'DELIVER', 'Each of these can start as one discipline, one floor, or a fixed number of drawings. Nothing here is a project portfolio - see the downloadable demonstration sheets for our drawing standard.')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '20px' }}>
            {PORTFOLIO.map(({ name, loc, type, area, lod, status, disc, note }, i) => {
              const tone = PROJ_STATUS_TONE[status] || { bg: 'rgba(107,142,35,0.15)', border: '#6b8e23', fg: '#6b8e23' };
              return (
                <div key={name} className="glass project-card" style={{ padding: '28px', transition: 'all 0.3s', cursor: 'default', borderRadius: '2px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ margin: '-28px -28px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                    <img
                      src={`/services/pj-${i}.svg`}
                      alt={`${name} project illustration`}
                      width={600}
                      height={180}
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                    <span style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.fg, padding: '3px 10px', fontSize: '10px', letterSpacing: '2px', whiteSpace: 'nowrap' }}>{status.toUpperCase()}</span>
                    <span className="orbitron" style={{ color: '#7a6212', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{lod}</span>
                  </div>
                  <h3 style={{ fontSize: '17px', color: '#12263a', marginBottom: '12px', fontWeight: 600 }}>{name}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                    <span style={{ color: '#5a6472', fontSize: '13px' }}><Ico name="pin" size={13} style={{ color: '#6b8e23' }} />{loc}</span>
                    <span style={{ color: '#5a6472', fontSize: '13px' }}><Ico name="ruler" size={13} style={{ color: '#6b8e23' }} />{area}</span>
                  </div>
                  <p style={{ color: '#6b8e23', fontSize: '12px', letterSpacing: '1px', marginBottom: '12px' }}>{type.toUpperCase()}</p>
                  <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7, marginBottom: '18px' }}>{note}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {disc.map(d => (
                      <span key={d} style={{ border: '1px solid rgba(212,175,55,0.3)', color: '#7a6212', padding: '3px 9px', fontSize: '10px', letterSpacing: '1px' }}>{d}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <Link href="/projects" className="btn-outline" style={{ display: 'inline-block' }}>
              VIEW ALL PROJECTS <Ico name="arrow" size={14} style={{ verticalAlign: '-2px', marginLeft: '8px' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOD FRAMEWORK ── */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {sectionHead('// LEVELS OF DEVELOPMENT', 'LOD', 'FRAMEWORK', 'Every deliverable is measured against a published Level of Development, so scope, density and cost are agreed before modelling begins.')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
          {LOD_LEVELS.map(l => (
            <div key={l.lod} className="glass hoverable" style={{ padding: '26px', borderRadius: '2px' }}>
              <div style={{ margin: '-26px -26px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                <img
                  src={`/services/lod-${String(l.lod).replace('LOD ', '').toLowerCase()}.svg`}
                  alt={`${l.lod} development level illustration`}
                  width={600}
                  height={180}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Ico name="layers" size={22} style={{ color: '#6b8e23' }} />
                <span className="orbitron" style={{ fontSize: '15px', color: '#7a6212' }}>{l.lod}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#6b8e23', letterSpacing: '2px' }}>{l.phase.toUpperCase()}</span>
              </div>
              <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7 }}>{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(107,142,35,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {sectionHead('// METHODOLOGY', 'SIX-PHASE', 'DELIVERY', 'A repeatable six-phase BIM implementation process, from project set-up through verified handover into facilities management.')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '20px' }}>
            {BIM_PROCESS.map(p => (
              <div key={p.n} className="glass hoverable" style={{ padding: '26px', borderRadius: '2px' }}>
                <div style={{ margin: '-26px -26px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                  <img
                    src={`/services/pr-${p.n}.svg`}
                    alt={`${p.title} delivery phase illustration`}
                    width={600}
                    height={180}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                  <span className="orbitron" style={{ fontSize: '30px', color: 'rgba(107,142,35,0.4)', lineHeight: 1, flexShrink: 0 }}>{String(p.n).padStart(2, '0')}</span>
                  <div>
                    <h3 className="orbitron" style={{ fontSize: '13px', color: '#12263a', marginBottom: '8px', letterSpacing: '1px' }}>{p.title}</h3>
                    <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7 }}>{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '24px', textAlign: 'center' }}>// HOW WE ENGAGE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
              {ENGAGEMENT.map(e => (
                <div key={e.n} className="glass hoverable" style={{ padding: '26px', borderRadius: '2px' }}>
                  <div style={{ margin: '-26px -26px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                    <img
                      src={`/services/eg-${e.n}.svg`}
                      alt={`${e.title} engagement step illustration`}
                      width={600}
                      height={180}
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span className="orbitron" style={{ fontSize: '13px', color: '#7a6212', border: '1px solid rgba(212,175,55,0.35)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e.n}</span>
                    <h3 className="orbitron" style={{ fontSize: '13px', color: '#12263a', letterSpacing: '1px' }}>{e.title}</h3>
                  </div>
                  <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7 }}>{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ADVANCED MODULES ── */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {sectionHead('// SPECIALIST MODULES', 'ADVANCED', 'CAPABILITIES', 'Beyond core modelling — digital twins, sustainability reporting, fabrication data, GIS, forensics and asset information management.')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '20px' }}>
          {ADVANCED_MODULES.map((m, i) => (
            <div key={m.title} className="glass hoverable" style={{ padding: '28px', borderRadius: '2px' }}>
              <div style={{ margin: '-28px -28px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                <img
                  src={`/services/md-${i}.svg`}
                  alt={`${m.title} specialist module illustration`}
                  width={600}
                  height={180}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="ico-tile"><Ico name={MODULE_ICONS[i]} size={26} /></div>
                <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#7a6212', border: '1px solid rgba(212,175,55,0.35)', padding: '3px 8px' }}>{m.tag}</span>
              </div>
              <h3 className="orbitron" style={{ fontSize: '14px', color: '#12263a', marginBottom: '10px', letterSpacing: '1px' }}>{m.title}</h3>
              <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>{m.text}</p>
              <ul style={{ listStyle: 'none' }}>
                {m.items.map(it => (
                  <li key={it} style={{ display: 'flex', alignItems: 'center', color: '#4e5866', fontSize: '12px', marginBottom: '6px' }}>
                    <span className="tick" style={{ color: '#6b8e23' }}><Ico name="check" size={12} sw={2} /></span>{it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(107,142,35,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {sectionHead('// ABOUT US', 'PRECISION', 'ENGINEERING', SITE.tagline)}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <p style={{ color: '#3f4a5a', lineHeight: 1.8, marginBottom: '20px' }}>
                Datum Studios is a BIM and engineering consultancy delivering ISO 19650-compliant information
                management for complex construction projects. Our practice covers the full asset lifecycle — from
                concept and design development through construction support to verified handover and asset information.
              </p>
              <p style={{ color: '#3f4a5a', lineHeight: 1.8, marginBottom: '32px' }}>
                Seven specialist divisions — architecture, structural, mechanical, electrical, plumbing, fire
                protection and BIM &amp; digital delivery — work from a single federated model and a single Common
                Data Environment, coordinated by our in-house DatumOS platform.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
                {OFFICES.map(o => (
                  <span key={o.city} className="glass" style={{ padding: '8px 16px', fontSize: '12px', color: '#6b8e23' }}>
                    <Ico name="pin" size={12} style={{ color: '#6b8e23' }} />{o.city}, {o.country}
                  </span>
                ))}
              </div>

              <div className="orbitron" style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// WHAT WE STAND FOR</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {VALUES.map(v => (
                  <div key={v.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span className="tick" style={{ marginTop: '3px' }}><Ico name="check" size={13} sw={2} /></span>
                    <div>
                      <span style={{ color: '#7a6212', fontSize: '13px', fontWeight: 600 }}>{v.title}</span>
                      <span style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7 }}> — {v.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { ico: 'trophy', title: 'Standards-Based', desc: 'Deliverable defined by an agreed model requirement, not by assumption' },
                  { ico: 'shield', title: 'Standards We Work To', desc: SITE.standards.join(' / ') },
                  { ico: 'globe', title: 'Working Location', desc: 'Based in Lahore, working with contractors and consultants in the GCC' },
                  { ico: 'bolt', title: 'AI-Powered', desc: 'DatumOS real-time delivery platform' },
                ].map(({ ico, title, desc }) => (
                  <div key={title} className="glass hoverable" style={{ padding: '24px', textAlign: 'center', borderRadius: '2px' }}>
                    <div className="ico-tile ico-tile-gold" style={{ margin: '0 auto 14px' }}><Ico name={ico} size={26} /></div>
                    <div className="orbitron" style={{ fontSize: '12px', color: '#7a6212', marginBottom: '8px' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: '#5a6472', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '40px' }}>
                <div className="orbitron" style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// STANDARDS WE WORK TO</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {CERTS.map(c => (
                    <div key={c.name} className="glass" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Ico name="badge" size={18} style={{ color: '#6b8e23', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: '#12263a', fontSize: '13px' }}>{c.name}</div>
                          <div style={{ color: '#4e5866', fontSize: '11px' }}>{c.type}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#7a6212', whiteSpace: 'nowrap' }}>{c.status.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {sectionHead('// ROLES', 'WHO DOES', 'THE WORK', 'The roles that appear on every engagement. Specific people are named on appointment - we do not publish a team of individuals or their credentials that we cannot evidence.')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {TEAM.map(t => (
            <div key={t.name} className="glass hoverable" style={{ padding: '28px', borderRadius: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div className="mono-box orbitron" style={{ width: '52px', height: '52px', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)', color: '#7a6212', fontSize: '15px', flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <div style={{ color: '#12263a', fontSize: '16px', fontWeight: 600 }}>{t.name}</div>
                  <div className="orbitron" style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '2px', marginTop: '4px' }}>{t.role.toUpperCase()}</div>
                </div>
              </div>
              <p style={{ color: '#5a6472', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>{t.creds}</p>
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '12px', color: '#4e5866' }}>
                <span><Ico name="cube" size={12} style={{ color: '#6b8e23' }} />{t.projects}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                {t.tools.split(',').map(tool => (
                  <span key={tool} style={{ border: '1px solid rgba(107,142,35,0.3)', color: '#6b8e23', padding: '3px 9px', fontSize: '10px', letterSpacing: '1px' }}>{tool.trim()}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(107,142,35,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {sectionHead('// BIM-ENABLED TOOLS', 'OUR OWN', 'TOOLING', 'Proprietary DatumOS tooling that extends your model into managed content, mobile access, live analytics and automated production.')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.title} className="glass hoverable" style={{ padding: '28px', borderRadius: '2px' }}>
                <div style={{ margin: '-28px -28px 18px', background: '#eef1f6', borderBottom: '1px solid rgba(107,142,35,0.22)', overflow: 'hidden', lineHeight: 0 }}>
                  <img
                    src={`/services/tl-${i}.svg`}
                    alt={`${p.title} product illustration`}
                    width={600}
                    height={180}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Ico name={['database', 'cube', 'target', 'workflow'][i]} size={24} style={{ color: '#6b8e23', flexShrink: 0 }} />
                  <h3 className="orbitron" style={{ fontSize: '14px', color: '#12263a', letterSpacing: '1px' }}>{p.title}</h3>
                </div>
                <p style={{ color: '#7a6212', fontSize: '12px', lineHeight: 1.6, marginBottom: '16px' }}>{p.sub}</p>
                <ul style={{ listStyle: 'none' }}>
                  {p.items.map(it => (
                    <li key={it} style={{ display: 'flex', alignItems: 'center', color: '#5a6472', fontSize: '12px', marginBottom: '6px' }}>
                      <span className="tick"><Ico name="check" size={12} sw={2} /></span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '24px', textAlign: 'center' }}>// SOFTWARE PROFICIENCY</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SOFTWARE.map(s => (
                <span key={s} className="glass" style={{ padding: '8px 16px', fontSize: '12px', color: '#3f4a5a', letterSpacing: '1px' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── YOUTUBE CHANNEL — every video, embedded ── */}
      <section id="videos" style={{ padding: '100px 40px', background: '#eef1f6', borderTop: '1px solid rgba(107,142,35,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// DATUM PRODUCTIONS</div>
            <h2 className="orbitron" style={{ fontSize: 'clamp(24px,3vw,40px)', color: '#12263a', marginBottom: '16px' }}>
              WATCH OUR <span style={{ color: '#6b8e23' }}>WORK</span>
            </h2>
            <p style={{ color: '#5a6472' }}>Every video from our YouTube channel — BIM tutorials, project showcases and studio updates.</p>
          </div>

          <div className="glass" style={{ padding: '12px', border: '1px solid rgba(107,142,35,0.25)' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000', overflow: 'hidden' }}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/videoseries?list=UUQQ0XppAJNstNuGmHnDmV6g"
                title="DATUM PRODUCTIONS — all videos"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a
              href="https://www.youtube.com/@datumproductions"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px',
                border: '1px solid rgba(107,142,35,0.4)',
                background: 'rgba(107,142,35,0.1)',
                color: '#6b8e23', fontSize: '12px', letterSpacing: '2px',
                textDecoration: 'none', fontFamily: "'Orbitron', monospace",
              }}
            >
              VIEW CHANNEL ON YOUTUBE →
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT / LEAD FORM ── */}
      <section id="contact" style={{ padding: '100px 40px', background: 'rgba(107,142,35,0.04)', borderTop: '1px solid rgba(107,142,35,0.15)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// GET IN TOUCH</div>
            <h2 className="orbitron" style={{ fontSize: 'clamp(24px,3vw,40px)', color: '#12263a', marginBottom: '16px' }}>
              START YOUR <span style={{ color: '#6b8e23' }}>PROJECT</span>
            </h2>
            <p style={{ color: '#5a6472' }}>Tell us the discipline, the drawings you hold and the date you need them. A BIM lead replies within one business day.</p>
          </div>

          <QuoteForm />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#12263a', borderTop: '1px solid rgba(107,142,35,0.2)', padding: '60px 40px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#a6cc5c,#4a6318)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#12263a' }}>
                  <Ico name="hex" size={18} sw={1.6} />
                </div>
                <span className="orbitron" style={{ color: '#a6cc5c', fontSize: '14px', letterSpacing: '2px' }}>DATUM STUDIOS</span>
              </div>
              <p style={{ color: '#c3cdda', fontSize: '13px', lineHeight: 1.7 }}>{SITE.descriptor}</p>
              <p style={{ color: '#aeb9c8', fontSize: '12px', lineHeight: 1.7, marginTop: '10px' }}>{SITE.addr}</p>
            </div>
            <div>
              <h4 className="orbitron" style={{ color: '#d9c27f', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>SERVICES</h4>
              {DISCIPLINES.map(s => (
                <div key={s.code} style={{ color: '#c3cdda', fontSize: '13px', marginBottom: '8px' }}>{s.name}</div>
              ))}
            </div>
            <div>
              <h4 className="orbitron" style={{ color: '#d9c27f', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>CONTACT</h4>
              <div style={{ color: '#c3cdda', fontSize: '13px', lineHeight: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Ico name="pin" size={13} style={{ color: '#a6cc5c' }} />{SITE.city}</div>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} style={{ color: '#c3cdda', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}><Ico name="phone" size={13} style={{ color: '#a6cc5c' }} />{SITE.phone}</a>
                <a href={`mailto:${SITE.email}`} style={{ color: '#c3cdda', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}><Ico name="mail" size={13} style={{ color: '#a6cc5c' }} />{SITE.email}</a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Ico name="globe" size={13} style={{ color: '#a6cc5c' }} />{SITE.website}</div>
              </div>
            </div>
            <div>
              <h4 className="orbitron" style={{ color: '#d9c27f', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>FOLLOW US</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {SOCIALS.map(({ key, label, href }) => (
                  <a key={key} href={href || SOCIAL_URLS[key] || '#'} target="_blank" rel="noopener noreferrer"
                    className="soc-box" title={label} aria-label={label}>
                    <Ico name={SOCIAL_ICONS[key] || 'globe'} size={17} />
                  </a>
                ))}
              </div>
              <h4 className="orbitron" style={{ color: '#d9c27f', fontSize: '12px', letterSpacing: '2px', margin: '28px 0 14px' }}>OFFICES</h4>
              <div style={{ display: 'grid', gap: '6px' }}>
                {OFFICES.map(o => (
                  <div key={o.city} style={{ color: '#aeb9c8', fontSize: '12px' }}>{o.city} — <span style={{ color: '#a6cc5c' }}>{o.role}</span></div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(107,142,35,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ color: '#aeb9c8', fontSize: '12px' }}>© 2026 Datum Studios Engineering Consultancy. All rights reserved.</span>
            <span style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/client-journey" style={{ color: '#a6cc5c', fontSize: '12px', textDecoration: 'none', letterSpacing: '1px' }}>HOW IT WORKS →</Link>
              <Link href="/login" style={{ color: '#a6cc5c', fontSize: '12px', textDecoration: 'none', letterSpacing: '1px' }}>CLIENT PORTAL →</Link>
            </span>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOATING BUTTON ── */}
      <a href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '90px', right: '24px', zIndex: 999, width: '56px', height: '56px', background: 'rgba(107,142,35,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#12263a', boxShadow: '0 4px 20px rgba(107,142,35,0.4)', textDecoration: 'none', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat on WhatsApp">
        <Ico name="chat" size={26} />
      </a>

      {/* ── EXIT-INTENT POPUP ── */}
      {showExitPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid rgba(107,142,35,0.4)', maxWidth: '480px', width: '100%', padding: '48px', position: 'relative', boxShadow: '0 0 60px rgba(107,142,35,0.2)' }}>
            <button onClick={() => setShowExitPopup(false)} aria-label="Close"
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4e5866', cursor: 'pointer', display: 'flex' }}>
              <Ico name="close" size={20} />
            </button>
            {exitSubmitted ? (
              <div style={{ textAlign: 'center' }}>
                <div className="ico-tile" style={{ margin: '0 auto 16px', width: '64px', height: '64px' }}><Ico name="check" size={32} sw={1.6} /></div>
                <h3 className="orbitron" style={{ color: '#6b8e23', marginBottom: '8px' }}>SENT!</h3>
                <p style={{ color: '#5a6472' }}>Check your inbox for the BIM Capability Statement.</p>
              </div>
            ) : (
              <>
                <div className="orbitron" style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '12px' }}>// FREE DOWNLOAD</div>
                <h2 className="orbitron" style={{ fontSize: '22px', color: '#12263a', marginBottom: '12px', lineHeight: 1.3 }}>
                  GET OUR FREE<br /><span style={{ color: '#6b8e23' }}>BIM CAPABILITY STATEMENT</span>
                </h2>
                <p style={{ color: '#5a6472', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                  Download our BIM Capability Statement — ISO 19650 compliance, project portfolio, team credentials, and service packages.
                </p>
                <form onSubmit={handleExitSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input required type="email" value={exitEmail} onChange={e => setExitEmail(e.target.value)} placeholder="your@email.com"
                    style={{ flex: 1, background: '#ffffff', border: '1px solid #c9d2df', color: '#12263a', padding: '12px 16px', fontSize: '14px', outline: 'none' }} />
                  <button type="submit" className="btn-primary" style={{ border: 'none', whiteSpace: 'nowrap' }}>SEND →</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── STICKY MOBILE CTA BAR ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 998, background: 'rgba(18,38,58,0.97)', borderTop: '1px solid rgba(166,204,92,0.4)', display: 'flex', padding: '0' }}>
        {[
          { ico: 'phone', label: 'Call', href: `tel:${SITE.phone.replace(/\s/g, '')}`, color: '#a6cc5c' },
          { ico: 'chat', label: 'WhatsApp', href: `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}`, color: '#a6cc5c' },
          { ico: 'mail', label: 'Email', href: `mailto:${SITE.email}`, color: '#d9c27f' },
        ].map(({ ico, label, href, color }) => (
          <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', textDecoration: 'none', color, fontSize: '11px', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", gap: '4px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = `${color}15`}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Ico name={ico} size={18} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
