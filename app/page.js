'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Animated Counter ───────────────────────────────────────────────────────
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

// ─── Services Data ───────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: '🏗️',
    title: 'BIM Coordination',
    desc: 'Full-cycle BIM coordination across all disciplines — architectural, structural, MEP — with clash detection and resolution workflows.',
    tags: ['Revit', 'Navisworks', 'ISO 19650'],
  },
  {
    icon: '🔩',
    title: 'Structural Engineering',
    desc: 'Advanced structural analysis and BIM modeling for high-rise, industrial, and infrastructure projects across the GCC.',
    tags: ['ETABS', 'SAFE', 'Tekla'],
  },
  {
    icon: '⚡',
    title: 'MEP Engineering',
    desc: 'Mechanical, Electrical & Plumbing BIM modeling with full coordination, clash resolution, and as-built documentation.',
    tags: ['Revit MEP', 'AutoCAD', 'Fabrication'],
  },
  {
    icon: '🏛️',
    title: 'Architectural BIM',
    desc: 'Parametric architectural modeling, LOD 300–500 deliverables, and design-to-construction documentation packages.',
    tags: ['Revit', 'Rhino', 'LOD 500'],
  },
  {
    icon: '📋',
    title: 'ISO 19650 Compliance',
    desc: 'Full ISO 19650 implementation — BIM Execution Plans, CDE setup, information management, and audit-ready deliverables.',
    tags: ['BEP', 'CDE', 'EIR'],
  },
  {
    icon: '🤖',
    title: 'AI Project Management',
    desc: 'AI-powered project tracking, automated clash classification, lead scoring, and real-time dashboard analytics via DatumOS.',
    tags: ['DatumOS', 'GPT-4o', 'Real-time'],
  },
];

// ─── Projects Data ───────────────────────────────────────────────────────────
const PROJECTS = [
  { name: 'Aldar HQ Tower', location: 'Abu Dhabi, UAE', type: 'High-Rise BIM', value: 'AED 2.4B', status: 'DELIVERED' },
  { name: 'NEOM Linear City', location: 'Tabuk, KSA', type: 'Infrastructure BIM', value: 'USD 500M', status: 'ACTIVE' },
  { name: 'ADNOC Refinery Expansion', location: 'Ruwais, UAE', type: 'Industrial BIM', value: 'AED 800M', status: 'DELIVERED' },
  { name: 'Dubai Creek Harbour', location: 'Dubai, UAE', type: 'Mixed-Use BIM', value: 'AED 1.2B', status: 'ACTIVE' },
  { name: 'Riyadh Metro Extension', location: 'Riyadh, KSA', type: 'Infrastructure', value: 'SAR 3.1B', status: 'DELIVERED' },
  { name: 'Lusail Smart City', location: 'Doha, Qatar', type: 'Smart City BIM', value: 'QAR 900M', status: 'ACTIVE' },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '',
    projectType: '', projectValue: '', message: ''
  });
  const [formStatus, setFormStatus] = useState(null); // null | 'sending' | 'success' | 'error'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      const res = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', company: '', email: '', phone: '', projectType: '', projectValue: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div style={{ background: '#0a0c0f', color: '#e8e0d0', fontFamily: "'Rajdhani', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { scroll-behavior: smooth; }
        .orbitron { font-family: 'Orbitron', monospace; }
        .glow-olive { text-shadow: 0 0 20px rgba(107,142,35,0.8), 0 0 40px rgba(107,142,35,0.4); }
        .glow-gold { text-shadow: 0 0 20px rgba(212,175,55,0.8), 0 0 40px rgba(212,175,55,0.4); }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(107,142,35,0.2); }
        .btn-primary { background: linear-gradient(135deg, #6b8e23, #4a6318); color: #fff; border: 1px solid #6b8e23; padding: 14px 32px; font-family: 'Orbitron', monospace; font-size: 13px; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: linear-gradient(135deg, #7fa028, #5a7520); box-shadow: 0 0 20px rgba(107,142,35,0.5); transform: translateY(-2px); }
        .btn-outline { background: transparent; color: #d4af37; border: 1px solid #d4af37; padding: 14px 32px; font-family: 'Orbitron', monospace; font-size: 13px; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-outline:hover { background: rgba(212,175,55,0.1); box-shadow: 0 0 20px rgba(212,175,55,0.3); transform: translateY(-2px); }
        .scanline { position: relative; overflow: hidden; }
        .scanline::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px); pointer-events: none; }
        .service-card { transition: all 0.3s; }
        .service-card:hover { transform: translateY(-6px); border-color: rgba(107,142,35,0.6) !important; box-shadow: 0 0 30px rgba(107,142,35,0.2); }
        .project-card:hover { border-color: rgba(212,175,55,0.5) !important; background: rgba(212,175,55,0.05) !important; }
        input, select, textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(107,142,35,0.3); color: #e8e0d0; padding: 12px 16px; font-family: 'Rajdhani', sans-serif; font-size: 15px; width: 100%; outline: none; transition: border-color 0.3s; }
        input:focus, select:focus, textarea:focus { border-color: #6b8e23; box-shadow: 0 0 10px rgba(107,142,35,0.2); }
        input::placeholder, textarea::placeholder { color: rgba(232,224,208,0.4); }
        select option { background: #1a1f14; }
        nav a { color: #b8b0a0; text-decoration: none; font-size: 13px; letter-spacing: 1px; transition: color 0.3s; }
        nav a:hover { color: #6b8e23; }
        @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }
        @keyframes hero-glow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .hero-badge { animation: pulse-dot 2s infinite; }
        .hero-icon { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,12,15,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(107,142,35,0.2)' : 'none',
        transition: 'all 0.3s', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#6b8e23,#4a6318)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⬡</div>
          <div>
            <div className="orbitron" style={{ fontSize: '14px', fontWeight: 700, color: '#6b8e23', letterSpacing: '2px' }}>DATUM</div>
            <div style={{ fontSize: '9px', color: '#888', letterSpacing: '3px' }}>STUDIOS</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {['Services', 'Projects', 'About', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="orbitron" style={{ fontSize: '11px', letterSpacing: '2px' }}>{item}</a>
          ))}
          <Link href="/login" className="btn-primary" style={{ padding: '10px 24px', fontSize: '11px' }}>LOGIN →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="scanline" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(107,142,35,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.05) 0%, transparent 50%), #0a0c0f',
        padding: '120px 40px 80px', textAlign: 'center', position: 'relative'
      }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(107,142,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(107,142,35,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <div className="hero-badge" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b8e23' }} />
            <span className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px' }}>DATUM STUDIOS ENGINEERING CONSULTANCY</span>
            <div className="hero-badge" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b8e23' }} />
          </div>

          <h1 className="orbitron glow-olive" style={{ fontSize: 'clamp(36px,6vw,80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', color: '#fff' }}>
            ENGINEERING THE<br />
            <span style={{ color: '#6b8e23' }}>FUTURE OF BIM</span>
          </h1>

          <p style={{ fontSize: '18px', color: '#b8b0a0', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            ISO 19650-certified BIM consultancy delivering precision engineering, AI-powered coordination, and digital construction excellence across the GCC.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#contact" className="btn-primary">START YOUR PROJECT</a>
            <a href="#services" className="btn-outline">EXPLORE SERVICES</a>
          </div>

          {/* Floating HUD elements */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '60px', flexWrap: 'wrap' }}>
            {[
              { label: 'ISO 19650', sub: 'CERTIFIED' },
              { label: 'BIM LEVEL 2', sub: 'COMPLIANT' },
              { label: 'GCC REGION', sub: 'COVERAGE' },
            ].map(({ label, sub }) => (
              <div key={label} className="glass" style={{ padding: '12px 24px', textAlign: 'center' }}>
                <div className="orbitron" style={{ fontSize: '13px', color: '#6b8e23', letterSpacing: '2px' }}>{label}</div>
                <div style={{ fontSize: '10px', color: '#888', letterSpacing: '3px', marginTop: '4px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'rgba(107,142,35,0.08)', borderTop: '1px solid rgba(107,142,35,0.2)', borderBottom: '1px solid rgba(107,142,35,0.2)', padding: '48px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { value: 150, suffix: '+', label: 'PROJECTS DELIVERED' },
            { value: 12, suffix: '+', label: 'YEARS EXPERIENCE' },
            { value: 98, suffix: '%', label: 'CLIENT SATISFACTION' },
            { value: 50, suffix: '+', label: 'BIM SPECIALISTS' },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <div className="orbitron glow-gold" style={{ fontSize: '48px', fontWeight: 900, color: '#d4af37' }}>
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <div style={{ fontSize: '11px', color: '#888', letterSpacing: '3px', marginTop: '8px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// CAPABILITIES</div>
          <h2 className="orbitron" style={{ fontSize: 'clamp(28px,4vw,48px)', color: '#fff', marginBottom: '16px' }}>OUR <span style={{ color: '#6b8e23' }}>SERVICES</span></h2>
          <p style={{ color: '#888', maxWidth: '500px', margin: '0 auto' }}>End-to-end BIM and engineering services for the most demanding construction projects in the region.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '24px' }}>
          {SERVICES.map(({ icon, title, desc, tags }) => (
            <div key={title} className="glass service-card" style={{ padding: '32px', borderRadius: '2px' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
              <h3 className="orbitron" style={{ fontSize: '16px', color: '#d4af37', marginBottom: '12px', letterSpacing: '1px' }}>{title}</h3>
              <p style={{ color: '#b8b0a0', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(107,142,35,0.15)', border: '1px solid rgba(107,142,35,0.3)', color: '#6b8e23', padding: '4px 10px', fontSize: '11px', letterSpacing: '1px' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(107,142,35,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// PORTFOLIO</div>
            <h2 className="orbitron" style={{ fontSize: 'clamp(28px,4vw,48px)', color: '#fff' }}>FEATURED <span style={{ color: '#6b8e23' }}>PROJECTS</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
            {PROJECTS.map(({ name, location, type, value, status }) => (
              <div key={name} className="glass project-card" style={{ padding: '28px', transition: 'all 0.3s', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{
                    background: status === 'ACTIVE' ? 'rgba(107,142,35,0.2)' : 'rgba(100,100,100,0.2)',
                    border: `1px solid ${status === 'ACTIVE' ? '#6b8e23' : '#555'}`,
                    color: status === 'ACTIVE' ? '#6b8e23' : '#888',
                    padding: '3px 10px', fontSize: '10px', letterSpacing: '2px'
                  }}>{status}</span>
                  <span style={{ color: '#d4af37', fontSize: '13px', fontWeight: 600 }}>{value}</span>
                </div>
                <h3 style={{ fontSize: '17px', color: '#fff', marginBottom: '8px', fontWeight: 600 }}>{name}</h3>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>📍 {location}</p>
                <p style={{ color: '#6b8e23', fontSize: '12px', letterSpacing: '1px' }}>{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// ABOUT US</div>
            <h2 className="orbitron" style={{ fontSize: 'clamp(24px,3vw,40px)', color: '#fff', marginBottom: '24px', lineHeight: 1.2 }}>
              PRECISION ENGINEERING<br /><span style={{ color: '#6b8e23' }}>SINCE 2012</span>
            </h2>
            <p style={{ color: '#b8b0a0', lineHeight: 1.8, marginBottom: '20px' }}>
              Datum Studios Engineering Consultancy is a leading BIM and engineering firm headquartered in Dubai, UAE. We specialize in delivering ISO 19650-compliant BIM services for the most complex construction projects across the GCC region.
            </p>
            <p style={{ color: '#b8b0a0', lineHeight: 1.8, marginBottom: '32px' }}>
              Our team of 50+ BIM specialists, structural engineers, and MEP coordinators leverage cutting-edge technology — including our proprietary DatumOS AI platform — to deliver projects on time, on budget, and to the highest quality standards.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {['Dubai, UAE', 'Abu Dhabi', 'Riyadh, KSA', 'Doha, Qatar'].map(loc => (
                <span key={loc} className="glass" style={{ padding: '8px 16px', fontSize: '12px', color: '#6b8e23' }}>📍 {loc}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: '🏆', title: 'Award Winning', desc: 'Best BIM Consultancy GCC 2024' },
              { icon: '🔒', title: 'ISO Certified', desc: 'ISO 19650 & ISO 9001:2015' },
              { icon: '🌐', title: 'GCC Coverage', desc: 'UAE, KSA, Qatar, Kuwait, Bahrain' },
              { icon: '⚡', title: 'AI-Powered', desc: 'DatumOS real-time platform' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="glass" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
                <div className="orbitron" style={{ fontSize: '12px', color: '#d4af37', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / LEAD FORM ── */}
      <section id="contact" style={{ padding: '100px 40px', background: 'rgba(107,142,35,0.04)', borderTop: '1px solid rgba(107,142,35,0.15)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="orbitron" style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '16px' }}>// GET IN TOUCH</div>
            <h2 className="orbitron" style={{ fontSize: 'clamp(24px,3vw,40px)', color: '#fff', marginBottom: '16px' }}>
              START YOUR <span style={{ color: '#6b8e23' }}>PROJECT</span>
            </h2>
            <p style={{ color: '#888' }}>Tell us about your project and our team will respond within 24 hours.</p>
          </div>

          {formStatus === 'success' ? (
            <div className="glass" style={{ padding: '48px', textAlign: 'center', borderColor: 'rgba(107,142,35,0.5)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h3 className="orbitron" style={{ color: '#6b8e23', marginBottom: '12px' }}>INQUIRY RECEIVED</h3>
              <p style={{ color: '#b8b0a0' }}>Our team will contact you within 24 hours. Thank you for choosing Datum Studios.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass" style={{ padding: '48px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>FULL NAME *</label>
                  <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>COMPANY *</label>
                  <input required value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Aldar Properties" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>EMAIL *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>PHONE</label>
                  <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+971 50 123 4567" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>PROJECT TYPE</label>
                  <select value={formData.projectType} onChange={e => setFormData(p => ({ ...p, projectType: e.target.value }))}>
                    <option value="">Select type...</option>
                    <option>BIM Coordination</option>
                    <option>Structural Engineering</option>
                    <option>MEP Engineering</option>
                    <option>ISO 19650 Compliance</option>
                    <option>AI Project Management</option>
                    <option>Full BIM Package</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>PROJECT VALUE</label>
                  <select value={formData.projectValue} onChange={e => setFormData(p => ({ ...p, projectValue: e.target.value }))}>
                    <option value="">Select range...</option>
                    <option>Under AED 10M</option>
                    <option>AED 10M – 50M</option>
                    <option>AED 50M – 200M</option>
                    <option>AED 200M – 1B</option>
                    <option>Over AED 1B</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>MESSAGE</label>
                <textarea rows={4} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your project requirements, timeline, and any specific BIM deliverables needed..." style={{ resize: 'vertical' }} />
              </div>
              {formStatus === 'error' && (
                <p style={{ color: '#ff6b6b', marginBottom: '16px', fontSize: '13px' }}>⚠️ Something went wrong. Please try again or email us directly.</p>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%', border: 'none', fontSize: '14px' }} disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? '⟳ SENDING...' : 'SUBMIT INQUIRY →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060809', borderTop: '1px solid rgba(107,142,35,0.2)', padding: '60px 40px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#6b8e23,#4a6318)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⬡</div>
                <span className="orbitron" style={{ color: '#6b8e23', fontSize: '14px', letterSpacing: '2px' }}>DATUM STUDIOS</span>
              </div>
              <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.7 }}>ISO 19650-certified BIM consultancy delivering precision engineering across the GCC.</p>
            </div>
            <div>
              <h4 className="orbitron" style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>SERVICES</h4>
              {['BIM Coordination', 'Structural Engineering', 'MEP Engineering', 'ISO 19650', 'AI Project Mgmt'].map(s => (
                <div key={s} style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{s}</div>
              ))}
            </div>
            <div>
              <h4 className="orbitron" style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>CONTACT</h4>
              <div style={{ color: '#666', fontSize: '13px', lineHeight: 2 }}>
                <div>📍 Dubai, UAE</div>
                <div>📞 +971 4 123 4567</div>
                <div>📧 info@datum-bim.com</div>
                <div>🌐 www.datum-bim.com</div>
              </div>
            </div>
            <div>
              <h4 className="orbitron" style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>FOLLOW US</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com' },
                  { icon: '📸', label: 'Instagram', url: 'https://instagram.com' },
                  { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
                  { icon: '▶️', label: 'YouTube', url: 'https://youtube.com' },
                  { icon: '💬', label: 'WhatsApp', url: 'https://wa.me/971501234567' },
                ].map(({ icon, label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    style={{ width: '40px', height: '40px', background: 'rgba(107,142,35,0.1)', border: '1px solid rgba(107,142,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', textDecoration: 'none', transition: 'all 0.3s' }}
                    title={label}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(107,142,35,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ color: '#444', fontSize: '12px' }}>© 2026 Datum Studios Engineering Consultancy. All rights reserved.</span>
            <Link href="/login" style={{ color: '#6b8e23', fontSize: '12px', textDecoration: 'none', letterSpacing: '1px' }}>CLIENT PORTAL →</Link>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOATING BUTTON ── */}
      <a href="https://wa.me/971501234567" target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '90px', right: '24px', zIndex: 999, width: '56px', height: '56px', background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', textDecoration: 'none', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat on WhatsApp">
        💬
      </a>

      {/* ── EXIT-INTENT POPUP ── */}
      {showExitPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0f1410', border: '1px solid rgba(107,142,35,0.4)', maxWidth: '480px', width: '100%', padding: '48px', position: 'relative', boxShadow: '0 0 60px rgba(107,142,35,0.2)' }}>
            <button onClick={() => setShowExitPopup(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            {exitSubmitted ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 className="orbitron" style={{ color: '#6b8e23', marginBottom: '8px' }}>SENT!</h3>
                <p style={{ color: '#888' }}>Check your inbox for the BIM Capability Statement.</p>
              </div>
            ) : (
              <>
                <div className="orbitron" style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '12px' }}>// FREE DOWNLOAD</div>
                <h2 className="orbitron" style={{ fontSize: '22px', color: '#fff', marginBottom: '12px', lineHeight: 1.3 }}>
                  GET OUR FREE<br /><span style={{ color: '#6b8e23' }}>BIM CAPABILITY STATEMENT</span>
                </h2>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                  Download our 12-page BIM Capability Statement — ISO 19650 compliance, project portfolio, team credentials, and service packages.
                </p>
                <form onSubmit={handleExitSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input required type="email" value={exitEmail} onChange={e => setExitEmail(e.target.value)} placeholder="your@email.com"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(107,142,35,0.3)', color: '#e8e0d0', padding: '12px 16px', fontSize: '14px', outline: 'none' }} />
                  <button type="submit" className="btn-primary" style={{ border: 'none', whiteSpace: 'nowrap' }}>SEND →</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── STICKY MOBILE CTA BAR ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 998, background: 'rgba(10,12,15,0.97)', borderTop: '1px solid rgba(107,142,35,0.3)', display: 'flex', padding: '0' }}>
        {[
          { icon: '📞', label: 'Call', href: 'tel:+97141234567', color: '#6b8e23' },
          { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/971501234567', color: '#25d366' },
          { icon: '📧', label: 'Email', href: 'mailto:info@datum-bim.com', color: '#d4af37' },
        ].map(({ icon, label, href, color }) => (
          <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', textDecoration: 'none', color, fontSize: '11px', letterSpacing: '1px', fontFamily: "'Orbitron', monospace", gap: '4px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = `${color}15`}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}