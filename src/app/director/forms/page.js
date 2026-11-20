'use client';
import { useState, useEffect } from 'react';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchForms(); }, []);
  useEffect(() => { if (selected) fetchSubmissions(selected.id); }, [selected]);

  async function fetchForms() {
    setLoading(true);
    const r = await fetch('/api/forms');
    if (r.ok) setForms(await r.json());
    setLoading(false);
  }

  async function fetchSubmissions(id) {
    const r = await fetch(`/api/forms/${id}/submissions`);
    if (r.ok) setSubmissions(await r.json());
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const totalSubmissions = forms.reduce((s, f) => s + f.submissionCount, 0);

  return (
    <div style={{ padding: 24, background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#6bcb77', color: '#000', padding: '10px 20px', borderRadius: 6, zIndex: 9999, fontFamily: 'Rajdhani', fontWeight: 700 }}>✓ {toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, color: 'var(--primary-bright)', margin: 0 }}>FORMS & SURVEYS</h1>
          <p style={{ fontFamily: 'Rajdhani', color: '#888', margin: '4px 0 0', fontSize: 13 }}>Client intake forms, assessments, and surveys</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ NEW FORM</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL FORMS', value: forms.length, color: '#4a9eff' },
          { label: 'TOTAL SUBMISSIONS', value: totalSubmissions, color: '#6bcb77' },
          { label: 'ACTIVE FORMS', value: forms.filter(f => f.status === 'ACTIVE').length, color: '#ffd166' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-panel)', border: `1px solid ${color}33`, borderRadius: 8, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 10, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontFamily: 'Orbitron', color, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Form List */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(74,158,255,0.15)', fontFamily: 'Orbitron', fontSize: 11, color: 'var(--primary-bright)', letterSpacing: 1 }}>FORM LIBRARY</div>
          {loading ? (
            <div style={{ padding: 20, color: '#666', fontFamily: 'Rajdhani', textAlign: 'center' }}>Loading...</div>
          ) : forms.map(f => (
            <div key={f.id} onClick={() => setSelected(f)} style={{
              padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(74,158,255,0.08)',
              background: selected?.id === f.id ? 'rgba(74,158,255,0.1)' : 'transparent',
              borderLeft: selected?.id === f.id ? '3px solid var(--primary-bright)' : '3px solid transparent',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 14, color: '#e0e0e0' }}>{f.name}</div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: f.status === 'ACTIVE' ? '#6bcb7722' : '#88888822', color: f.status === 'ACTIVE' ? '#6bcb77' : '#888', fontFamily: 'Rajdhani', fontWeight: 700 }}>{f.status}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani', marginTop: 4 }}>{f.description}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#4a9eff', fontFamily: 'Rajdhani' }}>📋 {f.submissionCount} submissions</span>
                <span style={{ fontSize: 11, color: '#666', fontFamily: 'Rajdhani' }}>
                  {f.fields ? JSON.parse(f.fields).length : 0} fields
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submissions Panel */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(74,158,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--primary-bright)', letterSpacing: 1 }}>{selected.name.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani', marginTop: 2 }}>{submissions.length} submissions</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: '6px 14px', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 6, color: '#4a9eff', fontFamily: 'Rajdhani', fontSize: 12, cursor: 'pointer' }}>Export CSV</button>
                  <button style={{ padding: '6px 14px', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 6, color: '#4a9eff', fontFamily: 'Rajdhani', fontSize: 12, cursor: 'pointer' }}>Share Link</button>
                </div>
              </div>

              {/* Fields Preview */}
              {selected.fields && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(74,158,255,0.08)', background: 'rgba(74,158,255,0.03)' }}>
                  <div style={{ fontSize: 10, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 8 }}>FORM FIELDS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {JSON.parse(selected.fields).map(field => (
                      <span key={field.id} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'rgba(74,158,255,0.1)', color: '#4a9eff', fontFamily: 'Rajdhani', border: '1px solid rgba(74,158,255,0.2)' }}>
                        {field.label} {field.required ? '*' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions */}
              <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                {submissions.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#666', fontFamily: 'Rajdhani' }}>No submissions yet</div>
                ) : submissions.map((sub, i) => {
                  let data = {};
                  try { data = JSON.parse(sub.data || '{}'); } catch {}
                  return (
                    <div key={sub.id} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(74,158,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#4a9eff' }}>SUBMISSION #{i + 1}</span>
                        <span style={{ fontSize: 11, color: '#666', fontFamily: 'Rajdhani' }}>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {Object.entries(data).map(([key, val]) => (
                          <div key={key} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4, padding: '6px 10px' }}>
                            <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 2 }}>{key.toUpperCase()}</div>
                            <div style={{ fontSize: 12, color: '#c0c0c0', fontFamily: 'Rajdhani' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 40 }}>📋</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--primary-bright)' }}>SELECT A FORM</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#666' }}>Choose a form to view submissions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
