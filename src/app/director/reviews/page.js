'use client';
import { useState, useEffect } from 'react';

function Stars({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= rating ? '#ffd166' : '#333' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [data, setData] = useState({ reviews: [], averageRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ clientName: '', projectName: '', rating: 5, content: '', status: 'PUBLISHED' });

  useEffect(() => { fetchReviews(); }, []);

  async function fetchReviews() {
    setLoading(true);
    const r = await fetch('/api/reviews');
    if (r.ok) setData(await r.json());
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function saveReview() {
    const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (r.ok) { fetchReviews(); setShowModal(false); setForm({ clientName: '', projectName: '', rating: 5, content: '', status: 'PUBLISHED' }); showToast('Review added'); }
  }

  async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    fetchReviews(); showToast('Review deleted');
  }

  const filtered = filter === 'ALL' ? data.reviews : data.reviews.filter(r => r.status === filter);
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: data.reviews.filter(rv => rv.rating === r).length }));

  return (
    <div style={{ padding: 24, background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#6bcb77', color: '#000', padding: '10px 20px', borderRadius: 6, zIndex: 9999, fontFamily: 'Rajdhani', fontWeight: 700 }}>✓ {toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, color: 'var(--primary-bright)', margin: 0 }}>REPUTATION & REVIEWS</h1>
          <p style={{ fontFamily: 'Rajdhani', color: '#888', margin: '4px 0 0', fontSize: 13 }}>Client testimonials and satisfaction scores</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ ADD REVIEW</button>
      </div>

      {/* Score Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,209,102,0.3)', borderRadius: 10, padding: 24, textAlign: 'center', boxShadow: '0 0 20px rgba(255,209,102,0.05)' }}>
          <div style={{ fontSize: 64, fontFamily: 'Orbitron', color: '#ffd166', fontWeight: 700, lineHeight: 1 }}>{data.averageRating}</div>
          <Stars rating={Math.round(data.averageRating)} size={24} />
          <div style={{ fontSize: 12, color: '#888', fontFamily: 'Rajdhani', marginTop: 8 }}>Based on {data.total} reviews</div>
          <div style={{ marginTop: 16 }}>
            {ratingDist.map(({ rating, count }) => (
              <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#ffd166', fontFamily: 'Rajdhani', width: 12 }}>{rating}</span>
                <span style={{ fontSize: 12, color: '#ffd166' }}>★</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${data.total > 0 ? (count / data.total) * 100 : 0}%`, background: '#ffd166', borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani', width: 16 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'TOTAL REVIEWS', value: data.total, color: '#4a9eff' },
            { label: 'PUBLISHED', value: data.reviews.filter(r => r.status === 'PUBLISHED').length, color: '#6bcb77' },
            { label: 'PENDING', value: data.reviews.filter(r => r.status === 'PENDING').length, color: '#ffd166' },
            { label: '5-STAR REVIEWS', value: data.reviews.filter(r => r.rating === 5).length, color: '#ffd166' },
            { label: 'AVG RATING', value: `${data.averageRating}/5`, color: '#a78bfa' },
            { label: 'RECOMMEND RATE', value: `${data.total > 0 ? Math.round((data.reviews.filter(r => r.rating >= 4).length / data.total) * 100) : 0}%`, color: '#6bcb77' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg-panel)', border: `1px solid ${color}33`, borderRadius: 8, padding: '16px', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontFamily: 'Orbitron', color, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['ALL', 'PUBLISHED', 'PENDING', 'HIDDEN'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
            background: filter === f ? 'var(--primary-glow)' : 'transparent',
            color: filter === f ? '#000' : 'var(--primary-bright)',
            border: '1px solid var(--primary-glow)', borderRadius: 6, cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>

      {/* Review Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666', fontFamily: 'Rajdhani' }}>Loading reviews...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {filtered.map(review => (
            <div key={review.id} style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,209,102,0.15)', borderRadius: 10, padding: 20, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: `hsl(${review.clientName.charCodeAt(0) * 7 % 360}, 40%, 30%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff',
                    border: '2px solid rgba(255,209,102,0.3)',
                  }}>{review.clientName[0]}</div>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 14, color: '#e0e0e0' }}>{review.clientName}</div>
                    <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani' }}>{review.projectName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Stars rating={review.rating} size={14} />
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: review.status === 'PUBLISHED' ? '#6bcb7722' : '#ffd16622', color: review.status === 'PUBLISHED' ? '#6bcb77' : '#ffd166', fontFamily: 'Rajdhani', fontWeight: 700 }}>{review.status}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#c0c0c0', fontFamily: 'Rajdhani', lineHeight: 1.6, margin: '0 0 12px', fontStyle: 'italic' }}>"{review.content}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#666', fontFamily: 'Rajdhani' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                <button onClick={() => deleteReview(review.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, color: '#ef4444', fontFamily: 'Rajdhani', fontSize: 11, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,209,102,0.3)', borderRadius: 12, padding: 28, width: 500, boxShadow: '0 0 40px rgba(255,209,102,0.1)' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#ffd166', marginBottom: 20 }}>ADD REVIEW</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Client Name', key: 'clientName', type: 'text' },
                { label: 'Project Name', key: 'projectName', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 8 }}>RATING</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setForm(f => ({ ...f, rating: r }))} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: r <= form.rating ? '#ffd166' : '#333', transition: 'color 0.2s' }}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>REVIEW CONTENT</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #444', borderRadius: 6, color: '#888', fontFamily: 'Rajdhani', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveReview} style={{ padding: '8px 20px', background: '#ffd166', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
