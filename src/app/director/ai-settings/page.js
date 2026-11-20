"use client";
import { useState, useEffect } from "react";

const MIL = {
  bg: "#0a0e14", panel: "rgba(13,17,23,0.95)", border: "rgba(107,142,35,0.2)",
  green: "#6b8e23", gold: "#c19749", red: "#ff3b30", blue: "#4a9eff",
  text: "#f0f2f5", dim: "#8a9bb0", font: "'Rajdhani', sans-serif", head: "'Orbitron', sans-serif",
};

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 6, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: "1.8rem" }}>{icon}</div>
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "1.4rem", color: color || MIL.green }}>{value}</div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.45rem", color: MIL.dim, letterSpacing: 1.5, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${MIL.border}` }}>
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.text, letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: "0.8rem", color: MIL.dim, marginTop: 3 }}>{description}</div>
      </div>
      <div
        onClick={() => onChange(!enabled)}
        style={{
          width: 48, height: 26, borderRadius: 13, cursor: "pointer",
          background: enabled ? MIL.green : "rgba(255,255,255,0.1)",
          border: `1px solid ${enabled ? MIL.green : "rgba(255,255,255,0.15)"}`,
          position: "relative", transition: "all 0.2s",
          boxShadow: enabled ? `0 0 8px ${MIL.green}60` : "none",
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: enabled ? 24 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: enabled ? "#fff" : MIL.dim,
          transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

export default function AISettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = MIL.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const r = await fetch("/api/ai/settings");
      const data = await r.json();
      setSettings(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await r.json();
      setTestResult(data);
      showToast(data.message, data.success ? MIL.green : MIL.red);
    } catch (e) { showToast("Connection test failed", MIL.red); }
    finally { setTesting(false); }
  };

  const toggleFeature = async (feature, enabled) => {
    try {
      await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", feature, enabled }),
      });
      setSettings(prev => ({ ...prev, features: { ...prev.features, [feature]: enabled } }));
      showToast(`${feature} ${enabled ? "enabled" : "disabled"}`);
    } catch (e) { showToast("Failed to update setting", MIL.red); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontFamily: MIL.head, color: MIL.green, letterSpacing: 3 }}>
      LOADING AI SETTINGS...
    </div>
  );

  return (
    <div style={{ fontFamily: MIL.font, color: MIL.text, maxWidth: 900 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a2a1a", border: `1px solid ${toast.color}`, borderRadius: 4, padding: "10px 18px", fontFamily: MIL.head, fontSize: "0.65rem", color: toast.color, letterSpacing: 1, zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "1.4rem", color: MIL.gold, letterSpacing: 3, marginBottom: 6 }}>🤖 AI COMMAND CENTER</div>
        <div style={{ color: MIL.dim, fontSize: "0.9rem" }}>Configure AI-powered features for DatumOS. All features work with smart rule-based fallback when no API key is configured.</div>
      </div>

      {/* Usage Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="LEADS SCORED" value={settings?.stats?.leadsScored || 0} color={MIL.gold} icon="📊" />
        <StatCard label="CLASHES CLASSIFIED" value={settings?.stats?.clashesClassified || 0} color={MIL.red} icon="⚡" />
        <StatCard label="CHAT MESSAGES" value={settings?.stats?.chatMessages || 0} color={MIL.blue} icon="💬" />
      </div>

      {/* API Key Status */}
      <div style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 6, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.7rem", color: MIL.gold, letterSpacing: 2, marginBottom: 16 }}>⚙ OPENAI CONFIGURATION</div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: settings?.hasApiKey ? "#6b8e23" : "#ff9500",
            boxShadow: settings?.hasApiKey ? "0 0 8px #6b8e23" : "0 0 8px #ff9500",
          }} />
          <div>
            <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: settings?.hasApiKey ? MIL.green : MIL.gold, letterSpacing: 1 }}>
              {settings?.hasApiKey ? "✓ OPENAI API KEY CONFIGURED" : "⚠ NO API KEY — USING RULE-BASED FALLBACK"}
            </div>
            <div style={{ fontSize: "0.78rem", color: MIL.dim, marginTop: 2 }}>
              {settings?.hasApiKey
                ? `Key: ${settings.apiKeyMasked} · Model: ${settings.model}`
                : "Set OPENAI_API_KEY in .env to enable real AI. All features work without it using smart algorithms."}
            </div>
          </div>
        </div>

        {/* API Key input (display only — set via .env) */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: "0.8rem", color: MIL.dim, fontFamily: "monospace" }}>
          {settings?.hasApiKey ? settings.apiKeyMasked : "OPENAI_API_KEY=sk-... (set in .env file)"}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={testConnection} disabled={testing}
            style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.3)", borderRadius: 4, color: "#4a9eff", padding: "8px 18px", fontFamily: MIL.head, fontSize: "0.55rem", cursor: "pointer", letterSpacing: 1, opacity: testing ? 0.6 : 1 }}>
            {testing ? "⟳ TESTING..." : "🔌 TEST CONNECTION"}
          </button>
          {testResult && (
            <div style={{ fontSize: "0.8rem", color: testResult.success ? MIL.green : MIL.red }}>
              {testResult.success ? "✓" : "✗"} {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Feature Toggles */}
      <div style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 6, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.7rem", color: MIL.gold, letterSpacing: 2, marginBottom: 16 }}>⚡ AI FEATURE CONTROLS</div>

        <Toggle
          label="SMART LEAD SCORING"
          description="AI analyzes lead data and assigns HOT/WARM/COLD/DEAD scores with actionable insights. Works with rule-based fallback."
          enabled={settings?.features?.leadScoring !== false}
          onChange={(v) => toggleFeature("leadScoring", v)}
        />
        <Toggle
          label="CLASH SEVERITY CLASSIFICATION"
          description="AI classifies BIM clashes by severity (CRITICAL/MAJOR/MINOR/INFO) and provides resolution recommendations."
          enabled={settings?.features?.clashClassify !== false}
          onChange={(v) => toggleFeature("clashClassify", v)}
        />
        <Toggle
          label="CLIENT AI CHAT WIDGET"
          description="Floating AI assistant on the Client Portal. Answers project queries, invoice questions, and BIM coordination updates."
          enabled={settings?.features?.chatWidget !== false}
          onChange={(v) => toggleFeature("chatWidget", v)}
        />
      </div>

      {/* Model Selection */}
      <div style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 6, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.7rem", color: MIL.gold, letterSpacing: 2, marginBottom: 16 }}>🧠 AI MODEL SELECTION</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { id: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Fast & cost-effective. Recommended for most tasks.", recommended: true },
            { id: "gpt-4o", label: "GPT-4o", desc: "Most capable. Best for complex analysis.", recommended: false },
            { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", desc: "Fastest & cheapest. Good for simple queries.", recommended: false },
          ].map(m => (
            <div key={m.id}
              onClick={() => {
                fetch("/api/ai/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "setModel", model: m.id }) });
                setSettings(prev => ({ ...prev, model: m.id }));
                showToast(`Model set to ${m.label}`);
              }}
              style={{
                background: settings?.model === m.id ? "rgba(107,142,35,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${settings?.model === m.id ? MIL.green : "rgba(255,255,255,0.08)"}`,
                borderRadius: 4, padding: "12px 14px", cursor: "pointer",
                boxShadow: settings?.model === m.id ? `0 0 8px ${MIL.green}30` : "none",
              }}>
              <div style={{ fontFamily: MIL.head, fontSize: "0.55rem", color: settings?.model === m.id ? MIL.green : MIL.text, letterSpacing: 1 }}>
                {settings?.model === m.id ? "✓ " : ""}{m.label}
                {m.recommended && <span style={{ marginLeft: 6, color: MIL.gold, fontSize: "0.4rem" }}>RECOMMENDED</span>}
              </div>
              <div style={{ fontSize: "0.75rem", color: MIL.dim, marginTop: 4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "rgba(74,158,255,0.04)", border: "1px solid rgba(74,158,255,0.15)", borderRadius: 6, padding: 20 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: "#4a9eff", letterSpacing: 2, marginBottom: 12 }}>ℹ HOW AI FEATURES WORK</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { title: "With OpenAI API Key", items: ["Real GPT-4o-mini analysis", "Context-aware lead scoring", "Intelligent clash classification", "Natural language chat responses"] },
            { title: "Without API Key (Fallback)", items: ["Rule-based lead scoring algorithm", "Keyword-based clash classification", "Pattern-matching chatbot responses", "All features fully functional"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 1, marginBottom: 8 }}>{col.title}</div>
              {col.items.map(item => (
                <div key={item} style={{ fontSize: "0.8rem", color: MIL.text, marginBottom: 4 }}>
                  <span style={{ color: MIL.green, marginRight: 6 }}>▸</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
