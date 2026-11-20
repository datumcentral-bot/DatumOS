'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS = { DRAFT: '#888', ACTIVE: '#6bcb77', COMPLETED: '#4a9eff', PAUSED: '#ffd166' };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', subject: '', body: '', status: 'DRAFT', targetAudience: '' });

  useEffect(() => { fetchCampaigns(); }, []);

  async function fetchCampaigns() {
    setLoading(true);
    const r = await fetch('/api/campaigns');
    if (r.ok) setCampaigns(await r.json());
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function saveCampaign() {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/campaigns/${editing.id}` : '/api/campaigns';
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (r.ok) { fetchCampaigns(); setShowModal(false); setEditing(null); setForm({ name: '', subject: '', body: '', status: 'DRAFT', targetAudience: '' }); showToast(editing ? 'Campaign updated' : 'Campaign created'); }
  }

  async function deleteCampaign(id) {
    if (!confirm('Delete this campaign?')) return;
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    fetchCampaigns(); showToast('Campaign deleted');
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ name: c.name, subject: c.subject || '', body: c.body || '', status: c.status, targetAudience: c.targetAudience || '' });
    setShowModal(true);
  }

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
  const totalOpen = campaigns.reduce((s, c) => s + c.openCount, 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpen / totalSent) * 100) : 0;

  return (
    <div style={{ padding: 24, background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#6bcb77', color: '#000', padding: '10px 20px', borderRadius: 6, zIndex: 9999, fontFamily: 'Rajdhani', fontWeight: 700 }}>✓ {toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, color: 'var(--primary-bright)', margin: 0 }}>CAMPAIGNS</h1>
          <p style={{ fontFamily: 'Rajdhani', color: '#888', margin: '4px 0 0', fontSize: 13 }}>Email marketing & outreach campaigns</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', subject: '', body: '', status: 'DRAFT', targetAudience: '' }); setShowModal(true); }} style={{
          padding: '10px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none',
          borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>+ NEW CAMPAIGN</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL CAMPAIGNS', value: campaigns.length, color: '#4a9eff' },
          { label: 'TOTAL SENT', value: totalSent.toLocaleString(), color: '#6bcb77' },
          { label: 'AVG OPEN RATE', value: `${avgOpenRate}%`, color: '#ffd166' },
          { label: 'ACTIVE', value: campaigns.filter(c => c.status === 'ACTIVE').length, color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-panel)', border: `1px solid ${color}33`, borderRadius: 8, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 10, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontFamily: 'Orbitron', color, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Campaign Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666', fontFamily: 'Rajdhani' }}>Loading campaigns...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map(c => {
            const openRate = c.sentCount > 0 ? Math.round((c.openCount / c.sentCount) * 100) : 0;
            const clickRate = c.sentCount > 0 ? Math.round((c.clickCount / c.sentCount) * 100) : 0;
            return (
              <div key={c.id} style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 16, color: '#e0e0e0', margin: 0 }}>{c.name}</h3>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status], fontFamily: 'Rajdhani', fontWeight: 700 }}>{c.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', fontFamily: 'Rajdhani', marginBottom: 8 }}>{c.subject}</div>
                  <div style={{ fontSize: 11, color: '#666', fontFamily: 'Rajdhani' }}>Target: {c.targetAudience || 'All Contacts'}</div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 24 }}>
                  {[
                    { label: 'SENT', value: c.sentCount, color: '#4a9eff' },
                    { label: 'OPENS', value: `${c.openCount} (${openRate}%)`, color: '#6bcb77' },
                    { label: 'CLICKS', value: `${c.clickCount} (${clickRate}%)`, color: '#ffd166' },
                    { label: 'REPLIES', value: c.replyCount, color: '#a78bfa' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 16, fontFamily: 'Orbitron', color, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '6px 14px', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 6, color: '#4a9eff', fontFamily: 'Rajdhani', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteCampaign(c.id)} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontFamily: 'Rajdhani', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 12, padding: 28, width: 560, boxShadow: '0 0 40px rgba(74,158,255,0.15)' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--primary-bright)', marginBottom: 20 }}>{editing ? 'EDIT CAMPAIGN' : 'NEW CAMPAIGN'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Campaign Name', key: 'name', type: 'text' },
                { label: 'Email Subject', key: 'subject', type: 'text' },
                { label: 'Target Audience', key: 'targetAudience', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>STATUS</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13 }}>
                  {['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>EMAIL BODY</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={5} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} placeholder="Use {name}, {company}, {project} as variables..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #444', borderRadius: 6, color: '#888', fontFamily: 'Rajdhani', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveCampaign} style={{ padding: '8px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
