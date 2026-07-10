'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS = { ACTIVE: '#6bcb77', PAUSED: '#ffd166', DRAFT: '#888' };

const TEMPLATES = [
  { id: 't1', icon: '💬', title: 'New Lead → WhatsApp Notification', trigger: 'New Lead Created', action: 'Send WhatsApp Message', category: 'SOCIAL', desc: 'Instantly notify your sales team on WhatsApp when a new lead is captured from any source.' },
  { id: 't2', icon: '📧', title: 'Lead Qualified → Email Drip Sequence', trigger: 'Lead Status = QUALIFIED', action: 'Start Email Drip Campaign', category: 'EMAIL', desc: 'Automatically enroll qualified leads into a 5-email nurture sequence over 14 days.' },
  { id: 't3', icon: '⚡', title: 'Clash Detected → Slack Alert', trigger: 'New Clash Detected', action: 'Post to Slack Channel', category: 'COMMUNICATION', desc: 'Alert the BIM coordination team on Slack immediately when a new clash is detected.' },
  { id: 't4', icon: '🔗', title: 'Form Submitted → Zapier Webhook', trigger: 'Form Submission Received', action: 'Trigger Zapier Webhook', category: 'AUTOMATION', desc: 'Send form submission data to Zapier to trigger any downstream workflow or CRM update.' },
  { id: 't5', icon: '📅', title: 'New Appointment → Calendar Invite', trigger: 'Appointment Created', action: 'Send Google Calendar Invite', category: 'CALENDAR', desc: 'Automatically send a Google Calendar invite to the client when an appointment is booked.' },
  { id: 't6', icon: '⭐', title: 'Review Received → LinkedIn Post', trigger: '5-Star Review Received', action: 'Draft LinkedIn Post', category: 'SOCIAL', desc: 'When a 5-star review is received, auto-draft a LinkedIn testimonial post for approval.' },
  { id: 't7', icon: '🏗️', title: 'Project Milestone → Client Email', trigger: 'Project Milestone Completed', action: 'Send Client Update Email', category: 'EMAIL', desc: 'Automatically email the client with a milestone completion report and next steps.' },
  { id: 't8', icon: '💼', title: 'New Lead → LinkedIn DM Draft', trigger: 'New Lead from LinkedIn', action: 'Draft LinkedIn DM', category: 'SOCIAL', desc: 'When a LinkedIn lead comes in, auto-draft a personalized connection message for review.' },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchAutomations(); }, []);

  async function fetchAutomations() {
    setLoading(true);
    const r = await fetch('/api/automations');
    if (r.ok) setAutomations(await r.json());
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function toggleStatus(a) {
    const newStatus = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const r = await fetch(`/api/automations/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    if (r.ok) { fetchAutomations(); showToast(`Automation ${newStatus.toLowerCase()}`); }
  }

  const totalExecutions = automations.reduce((s, a) => s + a.executionCount, 0);
  const activeCount = automations.filter(a => a.status === 'ACTIVE').length;

  return (
    <div style={{ padding: 24, background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#6bcb77', color: '#000', padding: '10px 20px', borderRadius: 6, zIndex: 9999, fontFamily: 'Rajdhani', fontWeight: 700 }}>✓ {toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, color: 'var(--primary-bright)', margin: 0 }}>AUTOMATIONS</h1>
          <p style={{ fontFamily: 'Rajdhani', color: '#888', margin: '4px 0 0', fontSize: 13 }}>Workflow automation — trigger → action sequences</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ NEW AUTOMATION</button>
      </div>

      {/* Templates */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#d4af37', letterSpacing: 2 }}>⚡ PRE-BUILT TEMPLATES</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.15)' }} />
          <span style={{ fontSize: 11, color: '#555' }}>{TEMPLATES.length} templates</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {TEMPLATES.map(t => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)', padding: '16px', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.background = 'rgba(212,175,55,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#e8e0d0', letterSpacing: 1, lineHeight: 1.4 }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: '#6b8e23', letterSpacing: 1, marginTop: 3 }}>{t.category}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#777', lineHeight: 1.5, marginBottom: 10 }}>{t.desc}</p>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>
                <span style={{ color: '#4a9eff' }}>TRIGGER:</span> {t.trigger} → <span style={{ color: '#6bcb77' }}>ACTION:</span> {t.action}
              </div>
              <button onClick={() => showToast(`Template "${t.title}" added to automations!`)} style={{ background: 'rgba(107,142,35,0.15)', border: '1px solid rgba(107,142,35,0.3)', color: '#6b8e23', padding: '5px 14px', fontSize: 10, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Orbitron' }}>
                + USE TEMPLATE
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL AUTOMATIONS', value: automations.length, color: '#4a9eff' },
          { label: 'ACTIVE', value: activeCount, color: '#6bcb77' },
          { label: 'TOTAL EXECUTIONS', value: totalExecutions.toLocaleString(), color: '#ffd166' },
          { label: 'PAUSED', value: automations.filter(a => a.status === 'PAUSED').length, color: '#888' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-panel)', border: `1px solid ${color}33`, borderRadius: 8, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 10, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontFamily: 'Orbitron', color, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Automation Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666', fontFamily: 'Rajdhani' }}>Loading automations...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {automations.map(a => {
            let actions = [];
            try { actions = JSON.parse(a.actions || '[]'); } catch {}
            return (
              <div key={a.id} style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, padding: '20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: `3px solid ${STATUS_COLORS[a.status]}` }} onClick={() => setSelected(selected?.id === a.id ? null : a)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 16, color: '#e0e0e0', margin: 0 }}>{a.name}</h3>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${STATUS_COLORS[a.status]}22`, color: STATUS_COLORS[a.status], fontFamily: 'Rajdhani', fontWeight: 700 }}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888', fontFamily: 'Rajdhani' }}>{a.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1 }}>EXECUTIONS</div>
                      <div style={{ fontSize: 18, fontFamily: 'Orbitron', color: '#4a9eff', fontWeight: 700 }}>{a.executionCount}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); toggleStatus(a); }} style={{
                      padding: '6px 14px', background: a.status === 'ACTIVE' ? 'rgba(255,209,102,0.1)' : 'rgba(107,203,119,0.1)',
                      border: `1px solid ${a.status === 'ACTIVE' ? '#ffd166' : '#6bcb77'}44`,
                      borderRadius: 6, color: a.status === 'ACTIVE' ? '#ffd166' : '#6bcb77',
                      fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>{a.status === 'ACTIVE' ? 'PAUSE' : 'ACTIVATE'}</button>
                  </div>
                </div>

                {/* Trigger → Action Flow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Trigger */}
                  <div style={{ padding: '6px 14px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 6, fontSize: 11, color: '#a78bfa', fontFamily: 'Rajdhani', fontWeight: 700 }}>
                    ⚡ TRIGGER: {a.trigger}
                  </div>
                  <div style={{ color: '#4a9eff', fontSize: 16 }}>→</div>
                  {/* Actions */}
                  {actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ padding: '6px 12px', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: 6, fontSize: 11, color: '#4a9eff', fontFamily: 'Rajdhani', fontWeight: 600 }}>
                        {action.type === 'SEND_EMAIL' ? '📧' : action.type === 'CREATE_TASK' ? '✅' : action.type === 'WAIT' ? '⏱️' : action.type === 'NOTIFY' ? '🔔' : action.type === 'CREATE_NOTIFICATION' ? '🔔' : '⚙️'} {action.type.replace(/_/g, ' ')}
                      </div>
                      {i < actions.length - 1 && <div style={{ color: '#4a9eff', fontSize: 14 }}>→</div>}
                    </div>
                  ))}
                </div>

                {/* Expanded Detail */}
                {selected?.id === a.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(74,158,255,0.1)' }}>
                    <div style={{ fontSize: 10, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 10 }}>ACTION STEPS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {actions.map((action, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(74,158,255,0.2)', border: '1px solid rgba(74,158,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Orbitron', color: '#4a9eff', flexShrink: 0 }}>{i + 1}</div>
                          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 12px', flex: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700, color: '#c0c0c0', marginBottom: 2 }}>{action.type.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani' }}>
                              {action.template && `Template: ${action.template}`}
                              {action.duration && `Wait: ${action.duration}`}
                              {action.title && `Task: ${action.title}`}
                              {action.message && action.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {a.lastExecutedAt && (
                      <div style={{ marginTop: 10, fontSize: 11, color: '#666', fontFamily: 'Rajdhani' }}>
                        Last executed: {new Date(a.lastExecutedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}