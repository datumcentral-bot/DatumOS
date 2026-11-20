"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATUMGROK — web edition.
//
// DATUMGROK is DATUM CORTEX's local BIM & Building-Services intelligence
// surface. The .NET desktop app reads the repository straight off disk; this
// web edition surfaces the same eight screens inside DatumOS, reading live
// data from the DATUM CORTEX gateway (via /api/dcortex-proxy) and the small
// whitelist of canonical repository files (via /api/grok/files).
//
// Every value here is REAL — pulled from the gateway or the repository. When
// the gateway is unreachable (it is localhost-only) or the repository is not
// mounted (serverless deployments) each panel degrades to an honest
// "OFFLINE / NOT MOUNTED" state instead of fabricating numbers.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg: "#0a0e14",
  panel: "rgba(255,255,255,0.025)",
  panelSolid: "#10151c",
  border: "rgba(255,255,255,0.09)",
  borderSoft: "rgba(255,255,255,0.05)",
  text: "#e8ecf1",
  muted: "#8a94a6",
  faint: "#5b6472",
  gold: "#c19749",
  green: "#4ade80",
  amber: "#ffb100",
  red: "#ff3b30",
  blue: "#5aa9ff",
};

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "chat", label: "Agent Chat" },
  { id: "agents", label: "Agent Army" },
  { id: "knowledge", label: "Knowledge" },
  { id: "tools", label: "Tools & Data" },
  { id: "orchestration", label: "Orchestration" },
  { id: "programme", label: "Programme 40" },
  { id: "services", label: "Live Services" },
];

// ── data helpers ─────────────────────────────────────────────────────────────

async function cortexGet(path) {
  const res = await fetch(`/api/dcortex-proxy${path}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `DATUM CORTEX ${path} → ${res.status}`);
  }
  return res.json();
}

async function fileGet(name) {
  const res = await fetch(`/api/grok/files?name=${encodeURIComponent(name)}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`file bridge → ${res.status}`);
  return res.json();
}

// A cortex relay is only reachable when the gateway process is up on the
// local runtime. Treat any fetch failure as "offline", not a crash.
function useCortex(path, refreshKey) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let alive = true;
    setState({ data: null, error: null, loading: true });
    cortexGet(path)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((e) =>
        alive && setState({ data: null, error: e?.message || String(e), loading: false })
      );
    return () => {
      alive = false;
    };
  }, [path, refreshKey]);
  return state;
}

function useFile(name, refreshKey) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let alive = true;
    setState({ data: null, error: null, loading: true });
    fileGet(name)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((e) =>
        alive && setState({ data: null, error: e?.message || String(e), loading: false })
      );
    return () => {
      alive = false;
    };
  }, [name, refreshKey]);
  return state;
}

// ── ui primitives ────────────────────────────────────────────────────────────

function Panel({ title, subtitle, right, children, style }) {
  return (
    <section
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 18,
        ...style,
      }}
    >
      {(title || right) && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            {title && (
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650, color: C.text, letterSpacing: "0.01em" }}>
                {title}
              </h2>
            )}
            {subtitle && <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

function Badge({ children, color = C.muted }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 650,
        letterSpacing: "0.04em",
        color,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Kpi({ label, value, sub, color = C.gold }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.borderSoft}`,
        borderRadius: 10,
        padding: "13px 15px",
        minWidth: 120,
        flex: "1 1 120px",
      }}
    >
      <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: C.faint, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 4, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Empty({ title, hint }) {
  return (
    <div
      style={{
        border: `1px dashed ${C.border}`,
        borderRadius: 10,
        padding: "26px 18px",
        textAlign: "center",
        color: C.muted,
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{title}</div>
      {hint && <div style={{ fontSize: 12, marginTop: 5, color: C.faint, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

function Spin() {
  return (
    <div style={{ color: C.faint, fontSize: 12.5, padding: 18, textAlign: "center" }}>
      Contacting DATUM CORTEX…
    </div>
  );
}

function Offline({ error }) {
  return (
    <Empty
      title="DATUM CORTEX OFFLINE"
      hint={
        error
          ? `${error} — the gateway runs on the local runtime (127.0.0.1:8799). Start the DATUM CORTEX gateway to populate this panel.`
          : "The gateway runs on the local runtime (127.0.0.1:8799). Start the DATUM CORTEX gateway to populate this panel."
      }
    />
  );
}

function asList(v) {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function statusColor(status) {
  const s = String(status || "").toUpperCase();
  if (s.includes("COMPLETE") || s === "ACTIVE" || s === "ONLINE" || s === "ALIVE" || s === "READY" || s === "HEALTHY") return C.green;
  if (s.includes("PARTIAL") || s.includes("DEGRADED") || s.includes("AT_RISK") || s.includes("WARNING")) return C.amber;
  if (s.includes("BLOCK") || s.includes("OFFLINE") || s.includes("CRITICAL") || s.includes("ERROR") || s.includes("FAILED")) return C.red;
  return C.muted;
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Filter…"}
      style={{
        background: C.panelSolid,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.text,
        padding: "8px 12px",
        fontSize: 12.5,
        outline: "none",
        minWidth: 200,
      }}
    />
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardTab({ refreshKey }) {
  const status = useCortex("/ecosystem/status", refreshKey);
  const health = useCortex("/health", refreshKey);
  const brief = useFile("agents", refreshKey);

  const counts = status.data || {};
  const moduleStates = counts.module_states || {};
  const subsystems = Object.entries(moduleStates);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Live targets — real ecosystem counts */}
      <Panel title="Live Targets" subtitle="DATUM CORTEX subsystem coverage, read live from the gateway">
        {status.loading ? (
          <Spin />
        ) : status.error ? (
          <Offline error={status.error} />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Kpi label="Total modules" value={counts.total_modules ?? "—"} />
            <Kpi label="Active" value={counts.active_modules ?? "—"} color={C.green} />
            <Kpi label="Degraded" value={counts.degraded_modules ?? "—"} color={C.amber} />
            <Kpi label="Offline" value={counts.offline_modules ?? "—"} color={C.red} />
            <Kpi label="Routes" value={counts.total_routes ?? "—"} />
            <Kpi label="Messages" value={counts.total_messages ?? "—"} />
          </div>
        )}
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Subsystem coverage */}
        <Panel title="Subsystem Coverage" subtitle="Per-module state, live">
          {status.loading ? (
            <Spin />
          ) : status.error ? (
            <Offline error={status.error} />
          ) : subsystems.length === 0 ? (
            <Empty title="No subsystem states reported" />
          ) : (
            <div style={{ display: "grid", gap: 6, maxHeight: 320, overflowY: "auto" }}>
              {subsystems.map(([name, st]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 11px",
                    background: C.panelSolid,
                    borderRadius: 7,
                    border: `1px solid ${C.borderSoft}`,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: C.text, fontFamily: "monospace" }}>{name}</span>
                  <Badge color={statusColor(st)}>{String(st)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Gateway health */}
        <Panel title="Gateway Health" subtitle="Loopback probe of the DATUM CORTEX gateway">
          {health.loading ? (
            <Spin />
          ) : health.error ? (
            <Offline error={health.error} />
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>Status</span>
                <Badge color={statusColor(health.data?.status)}>{String(health.data?.status ?? "—")}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>Checked</span>
                <span style={{ color: C.text, fontSize: 12.5, fontFamily: "monospace" }}>
                  {counts.checked_at ? new Date(counts.checked_at).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* System brief — AGENTS.md from the repository */}
      <Panel
        title="System Brief"
        subtitle="Canonical DCORTEX_V1 AGENTS.md — root, service ports, runtime setup"
        right={
          brief.data?.available === false ? (
            <Badge color={C.amber}>NOT MOUNTED</Badge>
          ) : brief.data?.available ? (
            <Badge color={C.green}>REPOSITORY MOUNTED</Badge>
          ) : null
        }
      >
        {brief.loading ? (
          <Spin />
        ) : brief.error ? (
          <Offline error={brief.error} />
        ) : !brief.data?.available ? (
          <Empty
            title="Repository not mounted"
            hint="The system brief is read from the DATUM CORTEX repository on the local runtime. It is unavailable on serverless deployments."
          />
        ) : (
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 12,
              lineHeight: 1.6,
              color: C.muted,
              fontFamily: "monospace",
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {String(brief.data.data)}
          </pre>
        )}
      </Panel>
    </div>
  );
}

// ── AGENT CHAT ───────────────────────────────────────────────────────────────

function ChatTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [meta, setMeta] = useState(null);
  const [citations, setCitations] = useState([]);
  const [error, setError] = useState(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setCitations([]);
    setMeta(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    try {
      const res = await fetch("/api/dcortex-proxy/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          prompt: text,
          retrieve: true,
          include_revit_context: true,
          temperature: 0.2,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = body?.detail || body?.error || res.status;
        throw new Error(typeof detail === "object" ? JSON.stringify(detail) : String(detail));
      }
      const reply = body?.content || body?.message || body?.reply || "(empty reply)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setMeta({ model: body?.model, provider: body?.provider, latency_ms: body?.latency_ms, usage: body?.usage });
      setCitations(Array.isArray(body?.citations) ? body.citations : []);
    } catch (e) {
      setError(e?.message || String(e));
      setMessages((m) => [...m, { role: "assistant", content: "(no reply — see error below)" }]);
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Panel
        title="Agent Chat"
        subtitle="Ask a question — the orchestrator routes it, with live Revit model context and knowledge RAG (opt-in)"
        right={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge color={C.blue}>RAG</Badge>
            <Badge color={C.blue}>REVIT CONTEXT</Badge>
          </div>
        }
      >
        {/* conversation thread */}
        <div
          style={{
            display: "grid",
            gap: 10,
            maxHeight: 380,
            overflowY: "auto",
            marginBottom: 14,
            paddingRight: 4,
          }}
        >
          {messages.length === 0 && (
            <Empty title="No conversation yet" hint="Ask a question about the BIM model, the agents, the knowledge corpus, or the programme." />
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "82%",
                background: m.role === "user" ? "rgba(193,151,73,0.12)" : C.panelSolid,
                border: `1px solid ${m.role === "user" ? "rgba(193,151,73,0.3)" : C.borderSoft}`,
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.55,
                color: C.text,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: "0.08em", color: m.role === "user" ? C.gold : C.faint, marginBottom: 4, textTransform: "uppercase" }}>
                {m.role === "user" ? "You" : "DATUM CORTEX"}
              </div>
              {m.content}
            </div>
          ))}
        </div>

        {/* citations + usage */}
        {citations.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.08em", color: C.faint, textTransform: "uppercase", marginBottom: 6 }}>
              Citations ({citations.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {citations.slice(0, 12).map((c, i) => (
                <span key={i} style={{ fontSize: 11, color: C.muted, background: C.panelSolid, border: `1px solid ${C.borderSoft}`, borderRadius: 6, padding: "3px 8px" }}>
                  {typeof c === "string" ? c : JSON.stringify(c)}
                </span>
              ))}
            </div>
          </div>
        )}
        {meta && (
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 12, fontFamily: "monospace" }}>
            model {meta.model || "—"} · provider {meta.provider || "—"} · {meta.latency_ms ?? "—"} ms
            {meta.usage ? ` · usage ${JSON.stringify(meta.usage)}` : ""}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 12, fontSize: 12, color: C.red, background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.25)", borderRadius: 8, padding: "8px 12px" }}>
            {error}
          </div>
        )}

        {/* composer */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask the cortex…"
            disabled={sending}
            style={{
              flex: 1,
              background: C.panelSolid,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              color: C.text,
              padding: "11px 14px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            style={{
              background: C.gold,
              color: "#0a0e14",
              border: "none",
              borderRadius: 9,
              padding: "0 20px",
              fontWeight: 700,
              fontSize: 13,
              cursor: sending || !input.trim() ? "not-allowed" : "pointer",
              opacity: sending || !input.trim() ? 0.5 : 1,
            }}
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

// ── AGENT ARMY ───────────────────────────────────────────────────────────────

function AgentsTab({ refreshKey }) {
  const { data, error, loading } = useCortex("/ai/agents", refreshKey);
  const [q, setQ] = useState("");
  const agents = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => {
    if (!q.trim()) return agents;
    const needle = q.toLowerCase();
    return agents.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(needle) ||
        (a.slug || "").toLowerCase().includes(needle) ||
        (a.role || "").toLowerCase().includes(needle) ||
        asList(a.capabilities).join(" ").toLowerCase().includes(needle)
    );
  }, [agents, q]);

  return (
    <Panel
      title="Agent Army"
      subtitle={`${agents.length} agents parsed live from the cortex roster — pick by slug or let the orchestrator route`}
      right={<SearchBox value={q} onChange={setQ} placeholder="Filter agents…" />}
    >
      {loading ? (
        <Spin />
      ) : error ? (
        <Offline error={error} />
      ) : agents.length === 0 ? (
        <Empty title="No agents reported" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map((a) => (
            <article
              key={a.row_id || a.slug || a.name}
              style={{
                background: C.panelSolid,
                border: `1px solid ${C.borderSoft}`,
                borderRadius: 10,
                padding: 14,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 650, color: C.text }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, fontFamily: "monospace" }}>{a.slug}</div>
                </div>
                <Badge color={statusColor(a.status)}>{String(a.status ?? "—")}</Badge>
              </div>
              {a.role && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{a.role}</div>}
              {asList(a.capabilities).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {asList(a.capabilities).slice(0, 6).map((c, i) => (
                    <span key={i} style={{ fontSize: 10.5, color: C.blue, background: "rgba(90,169,255,0.08)", border: "1px solid rgba(90,169,255,0.2)", borderRadius: 5, padding: "2px 7px" }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.faint, borderTop: `1px solid ${C.borderSoft}`, paddingTop: 8, marginTop: 2 }}>
                <span>#{a.number ?? a.row_id ?? "—"}</span>
                <span>{a.last_heartbeat_at ? new Date(a.last_heartbeat_at).toLocaleString() : "no heartbeat"}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && agents.length > 0 && (
        <div style={{ marginTop: 12 }}><Empty title="No agents match the filter" /></div>
      )}
    </Panel>
  );
}

// ── KNOWLEDGE ────────────────────────────────────────────────────────────────

function KnowledgeTab({ refreshKey }) {
  const { data, error, loading } = useCortex("/knowledge/ingestion/documents", refreshKey);
  const [q, setQ] = useState("");
  const docs = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => {
    if (!q.trim()) return docs;
    const needle = q.toLowerCase();
    return docs.filter((d) =>
      [d.filename, d.source_path, d.project, d.discipline, d.document_number, d.file_type, d.extraction_method]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [docs, q]);

  return (
    <Panel
      title="Knowledge"
      subtitle={`${docs.length} ingested knowledge documents — corpus records indexed by the DATUM CORTEX knowledge engine`}
      right={<SearchBox value={q} onChange={setQ} placeholder="Filter by file, project, discipline…" />}
    >
      {loading ? (
        <Spin />
      ) : error ? (
        <Offline error={error} />
      ) : docs.length === 0 ? (
        <Empty title="No knowledge documents ingested" hint="Ingest documents via the DATUM CORTEX knowledge pipeline to populate this index." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.faint, borderBottom: `1px solid ${C.border}` }}>
                {["Filename", "Type", "Project", "Discipline", "Chunks", "Entities", "Confidence", "Method"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", fontWeight: 600, letterSpacing: "0.04em", fontSize: 10.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.document_id || d.resource_id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                  <td style={{ padding: "8px 10px", color: C.text, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.source_path}>
                    {d.filename || "—"}
                  </td>
                  <td style={{ padding: "8px 10px", color: C.muted }}>{d.file_type || "—"}</td>
                  <td style={{ padding: "8px 10px", color: C.muted }}>{d.project || "—"}</td>
                  <td style={{ padding: "8px 10px", color: C.muted }}>{d.discipline || "—"}</td>
                  <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{d.chunks ?? "—"}</td>
                  <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{d.entities ?? "—"}</td>
                  <td style={{ padding: "8px 10px", color: statusColor((d.confidence ?? 0) >= 0.8 ? "ACTIVE" : "PARTIAL"), fontFamily: "monospace" }}>
                    {typeof d.confidence === "number" ? d.confidence.toFixed(2) : d.confidence ?? "—"}
                  </td>
                  <td style={{ padding: "8px 10px", color: C.muted }}>{d.extraction_method || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && docs.length > 0 && (
        <div style={{ marginTop: 12 }}><Empty title="No documents match the filter" /></div>
      )}
      <p style={{ fontSize: 11, color: C.faint, margin: "12px 0 0", lineHeight: 1.5 }}>
        This is the ingestion index. DATUMGROK's desktop edition additionally runs BM25 full-text search over the raw
        repository corpus (~3,400 files) — that deep-search engine is local to the desktop app and is not exposed by the
        gateway API, so it is not reproduced here.
      </p>
    </Panel>
  );
}

// ── TOOLS & DATA ─────────────────────────────────────────────────────────────

function ToolsTab({ refreshKey }) {
  const { data, error, loading } = useCortex("/datumbot/registry", refreshKey);
  const [q, setQ] = useState("");
  const tools = Array.isArray(data?.tools) ? data.tools : [];
  const filtered = useMemo(() => {
    if (!q.trim()) return tools;
    const needle = q.toLowerCase();
    return tools.filter(
      (t) =>
        (t.name || "").toLowerCase().includes(needle) ||
        (t.identity?.name || "").toLowerCase().includes(needle) ||
        (t.capability || "").toLowerCase().includes(needle) ||
        (t.category || "").toLowerCase().includes(needle)
    );
  }, [tools, q]);

  return (
    <Panel
      title="Tools & Data"
      subtitle={`DATUMBOT registry — ${data?.tool_count ?? tools.length} tools, read-only=${String(data?.read_only)} · write-capable tools are flagged`}
      right={<SearchBox value={q} onChange={setQ} placeholder="Filter tools…" />}
    >
      {loading ? (
        <Spin />
      ) : error ? (
        <Offline error={error} />
      ) : tools.length === 0 ? (
        <Empty title="No tools registered" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {filtered.map((t) => (
            <article
              key={t.identity?.tool_id || t.name}
              style={{
                background: C.panelSolid,
                border: `1px solid ${C.borderSoft}`,
                borderRadius: 10,
                padding: 14,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 650, color: C.text, fontFamily: "monospace" }}>{t.identity?.name || t.name}</div>
                  <div style={{ fontSize: 10.5, color: C.faint }}>
                    {t.identity?.tool_id} · v{t.identity?.version}
                  </div>
                </div>
                <Badge color={statusColor(t.enabled === false ? "OFFLINE" : t.status)}>{String(t.status ?? (t.enabled ? "ENABLED" : "DISABLED"))}</Badge>
              </div>
              {t.description && <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>{t.description}</div>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                <Badge color={C.blue}>{t.category || "—"}</Badge>
                <Badge color={statusColor(t.risk_level === "LOW" ? "ACTIVE" : t.risk_level === "HIGH" ? "BLOCKED" : "PARTIAL")}>{t.risk_level || "—"} RISK</Badge>
                {t.requires_approval ? <Badge color={C.amber}>APPROVAL</Badge> : null}
                {t.requires_revit ? <Badge color={C.blue}>REVIT</Badge> : null}
                {t.execution_boundary ? <Badge color={C.muted}>{t.execution_boundary}</Badge> : null}
              </div>
              {t.capability && <div style={{ fontSize: 11, color: C.faint, fontFamily: "monospace" }}>{t.capability}</div>}
            </article>
          ))}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && tools.length > 0 && (
        <div style={{ marginTop: 12 }}><Empty title="No tools match the filter" /></div>
      )}
    </Panel>
  );
}

// ── ORCHESTRATION ────────────────────────────────────────────────────────────

function OrchestrationTab({ refreshKey }) {
  const status = useCortex("/ecosystem/status", refreshKey);
  const modules = useCortex("/ecosystem/modules", refreshKey);
  const [q, setQ] = useState("");
  const list = Array.isArray(modules.data) ? modules.data : [];
  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (m) =>
        (m.module_id || "").toLowerCase().includes(needle) ||
        (m.name || "").toLowerCase().includes(needle) ||
        (m.description || "").toLowerCase().includes(needle)
    );
  }, [list, q]);

  const moduleStates = status.data?.module_states || {};
  const subsystems = Object.entries(moduleStates);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Panel
        title="Orchestration"
        subtitle="The five control gates, engine state and the registered module fleet"
        right={<SearchBox value={q} onChange={setQ} placeholder="Filter modules…" />}
      >
        {/* module state summary */}
        {status.loading ? (
          <Spin />
        ) : status.error ? (
          <Offline error={status.error} />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            {subsystems.map(([name, st]) => (
              <div key={name} style={{ background: C.panelSolid, border: `1px solid ${C.borderSoft}`, borderRadius: 8, padding: "8px 13px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: C.text, fontFamily: "monospace" }}>{name}</span>
                <Badge color={statusColor(st)}>{String(st)}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* registered modules */}
        {modules.loading ? (
          <Spin />
        ) : modules.error ? (
          <Offline error={modules.error} />
        ) : list.length === 0 ? (
          <Empty title="No modules registered" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.faint, borderBottom: `1px solid ${C.border}` }}>
                  {["Module", "Name", "Version", "Status", "Endpoints", "Last heartbeat"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", fontWeight: 600, letterSpacing: "0.04em", fontSize: 10.5, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.module_id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                    <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{m.module_id}</td>
                    <td style={{ padding: "8px 10px", color: C.text, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.description}>
                      {m.name || "—"}
                    </td>
                    <td style={{ padding: "8px 10px", color: C.muted, fontFamily: "monospace" }}>{m.version || "—"}</td>
                    <td style={{ padding: "8px 10px" }}><Badge color={statusColor(m.status)}>{String(m.status ?? "—")}</Badge></td>
                    <td style={{ padding: "8px 10px", color: C.muted, fontFamily: "monospace" }}>{Array.isArray(m.endpoints) ? m.endpoints.length : m.endpoints ?? "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.faint, fontFamily: "monospace", fontSize: 11 }}>
                      {m.last_heartbeat ? new Date(m.last_heartbeat).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!modules.loading && !modules.error && filtered.length === 0 && list.length > 0 && (
          <div style={{ marginTop: 12 }}><Empty title="No modules match the filter" /></div>
        )}
      </Panel>
    </div>
  );
}

// ── PROGRAMME 40 ─────────────────────────────────────────────────────────────
// READ-ONLY view of the DN001–DN040 master register. This never writes, never
// promotes, and never re-marks a task — it displays the register exactly as the
// repository holds it.

const PROG_STATUS_COLOR = {
  COMPLETE_CERTIFIED: C.green,
  COMPLETE_IMPLEMENTED: C.green,
  PARTIAL: C.amber,
  NOT_STARTED: C.muted,
  BLOCKED: C.red,
  SUPERSEDED_BY_EXISTING_CAPABILITY: C.faint,
  NOT_APPLICABLE: C.faint,
};

function ProgrammeTab({ refreshKey }) {
  const { data, error, loading } = useFile("programme", refreshKey);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [open, setOpen] = useState(null);

  const register = data?.available ? data.data : null;
  const tasks = Array.isArray(register?.tasks) ? register.tasks : [];
  const counts = register?.counts || {};
  const legend = Array.isArray(register?.status_legend) ? register.status_legend : Object.keys(PROG_STATUS_COLOR);

  const filtered = useMemo(() => {
    let out = tasks;
    if (statusFilter !== "ALL") out = out.filter((t) => t.status === statusFilter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter(
        (t) =>
          (t.task || "").toLowerCase().includes(needle) ||
          (t.title || "").toLowerCase().includes(needle) ||
          (t.owner || "").toLowerCase().includes(needle)
      );
    }
    return out;
  }, [tasks, q, statusFilter]);

  return (
    <Panel
      title="Programme 40"
      subtitle="DN001–DN040 master register — read directly from the DATUM CORTEX repository"
      right={
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <Badge color={C.amber}>READ-ONLY</Badge>
          <SearchBox value={q} onChange={setQ} placeholder="Filter DN tasks…" />
        </div>
      }
    >
      {loading ? (
        <Spin />
      ) : error ? (
        <Offline error={error} />
      ) : !data?.available ? (
        <Empty
          title="Repository not mounted"
          hint="The DN001–DN040 register is read from the DATUM CORTEX repository on the local runtime. It is unavailable on serverless deployments."
        />
      ) : (
        <>
          {/* register summary — the register's own counts, displayed as-is */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Kpi label="Total tasks" value={counts.TOTAL_TASKS ?? tasks.length} />
            <Kpi label="Certified" value={counts.COMPLETE_CERTIFIED ?? "—"} color={C.green} />
            <Kpi label="Implemented" value={counts.COMPLETE_IMPLEMENTED ?? "—"} color={C.green} />
            <Kpi label="Partial" value={counts.PARTIAL ?? "—"} color={C.amber} />
            <Kpi label="Blocked" value={counts.BLOCKED ?? "—"} color={C.red} />
            <Kpi label="Remaining" value={counts.TOTAL_REMAINING ?? "—"} color={C.amber} />
          </div>

          {/* status filter chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {["ALL", ...legend].map((s) => {
              const n = s === "ALL" ? tasks.length : tasks.filter((t) => t.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    background: statusFilter === s ? C.panelSolid : "transparent",
                    border: `1px solid ${statusFilter === s ? C.gold : C.borderSoft}`,
                    borderRadius: 999,
                    color: statusFilter === s ? C.gold : C.muted,
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: "4px 11px",
                    cursor: "pointer",
                  }}
                >
                  {s} · {n}
                </button>
              );
            })}
          </div>

          {/* task list */}
          <div style={{ display: "grid", gap: 8 }}>
            {filtered.map((t) => {
              const isOpen = open === t.task;
              return (
                <div key={t.task} style={{ background: C.panelSolid, border: `1px solid ${C.borderSoft}`, borderRadius: 9, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : t.task)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      textAlign: "left",
                      padding: "11px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: C.gold, fontWeight: 700, minWidth: 48 }}>{t.task}</span>
                    <span style={{ flex: 1, fontSize: 12.5, color: C.text }}>{t.title}</span>
                    <span style={{ fontSize: 11, color: C.faint, fontFamily: "monospace" }}>{t.owner || ""}</span>
                    <Badge color={PROG_STATUS_COLOR[t.status] || C.muted}>{t.status}</Badge>
                    <span style={{ color: C.faint, fontSize: 11 }}>{isOpen ? "▾" : "▸"}</span>
                  </button>
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${C.borderSoft}`, padding: "12px 14px", display: "grid", gap: 9, fontSize: 12 }}>
                      {[
                        ["Evidence", t.evidence],
                        ["Implementation", t.implementation],
                        ["Tests", t.tests],
                        ["Live", t.live],
                        ["Delta", t.delta],
                        ["Blocker", t.blocker],
                        ["Dependencies", t.deps],
                        ["Reuse", t.reuse],
                        ["Action", t.action],
                        ["Certification", t.cert],
                      ]
                        .filter(([, v]) => v && String(v).trim() && String(v).trim().toLowerCase() !== "none")
                        .map(([k, v]) => (
                          <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 10 }}>
                            <span style={{ color: C.faint, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: 1 }}>{k}</span>
                            <span style={{ color: C.muted, lineHeight: 1.55 }}>{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && tasks.length > 0 && (
            <div style={{ marginTop: 12 }}><Empty title="No tasks match the filter" /></div>
          )}
          <p style={{ fontSize: 11, color: C.faint, margin: "14px 0 0", lineHeight: 1.5 }}>
            Read-only reflection of{" "}
            <span style={{ fontFamily: "monospace" }}>16_EVIDENCE/DATUM_NETWORK_INTEGRATION/MASTER_RECONCILIATION/DN001_DN040_MASTER_REGISTER.json</span>
            . Statuses and counts are the register's own values, shown verbatim — this panel never writes, promotes, or re-marks any task.
          </p>
        </>
      )}
    </Panel>
  );
}

// ── LIVE SERVICES ────────────────────────────────────────────────────────────

function ServicesTab({ refreshKey }) {
  const health = useCortex("/health", refreshKey);
  const revit = useCortex("/revit/health", refreshKey);
  const nodes = useCortex("/nodes", refreshKey);
  const [q, setQ] = useState("");
  const nodeList = Array.isArray(nodes.data) ? nodes.data : [];
  const filtered = useMemo(() => {
    if (!q.trim()) return nodeList;
    const needle = q.toLowerCase();
    return nodeList.filter(
      (n) =>
        (n.node_id || "").toLowerCase().includes(needle) ||
        (n.hostname || "").toLowerCase().includes(needle) ||
        (n.assigned_agent_name || "").toLowerCase().includes(needle) ||
        (n.status || "").toLowerCase().includes(needle)
    );
  }, [nodeList, q]);

  const revitData = revit.data || {};

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* Gateway */}
        <Panel title="DATUM CORTEX Gateway" subtitle="Loopback · 127.0.0.1:8799">
          {health.loading ? <Spin /> : health.error ? <Offline error={health.error} /> : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.muted, fontSize: 12.5 }}>Status</span>
              <Badge color={statusColor(health.data?.status)}>{String(health.data?.status ?? "—")}</Badge>
            </div>
          )}
        </Panel>
        {/* Revit bridge */}
        <Panel title="Revit Bridge" subtitle="Loopback · 127.0.0.1:8081">
          {revit.loading ? <Spin /> : revit.error ? <Offline error={revit.error} /> : (
            <div style={{ display: "grid", gap: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>State</span>
                <Badge color={statusColor(revitData.state)}>{String(revitData.state ?? "—")}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>Bridge online</span>
                <Badge color={statusColor(revitData.bridge_online ? "ACTIVE" : "OFFLINE")}>{revitData.bridge_online ? "TRUE" : "FALSE"}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>Model loaded</span>
                <Badge color={statusColor(revitData.model_loaded ? "ACTIVE" : "OFFLINE")}>{revitData.model_loaded ? "TRUE" : "FALSE"}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>Version</span>
                <span style={{ color: C.text, fontSize: 12, fontFamily: "monospace" }}>{revitData.version || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12.5 }}>Service</span>
                <span style={{ color: C.text, fontSize: 12, fontFamily: "monospace" }}>{revitData.model_summary?.service || "—"}</span>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Nodes */}
      <Panel
        title="Compute Nodes"
        subtitle={`${nodeList.length} nodes registered in the cortex fleet`}
        right={<SearchBox value={q} onChange={setQ} placeholder="Filter nodes…" />}
      >
        {nodes.loading ? (
          <Spin />
        ) : nodes.error ? (
          <Offline error={nodes.error} />
        ) : nodeList.length === 0 ? (
          <Empty title="No nodes registered" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.faint, borderBottom: `1px solid ${C.border}` }}>
                  {["Node", "Hostname", "Status", "Agent", "CPU", "RAM", "Disk", "Ollama", "Worker", "Revit"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", fontWeight: 600, letterSpacing: "0.04em", fontSize: 10.5, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={n.node_id || n.id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                    <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{n.node_id}</td>
                    <td style={{ padding: "8px 10px", color: C.muted }}>{n.hostname || n.machine_name || "—"}</td>
                    <td style={{ padding: "8px 10px" }}><Badge color={statusColor(n.status)}>{String(n.status ?? "—")}</Badge></td>
                    <td style={{ padding: "8px 10px", color: C.muted, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.assigned_agent_name}>
                      {n.assigned_agent_name || "—"}
                    </td>
                    <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{n.cpu_usage ?? "—"}{typeof n.cpu_usage === "number" ? "%" : ""}</td>
                    <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{n.ram_usage ?? "—"}{typeof n.ram_usage === "number" ? "%" : ""}</td>
                    <td style={{ padding: "8px 10px", color: C.text, fontFamily: "monospace" }}>{n.disk_usage ?? "—"}{typeof n.disk_usage === "number" ? "%" : ""}</td>
                    <td style={{ padding: "8px 10px" }}><Badge color={statusColor(n.ollama_status)}>{String(n.ollama_status ?? "—")}</Badge></td>
                    <td style={{ padding: "8px 10px" }}><Badge color={statusColor(n.worker_status)}>{String(n.worker_status ?? "—")}</Badge></td>
                    <td style={{ padding: "8px 10px", color: n.revit_available ? C.green : C.faint, fontFamily: "monospace" }}>
                      {n.revit_available ? `✓ ${n.revit_version || ""}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!nodes.loading && !nodes.error && filtered.length === 0 && nodeList.length > 0 && (
          <div style={{ marginTop: 12 }}><Empty title="No nodes match the filter" /></div>
        )}
      </Panel>

      <p style={{ fontSize: 11, color: C.faint, margin: 0, lineHeight: 1.5 }}>
        DATUMGROK's desktop edition also loops back to the Control Room (:8001) and Ollama. Those services run on
        separate ports outside the gateway's relay surface, so they are not proxied here — start them locally and they
        appear in the desktop app's Live Services screen.
      </p>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function GrokPage() {
  const [tab, setTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const active = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 22px 60px" }}>
      {/* header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, background: C.gold, borderRadius: 2, transform: "rotate(45deg)" }} />
          <span style={{ fontSize: 11, letterSpacing: "0.14em", color: C.gold, textTransform: "uppercase", fontWeight: 700 }}>
            DATUM CORTEX Intelligence
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 750, color: C.text, letterSpacing: "-0.01em" }}>DATUMGROK</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted, maxWidth: 720, lineHeight: 1.6 }}>
          The web edition of DATUM CORTEX's local BIM &amp; Building-Services intelligence — the desktop app's eight
          screens, surfaced inside DatumOS. Live data reads from the DATUM CORTEX gateway; the system brief and
          programme register read straight from the repository.
        </p>
      </div>

      {/* tab strip */}
      <nav
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 20,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 0,
        }}
      >
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${on ? C.gold : "transparent"}`,
                color: on ? C.gold : C.muted,
                fontWeight: on ? 700 : 550,
                fontSize: 12.5,
                padding: "10px 13px",
                cursor: "pointer",
                marginBottom: -1,
                letterSpacing: "0.01em",
              }}
            >
              {t.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          style={{
            background: C.panelSolid,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            color: C.muted,
            fontSize: 11.5,
            fontWeight: 600,
            padding: "7px 14px",
            cursor: "pointer",
            marginBottom: 6,
            alignSelf: "center",
          }}
        >
          ↻ Refresh
        </button>
      </nav>

      {/* active tab */}
      {tab === "dashboard" && <DashboardTab refreshKey={refreshKey} />}
      {tab === "chat" && <ChatTab />}
      {tab === "agents" && <AgentsTab refreshKey={refreshKey} />}
      {tab === "knowledge" && <KnowledgeTab refreshKey={refreshKey} />}
      {tab === "tools" && <ToolsTab refreshKey={refreshKey} />}
      {tab === "orchestration" && <OrchestrationTab refreshKey={refreshKey} />}
      {tab === "programme" && <ProgrammeTab refreshKey={refreshKey} />}
      {tab === "services" && <ServicesTab refreshKey={refreshKey} />}

      {/* footer */}
      <p style={{ fontSize: 11, color: C.faint, marginTop: 28, lineHeight: 1.6, borderTop: `1px solid ${C.borderSoft}`, paddingTop: 16 }}>
        Powered by the DATUM CORTEX gateway (127.0.0.1:8799) and the canonical repository at{" "}
        <span style={{ fontFamily: "monospace" }}>E:\0003-FINAL_DATUM_BIM_CORTEX</span>. Panels that depend on the
        gateway or the repository show an honest OFFLINE / NOT MOUNTED state when those are unreachable — nothing is
        fabricated. The desktop edition (DATUMGROK.exe) additionally runs local BM25 corpus search and loops back to
        the Control Room and Ollama.
      </p>
    </div>
  );
}
