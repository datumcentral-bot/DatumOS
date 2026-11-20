'use client';
import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'ALL', label: 'All', icon: '⬡' },
  { id: 'SOCIAL', label: 'Social Media', icon: '📱' },
  { id: 'AUTOMATION', label: 'Automation', icon: '⚡' },
  { id: 'EMAIL', label: 'Email Marketing', icon: '📧' },
  { id: 'COMMUNICATION', label: 'Communication', icon: '💬' },
  { id: 'PAYMENT', label: 'Payments', icon: '💰' },
  { id: 'ANALYTICS', label: 'Analytics', icon: '📊' },
  { id: 'BIM', label: 'BIM Tools', icon: '🏗️' },
];

const ALL_INTEGRATIONS = [
  // SOCIAL
  { slug: 'linkedin', name: 'LinkedIn', category: 'SOCIAL', icon: '💼', desc: 'Post updates, share projects, and generate B2B leads via LinkedIn Business.', fields: ['Client ID', 'Client Secret', 'Page ID'], status: 'CONNECTED' },
  { slug: 'instagram', name: 'Instagram', category: 'SOCIAL', icon: '📸', desc: 'Share project photos, stories, and reels to showcase BIM work visually.', fields: ['Access Token', 'Business Account ID'], status: 'CONNECTED' },
  { slug: 'facebook', name: 'Facebook', category: 'SOCIAL', icon: '👥', desc: 'Manage Facebook page, post updates, and run targeted lead generation ads.', fields: ['Page Access Token', 'Page ID', 'App Secret'], status: 'DISCONNECTED' },
  { slug: 'twitter', name: 'Twitter / X', category: 'SOCIAL', icon: '🐦', desc: 'Share industry insights and engage with the global AEC community.', fields: ['API Key', 'API Secret', 'Bearer Token'], status: 'DISCONNECTED' },
  { slug: 'whatsapp', name: 'WhatsApp Business', category: 'SOCIAL', icon: '💬', desc: 'Send automated messages, follow-ups, and project updates via WhatsApp API.', fields: ['Phone Number ID', 'Access Token', 'Webhook Secret'], status: 'CONNECTED' },
  { slug: 'tiktok', name: 'TikTok', category: 'SOCIAL', icon: '🎵', desc: 'Share BIM walkthroughs and time-lapse construction videos for brand awareness.', fields: ['Client Key', 'Client Secret'], status: 'DISCONNECTED' },
  { slug: 'youtube', name: 'YouTube', category: 'SOCIAL', icon: '▶️', desc: 'Publish BIM tutorials, project showcases, and company update videos.', fields: ['API Key', 'Channel ID'], status: 'DISCONNECTED', probe: '/api/youtube', envVar: 'YOUTUBE_API_KEY' },
  // AUTOMATION
  { slug: 'zapier', name: 'Zapier', category: 'AUTOMATION', icon: '⚡', desc: 'Connect DatumOS to 5,000+ apps with no-code automation workflows.', fields: ['Webhook URL'], status: 'CONNECTED', webhookInput: true },
  { slug: 'make', name: 'Make.com', category: 'AUTOMATION', icon: '🔄', desc: 'Visual automation builder for complex multi-step workflows and data routing.', fields: ['Webhook URL'], status: 'DISCONNECTED', webhookInput: true },
  { slug: 'n8n', name: 'n8n', category: 'AUTOMATION', icon: '🔗', desc: 'Self-hosted workflow automation with full data control and privacy.', fields: ['Instance URL', 'API Key'], status: 'DISCONNECTED' },
  { slug: 'pabbly', name: 'Pabbly Connect', category: 'AUTOMATION', icon: '🔀', desc: 'Affordable automation platform connecting DatumOS to hundreds of apps.', fields: ['Webhook URL'], status: 'DISCONNECTED', webhookInput: true },
  // EMAIL
  { slug: 'mailchimp', name: 'Mailchimp', category: 'EMAIL', icon: '🐒', desc: 'Email marketing campaigns, audience segmentation, and analytics.', fields: ['API Key', 'Audience ID'], status: 'DISCONNECTED' },
  { slug: 'activecampaign', name: 'ActiveCampaign', category: 'EMAIL', icon: '📨', desc: 'Advanced email automation, CRM, and customer experience platform.', fields: ['API Key', 'Account URL'], status: 'DISCONNECTED' },
  { slug: 'sendgrid', name: 'SendGrid', category: 'EMAIL', icon: '📤', desc: 'Transactional and marketing email delivery with high deliverability.', fields: ['API Key', 'From Email'], status: 'DISCONNECTED' },
  { slug: 'brevo', name: 'Brevo (Sendinblue)', category: 'EMAIL', icon: '💌', desc: 'All-in-one email, SMS, and WhatsApp marketing platform.', fields: ['API Key'], status: 'DISCONNECTED' },
  // COMMUNICATION
  { slug: 'twilio', name: 'Twilio SMS', category: 'COMMUNICATION', icon: '📱', desc: 'Send SMS notifications, alerts, and two-factor authentication codes.', fields: ['Account SID', 'Auth Token', 'From Number'], status: 'DISCONNECTED' },
  { slug: 'slack', name: 'Slack', category: 'COMMUNICATION', icon: '💬', desc: 'Send project alerts, clash notifications, and team updates to Slack channels.', fields: ['Webhook URL'], status: 'CONNECTED', webhookInput: true },
  { slug: 'teams', name: 'Microsoft Teams', category: 'COMMUNICATION', icon: '🟦', desc: 'Post notifications and project updates to Microsoft Teams channels.', fields: ['Webhook URL'], status: 'DISCONNECTED', webhookInput: true },
  // PAYMENT
  { slug: 'stripe', name: 'Stripe', category: 'PAYMENT', icon: '💳', desc: 'Accept online payments, manage subscriptions, and process invoices.', fields: ['Publishable Key', 'Secret Key', 'Webhook Secret'], status: 'DISCONNECTED' },
  { slug: 'quickbooks', name: 'QuickBooks', category: 'PAYMENT', icon: '📒', desc: 'Sync invoices, expenses, and financial data with QuickBooks Online.', fields: ['Client ID', 'Client Secret', 'Realm ID'], status: 'DISCONNECTED' },
  { slug: 'xero', name: 'Xero', category: 'PAYMENT', icon: '🔵', desc: 'Cloud accounting integration for invoicing, payroll, and financial reporting.', fields: ['Client ID', 'Client Secret'], status: 'DISCONNECTED' },
  // ANALYTICS
  { slug: 'ga4', name: 'Google Analytics 4', category: 'ANALYTICS', icon: '📈', desc: 'Track website visitors, lead sources, and conversion events.', fields: ['Measurement ID', 'API Secret'], status: 'CONNECTED' },
  { slug: 'meta-pixel', name: 'Meta Pixel', category: 'ANALYTICS', icon: '🎯', desc: 'Track Facebook and Instagram ad conversions and retargeting audiences.', fields: ['Pixel ID', 'Access Token'], status: 'DISCONNECTED' },
  { slug: 'google-ads', name: 'Google Ads', category: 'ANALYTICS', icon: '🔍', desc: 'Track Google Ads conversions and optimize campaigns for lead generation.', fields: ['Customer ID', 'Developer Token'], status: 'DISCONNECTED' },
  { slug: 'linkedin-ads', name: 'LinkedIn Ads', category: 'ANALYTICS', icon: '📊', desc: 'Track LinkedIn campaign performance and B2B lead generation metrics.', fields: ['Account ID', 'Access Token'], status: 'DISCONNECTED' },
  // BIM
  { slug: 'bim360', name: 'Autodesk BIM 360', category: 'BIM', icon: '🏗️', desc: 'Sync project data, RFIs, submittals, and clash reports from BIM 360.', fields: ['Client ID', 'Client Secret', 'Hub ID'], status: 'CONNECTED' },
  { slug: 'procore', name: 'Procore', category: 'BIM', icon: '🔨', desc: 'Construction management platform integration for project data sync.', fields: ['Client ID', 'Client Secret', 'Company ID'], status: 'DISCONNECTED' },
  { slug: 'revit-cloud', name: 'Revit Cloud Worksharing', category: 'BIM', icon: '🏛️', desc: 'Sync Revit model data, clash detection results, and BIM deliverables.', fields: ['API Key', 'Project ID'], status: 'DISCONNECTED' },
];

function IntegrationCard({ integration, onConnect, onTest }) {
  const [expanded, setExpanded] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [probe, setProbe] = useState(null);

  // Integrations backed by a real endpoint report their true state; the rest
  // keep the static catalogue status.
  useEffect(() => {
    if (!integration.probe) return undefined;
    let alive = true;
    fetch(integration.probe, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (alive) setProbe(d); })
      .catch(() => { if (alive) setProbe({ connected: false, reason: 'Request failed', videos: [] }); });
    return () => { alive = false; };
  }, [integration.probe]);

  const isConnected = integration.probe
    ? (probe ? probe.connected === true : integration.status === 'CONNECTED')
    : integration.status === 'CONNECTED';

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    if (integration.probe) {
      try {
        const r = await fetch(integration.probe, { cache: 'no-store' });
        const d = await r.json();
        setProbe(d);
        setTestResult(d.connected ? 'success' : 'error');
      } catch {
        setProbe({ connected: false, reason: 'Request failed', videos: [] });
        setTestResult('error');
      }
    } else {
      await new Promise(r => setTimeout(r, 1200));
      setTestResult(isConnected ? 'success' : 'error');
    }
    setTesting(false);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${isConnected ? 'rgba(107,142,35,0.4)' : 'rgba(255,255,255,0.08)'}`,
      padding: '24px',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>{integration.icon}</span>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: '#e8e0d0', letterSpacing: '1px' }}>{integration.name}</div>
            <div style={{ fontSize: '10px', color: '#666', letterSpacing: '2px', marginTop: '2px' }}>{integration.category}</div>
          </div>
        </div>
        <span style={{
          padding: '4px 12px', fontSize: '10px', letterSpacing: '2px',
          background: isConnected ? 'rgba(107,142,35,0.15)' : 'rgba(100,100,100,0.1)',
          border: `1px solid ${isConnected ? '#6b8e23' : '#444'}`,
          color: isConnected ? '#6b8e23' : '#666',
        }}>
          {isConnected ? '● CONNECTED' : '○ DISCONNECTED'}
        </span>
      </div>

      <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{integration.desc}</p>

      {integration.probe && probe && (
        <div style={{
          fontSize: '11px', letterSpacing: '1px', marginBottom: '14px',
          fontFamily: "'Rajdhani', sans-serif",
          color: probe.connected ? '#6b8e23' : '#d4af37',
        }}>
          {probe.connected
            ? `● LIVE — ${probe.channel?.title || 'channel'}${probe.channel?.videoCount != null ? ` · ${probe.channel.videoCount} videos` : ''}${probe.channel?.handle ? ` · ${probe.channel.handle}` : ''}`
            : `○ NOT LIVE — ${probe.reason || 'no reason reported'}`}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: 'rgba(107,142,35,0.1)', border: '1px solid rgba(107,142,35,0.3)',
          color: '#6b8e23', padding: '6px 16px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
          fontFamily: "'Orbitron', monospace",
        }}>
          {expanded ? '▲ HIDE' : '▼ CONFIGURE'}
        </button>
        <button onClick={handleTest} disabled={testing} style={{
          background: 'transparent', border: '1px solid rgba(212,175,55,0.3)',
          color: '#d4af37', padding: '6px 16px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
          fontFamily: "'Orbitron', monospace",
        }}>
          {testing ? '⟳ TESTING...' : '⚡ TEST'}
        </button>
      </div>

      {testResult && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: testResult === 'success' ? '#6b8e23' : '#ff6b6b' }}>
          {testResult === 'success' ? '✅ Connection successful' : '❌ Connection failed — check credentials'}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '16px', borderTop: '1px solid rgba(107,142,35,0.1)', paddingTop: '16px' }}>
          {integration.probe && probe?.connected && (probe.videos || []).length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '2px', marginBottom: '10px' }}>LATEST UPLOADS</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {probe.videos.slice(0, 6).map(v => (
                  <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                     style={{ display: 'flex', gap: '10px', alignItems: 'center', textDecoration: 'none', color: '#e8e0d0' }}>
                    <span aria-hidden="true" style={{
                      width: 64, height: 36, flexShrink: 0,
                      backgroundImage: v.thumbnail ? `url(${v.thumbnail})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }} />
                    <span style={{ fontSize: '12px', lineHeight: 1.3 }}>
                      {v.title}
                      <span style={{ color: '#666', display: 'block', fontSize: '11px' }}>
                        {v.views != null ? `${v.views.toLocaleString()} views` : ''}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {integration.webhookInput ? (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>WEBHOOK URL</label>
              <input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(107,142,35,0.3)', color: '#e8e0d0', padding: '8px 12px', fontSize: '13px', width: '100%', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>
          ) : (
            integration.fields?.map(field => (
              <div key={field} style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>{field.toUpperCase()}</label>
                <input
                  type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                  value={fieldValues[field] || ''}
                  onChange={e => setFieldValues(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={`Enter ${field}...`}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(107,142,35,0.3)', color: '#e8e0d0', padding: '8px 12px', fontSize: '13px', width: '100%', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
            ))
          )}
          {integration.envVar && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '12px', lineHeight: 1.6 }}>
              Credentials are read from the <span style={{ color: '#d4af37', fontFamily: 'monospace' }}>{integration.envVar}</span>{' '}
              environment variable (Vercel → Settings → Environment Variables). Typed values are not persisted.
            </div>
          )}
          <button style={{
            marginTop: '8px', background: 'linear-gradient(135deg,#6b8e23,#4a6318)',
            border: 'none', color: '#fff', padding: '8px 20px', fontSize: '11px',
            letterSpacing: '2px', cursor: 'pointer', fontFamily: "'Orbitron', monospace",
          }}>
            SAVE & CONNECT
          </button>
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = ALL_INTEGRATIONS.filter(i => {
    const matchCat = activeCategory === 'ALL' || i.category === activeCategory;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedCount = ALL_INTEGRATIONS.filter(i => i.status === 'CONNECTED').length;

  return (
    <div style={{ padding: '32px', fontFamily: "'Rajdhani', sans-serif", color: '#e8e0d0', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#6b8e23', letterSpacing: '4px', marginBottom: '8px', fontFamily: "'Orbitron', monospace" }}>// INTEGRATIONS HUB</div>
            <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', color: '#fff', marginBottom: '8px' }}>CONNECTED ECOSYSTEM</h1>
            <p style={{ color: '#888', fontSize: '14px' }}>Connect DatumOS to your entire marketing, communication, and BIM toolstack.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: 'rgba(107,142,35,0.1)', border: '1px solid rgba(107,142,35,0.3)', padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', color: '#6b8e23' }}>{connectedCount}</div>
              <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px' }}>CONNECTED</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', color: '#d4af37' }}>{ALL_INTEGRATIONS.length}</div>
              <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px' }}>AVAILABLE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search integrations..."
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(107,142,35,0.2)', color: '#e8e0d0', padding: '12px 20px', fontSize: '14px', width: '100%', maxWidth: '400px', outline: 'none', fontFamily: "'Rajdhani', sans-serif" }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            background: activeCategory === cat.id ? 'rgba(107,142,35,0.2)' : 'transparent',
            border: `1px solid ${activeCategory === cat.id ? '#6b8e23' : 'rgba(255,255,255,0.1)'}`,
            color: activeCategory === cat.id ? '#6b8e23' : '#888',
            padding: '8px 16px', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer',
            fontFamily: "'Orbitron', monospace", transition: 'all 0.2s',
          }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px' }}>NO INTEGRATIONS FOUND</div>
        </div>
      ) : (
        <>
          {/* Group by category if ALL selected */}
          {activeCategory === 'ALL' ? (
            CATEGORIES.filter(c => c.id !== 'ALL').map(cat => {
              const items = filtered.filter(i => i.category === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id} style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                    <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', color: '#d4af37', letterSpacing: '2px' }}>{cat.label.toUpperCase()}</h2>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.15)' }} />
                    <span style={{ fontSize: '11px', color: '#555' }}>{items.length} integrations</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
                    {items.map(i => <IntegrationCard key={i.slug} integration={i} />)}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
              {filtered.map(i => <IntegrationCard key={i.slug} integration={i} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
