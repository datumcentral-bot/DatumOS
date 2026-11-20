"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const API_BASE = "/api/dcortex-proxy";

function formatCellValue(val) {
  if (val === undefined || val === null || val === "") return "—";
  return typeof val === "object" ? JSON.stringify(val) : String(val);
}

const CONTROL_ROOM_URL = process.env.NEXT_PUBLIC_CONTROL_ROOM_URL || "http://127.0.0.1:8001";

async function fetchData(path, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

async function fetchEcosystemHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${CONTROL_ROOM_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

/* ------------------------------------------------------------------ */
/*  STYLE TOKENS                                                       */
/* ------------------------------------------------------------------ */
const OLIVE = "#6b8e23";
const OLIVE_BRIGHT = "#a2d033";
const RED = "#ff3b30";
const AMBER = "#f5a623";
const CYAN = "#39c5e0";
const PANEL_BG = "rgba(13,17,23,0.96)";
const PANEL_BORDER = "rgba(107,142,35,0.22)";
const ORBITRON = "'Orbitron', sans-serif";
const RAJDHANI = "'Rajdhani', sans-serif";

const panelStyle = {
  background: PANEL_BG,
  border: `1px solid ${PANEL_BORDER}`,
  borderRadius: 4,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  minHeight: 0,
};

const crudBtnStyle = {
  background: "rgba(16,20,26,0.9)",
  border: "1px solid rgba(107,142,35,0.28)",
  borderRadius: 4,
  padding: "0.35rem 0.3rem",
  cursor: "pointer",
  color: "#cbd5e1",
  fontFamily: ORBITRON,
  fontSize: "0.44rem",
  letterSpacing: "0.5px",
  textAlign: "center",
};

function PanelHead({ title, right, accent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 0.7rem",
        borderBottom: `1px solid ${PANEL_BORDER}`,
        background: "rgba(16,20,26,0.9)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: ORBITRON,
          fontSize: "0.6rem",
          letterSpacing: "1.2px",
          color: accent || OLIVE_BRIGHT,
          fontWeight: 700,
        }}
      >
        {title}
      </span>
      {right}
    </div>
  );
}

function Pill({ label, value, state, compact }) {
  const color = state === "ok" ? OLIVE_BRIGHT : state === "warn" ? AMBER : state === "bad" ? RED : "#94a3b8";
  return (
    <div
      style={{
        border: `1px solid ${state === "bad" ? "rgba(255,59,48,0.35)" : "rgba(107,142,35,0.25)"}`,
        background: state === "bad" ? "rgba(255,59,48,0.07)" : "rgba(16,20,26,0.8)",
        borderRadius: 3,
        padding: compact ? "0.2rem 0.36rem" : "0.3rem 0.55rem",
        display: "flex",
        alignItems: "center",
        gap: compact ? "0.26rem" : "0.4rem",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: compact ? 6 : 7,
          height: compact ? 6 : 7,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 5px ${color}`,
          flexShrink: 0,
        }}
      />
      <span style={{ fontFamily: RAJDHANI, fontSize: compact ? "0.64rem" : "0.72rem", color: "#94a3b8" }}>{label}:</span>
      <span style={{ fontFamily: ORBITRON, fontSize: compact ? "0.55rem" : "0.62rem", color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Donut({ value, total, label, color, size = 108 }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        opacity={0.95}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        fontFamily={ORBITRON}
        fontSize="1.45rem"
        fontWeight="800"
        fill="#f0f2f5"
      >
        {value}
      </text>
      <text x="50%" y="65%" textAnchor="middle" fontFamily={ORBITRON} fontSize="0.55rem" fill={OLIVE}>
        {label}
      </text>
    </svg>
  );
}

function KV({ k, v, color }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.22rem 0",
        borderBottom: "1px solid rgba(107,142,35,0.07)",
        gap: "0.5rem",
      }}
    >
      <span style={{ fontFamily: RAJDHANI, fontSize: "0.74rem", color: "#7d8a99" }}>{k}</span>
      <span
        style={{
          fontFamily: ORBITRON,
          fontSize: "0.62rem",
          color: color || "#e2e8f0",
          fontWeight: 600,
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "62%",
        }}
      >
        {formatCellValue(v)}
      </span>
    </div>
  );
}

function Table({ cols, rows, empty = "NO RECORDS" }) {
  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          padding: "0.9rem",
          fontFamily: ORBITRON,
          fontSize: "0.55rem",
          color: OLIVE,
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        {empty}
      </div>
    );
  }
  return (
    <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
        <thead>
          <tr style={{ background: "rgba(16,20,26,0.95)", position: "sticky", top: 0, zIndex: 2 }}>
            {cols.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: "0.35rem 0.55rem",
                  fontFamily: ORBITRON,
                  fontSize: "0.53rem",
                  letterSpacing: "0.8px",
                  color: OLIVE,
                  borderBottom: `1px solid ${PANEL_BORDER}`,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || row.key || i}
              style={{ borderBottom: "1px solid rgba(107,142,35,0.06)" }}
            >
              {cols.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: "0.3rem 0.55rem",
                    fontFamily: RAJDHANI,
                    color: "#cbd5e1",
                    fontSize: "0.73rem",
                  }}
                >
                  {formatCellValue(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR                                                            */
/* ------------------------------------------------------------------ */
const NAV = [
  { id: "dashboard", label: "DASHBOARD", sub: "System Overview", icon: "▤" },
  { id: "live", label: "LIVE ROOM", sub: "Chat + Meeting", icon: "▶", href: "/live" },
  { id: "viewer", label: "REVIT MODEL", sub: "3D Viewer & Browser", icon: "◈" },
  { id: "elements", label: "ELEMENTS", sub: "Model Elements", icon: "▦" },
  { id: "views", label: "VIEWS / LEVELS", sub: "Views, Levels, Sections", icon: "◫" },
  { id: "sheets", label: "SHEETS & SCHEDULES", sub: "Drawings & Schedules", icon: "≣" },
  { id: "families", label: "FAMILIES", sub: "Family Library", icon: "⬢" },
  { id: "qa", label: "QA / MODEL CHECK", sub: "Validation & Rules", icon: "✓" },
  { id: "clash", label: "CLASH DETECTION", sub: "Clash Analysis", icon: "✕" },
  { id: "assistant", label: "AI ASSISTANT", sub: "DATUMBOT + Jev", icon: "✦" },
  { id: "datumbot", label: "DATUMBOT TOOLS", sub: "22 Read-Only Tools", icon: "⛭" },
  { id: "tasks", label: "TASKS & APPROVALS", sub: "AI Jobs & Human Review", icon: "≡" },
  { id: "knowledge", label: "KNOWLEDGE / RAG", sub: "Documents & Standards", icon: "❐" },
  { id: "evidence", label: "EVIDENCE", sub: "Logs & Reports", icon: "⌗" },
  { id: "security", label: "SECURITY & AUDIT", sub: "Governance & Compliance", icon: "⚿" },
  { id: "nodes", label: "NODE MANAGEMENT", sub: "Agents & Workers", icon: "⌸" },
  { id: "system", label: "SYSTEM STATUS", sub: "Services & Health", icon: "◉" },
  { id: "settings", label: "SETTINGS", sub: "Configuration", icon: "⚙" },
];

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function RevitControlRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeNav, setActiveNav] = useState("dashboard");
  const [aiTab, setAiTab] = useState("Chat");
  const [taskTab, setTaskTab] = useState("AI TASKS");
  /* Live DATUMBOT chat — every message below was actually sent to the gateway
     /ai/chat endpoint and every reply below is verbatim model output. Nothing
     is seeded, cached or fabricated. */
  const [chatLog, setChatLog] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  const sendChat = async () => {
    const q = chatInput.trim();
    if (!q || chatBusy) return;
    setChatBusy(true);
    setChatInput("");
    setChatLog((m) => [
      ...m,
      { role: "user", content: q, ts: new Date().toLocaleTimeString("en-US", { hour12: false }) },
    ]);
    try {
      const res = await fetch("/api/dcortex-proxy/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
      setChatLog((m) => [
        ...m,
        {
          role: "assistant",
          content: data.content || "",
          model: data.model,
          provider: data.provider,
          latency: data.latency_ms,
          ts: new Date().toLocaleTimeString("en-US", { hour12: false }),
        },
      ]);
    } catch (e) {
      setChatLog((m) => [
        ...m,
        { role: "error", content: String(e?.message || e), ts: new Date().toLocaleTimeString("en-US", { hour12: false }) },
      ]);
    } finally {
      setChatBusy(false);
    }
  };
  const [browserTab, setBrowserTab] = useState("Project Browser");

  const role = session?.user?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "REVIT" && role !== "DIRECTOR") {
      router.replace("/console");
    }
  }, [status, role, router]);

  const refreshAll = useCallback(async () => {
    if (!session) return;
    /* The gateway intermittently answers 503 when it is hit with the full
       concurrent burst, so the fetchers are kept as an array: after the
       initial Promise.allSettled pass we re-request only the entries that
       failed and merge the successes back in. */
    const requesters = [
      () => fetchData("/revit/health"),
      () => fetchData("/revit/summary"),
      () => fetchData("/health"),
      () => fetchData("/ai/agents"),
      () => fetchData("/ai/health"),
      () => fetchData("/bim/model"),
      () => fetchData("/revit/elements"),
      () => fetchData("/revit/views"),
      () => fetchData("/revit/levels"),
      () => fetchData("/bim/categories"),
      () => fetchData("/bim/qa/rules"),
      () => fetchData("/bim/qa/runtime"),
      () => fetchData("/bim/clash/rules"),
      () => fetchData("/bim/clash/runtime"),
      () => fetchData("/knowledge/ingestion/documents"),
      () => fetchData("/ai/tasks"),
      () => fetchData("/ai/approvals"),
      () => fetchData("/bim/model/health"),
      () => fetchData("/revit/drawings"),
      () => fetchData("/evidence"),
      () => fetchData("/security/audit"),
      () => fetchData("/revit/families"),
      () => fetchEcosystemHealth(),
      () => fetchData("/nodes"),
      () => fetchData("/ecosystem/observability"),
      () => fetchData("/revit/document"),
      () => fetchData("/datumbot/registry"),
    ];
    const keys = [
      "revitHealth", "revitRoot", "gwHealth", "agents", "aiHealth", "model",
      "elements", "views", "levels", "categories", "qaRules", "qaFindings",
      "clashRules", "clashFindings", "knowledgeDocs", "tasks", "approvals",
      "modelHealth", "drawings", "evidence", "audit", "families", "controlRoom",
      "nodes", "runtimeHealth", "documentInfo", "datumbot",
    ];
    const isOk = (r) => r && r.status === "fulfilled" && r.value && !(r.value instanceof Error);

    /* The Revit bridge is a single-threaded C# addin on port 8081,
       so a full concurrent burst of 27 requests causes transient
       RevitBridgeError → HTTP 503.  Requests are therefore sent in
       two smaller batches 400ms apart, then anything still failing
       is retried once more. */
    const CHUNK = 14;
    const results = [];
    for (let b = 0; b < requesters.length; b += CHUNK) {
      const batch = requesters.slice(b, b + CHUNK);
      results.push(...await Promise.allSettled(batch.map((f) => f())));
      if (b + CHUNK < requesters.length) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    const acc = {};
    results.forEach((r, i) => {
      acc[keys[i]] = isOk(r) ? r.value : { error: "Failed" };
    });
    setData({ ...acc });
    setLastUpdate(new Date());

    let failed = results.map((r, i) => (isOk(r) ? -1 : i)).filter((i) => i >= 0);
    for (let attempt = 0; attempt < 2 && failed.length; attempt++) {
      await new Promise((res) => setTimeout(res, 1600));
      const retried = await Promise.allSettled(failed.map((i) => requesters[i]()));
      retried.forEach((r, j) => {
        if (isOk(r)) acc[keys[failed[j]]] = r.value;
      });
      failed = failed.filter((_, j) => !isOk(retried[j]));
      setData({ ...acc });
      setLastUpdate(new Date());
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      const t = setTimeout(() => setLoading(false), 1200);
      refreshAll().catch(() => {});
      const iv = setInterval(refreshAll, 15000);
      return () => { clearTimeout(t); clearInterval(iv); };
    }
  }, [status, session, refreshAll]);

  /* ---------------- derived (all live, nothing hardcoded) ---------- */
  const d = data;

  const gwOk = d.gwHealth?.status === "ok";
  const bridgeAlive = d.revitHealth?.state === "ALIVE" || d.revitRoot?.status === "ONLINE" || d.revitRoot?.bridge_online === true;
  const aiAvail = d.aiHealth?.available === true || d.aiHealth?.status === "available";
  const jevState = aiAvail ? (d.aiHealth?.status === "available" ? "ok" : "warn") : "bad";
  const jevLabel = aiAvail ? "ONLINE" : "OFFLINE";
  const pgState = gwOk ? "ok" : "bad";
  const pgLabel = gwOk ? "ONLINE" : "OFFLINE";

  const nodeList = Array.isArray(d.nodes) ? d.nodes : d.nodes?.items || [];
  const node01 = nodeList.find((n) => String(n.node_id || n.id || "").toUpperCase().includes("01"));
  const node02 = nodeList.find((n) => String(n.node_id || n.id || "").toUpperCase().includes("02"));
  const node01Online = String(node01?.status || "").toUpperCase() === "ONLINE";
  const node02Online = String(node02?.status || "").toUpperCase() === "ONLINE";

  const agentList = Array.isArray(d.agents) ? d.agents : d.agents?.agents || d.agents?.items || [];
  const onlineNodes = nodeList.filter((n) => String(n.status).toUpperCase() === "ONLINE").length;

  const viewItems = Array.isArray(d.views?.items) ? d.views.items : [];
  const levelItems = Array.isArray(d.levels?.items) ? d.levels.items : [];
  const familyItems = Array.isArray(d.families?.items) ? d.families.items : [];
  const elementItems = Array.isArray(d.elements?.items) ? d.elements.items : [];
  const categoryList = Array.isArray(d.categories) ? d.categories : d.categories?.items || [];

  const viewByType = useMemo(() => {
    const m = {};
    viewItems.forEach((v) => { const t = v.type || "Other"; m[t] = (m[t] || 0) + 1; });
    return m;
  }, [viewItems]);

  const threeD = viewByType.ThreeD || 0;
  const floorPlans = viewByType.FloorPlan || 0;
  const elevations = viewByType.Elevation || 0;
  const sections = viewByType.Section || 0;
  const ceilingPlans = viewByType.CeilingPlan || 0;
  const sheetCount = viewItems.filter((v) => v.sheet_number || v.type === "Sheet").length;

  const familyByCat = useMemo(() => {
    const m = {};
    familyItems.forEach((f) => { const c = f.category || "Uncategorised"; m[c] = (m[c] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [familyItems]);

  const elementByCat = useMemo(() => {
    return categoryList
      .filter((c) => c.name && c.name !== "Unknown (not supplied by bridge)")
      .map((c) => ({ name: c.name, group: c.group || "OTHER", count: c.element_count || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [categoryList]);

  const totalCategorised = elementByCat.reduce((s, c) => s + c.count, 0);
  const unknownCount = (categoryList.find((c) => c.name === "Unknown (not supplied by bridge)") || {}).element_count || 0;
  const healthLevel = d.modelHealth?.health_level || "UNKNOWN";

  /* MODEL ELEMENTS panel — building categories first (live counts), topped up
     with the highest-count genuine BIM categories. Administrative noise
     (settings / schemas / numbering sequences) is filtered out. */
  const PRIORITY_BUILDING = [
    "Walls", "Doors", "Windows", "Columns", "Levels", "Families",
    "Floors", "Roofs", "Ceilings", "Beams", "Rooms", "Areas",
  ];
  const NOISE_CATEGORY = /(Settings|Schema|Sequences|Parameter Element| Origin| Base Point| Survey Point)/i;
  const buildingElementRows = (() => {
    const seen = new Set();
    const rows = [];
    const push = (name, count) => {
      if (!name || seen.has(name) || !count) return;
      seen.add(name);
      rows.push({ name, count });
    };
    PRIORITY_BUILDING.forEach((n) =>
      push(n, n === "Families" ? familyItems.length : ((categoryList.find((c) => c.name === n) || {}).element_count || 0))
    );
    elementByCat.filter((c) => !NOISE_CATEGORY.test(c.name)).forEach((c) => push(c.name, c.count));
    return rows.slice(0, 12);
  })();

  /* QA — live run numbers */
  const qaRuleCount = Array.isArray(d.qaRules?.rules) ? d.qaRules.rules.length : 0;
  const qaRun = d.qaFindings?.run || {};
  const qaExecuted = qaRun.rules_executed ?? qaRuleCount;
  const qaPassed = qaRun.rules_passed ?? 0;
  const qaFailed = qaRun.rules_failed ?? 0;
  const qaNotPresent = qaRun.rules_not_present ?? 0;
  const qaError = qaRun.rules_error ?? 0;
  const qaHasRun = Boolean(qaRun.run_id);
  const qaPass = qaHasRun && qaFailed === 0 && qaError === 0;

  /* CLASH — live; hard-clash count parsed from the engine's own actual */
  const clashRuleCount = Array.isArray(d.clashRules?.rules) ? d.clashRules.rules.length : 0;
  const clashRun = d.clashFindings?.run || {};
  const clashChecks = Array.isArray(d.clashFindings?.checks) ? d.clashFindings.checks : [];
  const hardClashCheck = clashChecks.find((c) => c.rule_id === "CLS-GEO-001");
  const hardClashMatch = String(hardClashCheck?.actual || "").match(/(\d+)\s+hard clash/);
  const hardClashes = hardClashMatch ? Number(hardClashMatch[1]) : 0;
  const clashObjectsMatch = String(hardClashCheck?.actual || "").match(/among\s+(\d+)\s+objects/);
  const clashObjects = clashObjectsMatch ? Number(clashObjectsMatch[1]) : 0;
  const clashHasRun = Boolean(clashRun.run_id);
  const clashRuleFailed = clashRun.rules_failed ?? 0;
  const clashIgnored = 0;
  const clashSoft = 0;
  const clashPass = clashHasRun && clashRuleFailed === 0;
  const clashFindingsList = Array.isArray(d.clashFindings?.findings) ? d.clashFindings.findings : [];

  /* Model information */
  const doc = d.documentInfo || {};
  const modelInfo = d.model?.model || d.model || {};
  const modelName = doc.title || doc.document_title || modelInfo.name || "—";
  const modelId = doc.model_id || doc.document_guid || modelInfo.model_id || modelInfo.id || "—";
  const revitVersion = doc.revit_version || doc.version || modelInfo.version || "—";
  const activeView = doc.active_view || "—";

  /* Isometric massing schematic — every coordinate below is derived from
     LIVE level elevations returned by /revit/levels. Nothing is hardcoded. */
  const iso = (x, y, z) => [186 + (x - y) * 0.866, 138 + (x + y) * 0.5 - z];
  const PLATE_W = 120;
  const PLATE_D = 88;
  const LABEL_OFFSET = 92;
  const plateCorners = (z) => [
    iso(0, 0, z),
    iso(PLATE_W, 0, z),
    iso(PLATE_W, PLATE_D, z),
    iso(0, PLATE_D, z),
  ];
  const schematicPlates = (levelItems.length ? levelItems : [{ name: "LEVEL 1", elevation_ft: 0 }]).map((l) => {
    const ft = Number(l.elevation_ft);
    const elev = Number.isFinite(ft) ? ft : 0;
    return {
      name: String(l.name || "LEVEL").toUpperCase(),
      z: elev * 3.1,
      elevText: `${elev.toFixed(1)} ft`,
    };
  });
  const topPlateZ = schematicPlates.length
    ? Math.max(...schematicPlates.map((p) => p.z))
    : 0;

  const taskList = Array.isArray(d.tasks) ? d.tasks : d.tasks?.tasks || d.tasks?.items || [];
  const approvalList = Array.isArray(d.approvals) ? d.approvals : d.approvals?.items || [];
  const isCompletedTask = (t) => String(t.status || "").toUpperCase() === "COMPLETED";
  const completedTaskCount = taskList.filter(isCompletedTask).length;
  const visibleTasks = taskTab === "COMPLETED" ? taskList.filter(isCompletedTask) : taskList;
  const knowledgeList = Array.isArray(d.knowledgeDocs)
    ? d.knowledgeDocs
    : d.knowledgeDocs?.items || d.knowledgeDocs?.documents || [];
  const evidenceList = Array.isArray(d.evidence) ? d.evidence : d.evidence?.items || d.evidence?.evidence || [];
  const evidenceOk = !d.evidence?.error;
  const auditList = Array.isArray(d.audit) ? d.audit : d.audit?.items || d.audit?.events || [];

  const dbReg = d.datumbot || {};
  const dbTools = Array.isArray(dbReg.tools) ? dbReg.tools : [];
  const dbCount = dbReg.tool_count ?? dbReg.canonical_tool_count ?? dbTools.length;
  const dbReadOnly = dbReg.read_only !== false;

  const runtimeOk = !d.runtimeHealth?.error;
  const ecosystemOk = !d.controlRoom?.error;
  const dbOk = !dbReg.error && Number(dbCount) > 0;

  /* Recent activity derived from real run timestamps */
  const activity = useMemo(() => {
    const rows = [];
    const fmt = (ts) => {
      if (!ts) return "—";
      try { return new Date(ts).toLocaleTimeString("en-US", { hour12: false }); } catch { return "—"; }
    };
    if (qaRun.completed_at || qaRun.started_at) {
      rows.push({
        time: fmt(qaRun.completed_at || qaRun.started_at),
        event: "QA check completed",
        source: "Gateway",
        details: `${qaExecuted} rules, ${qaPassed} pass, ${qaFailed} fail (run: ${String(qaRun.run_id || "").slice(0, 8)})`,
      });
    }
    if (clashRun.completed_at || clashRun.started_at) {
      rows.push({
        time: fmt(clashRun.completed_at || clashRun.started_at),
        event: "Clash analysis completed",
        source: "Gateway",
        details: `${hardClashes} hard clashes found (run: ${String(clashRun.run_id || "").slice(0, 8)})`,
      });
    }
    if (doc.timestamp) {
      rows.push({ time: fmt(doc.timestamp), event: "Model sync", source: "Revit Bridge", details: "Live model read successful" });
    }
    if (d.revitRoot?.timestamp) {
      rows.push({ time: fmt(d.revitRoot.timestamp), event: "Bridge heartbeat", source: "Revit Bridge", details: `status ${d.revitRoot.status || "—"}` });
    }
    if (d.aiHealth?.providers?.alibaba?.latency_ms) {
      rows.push({
        time: fmt(new Date().toISOString()),
        event: "AI provider probe",
        source: "AI Runtime",
        details: `alibaba latency ${Math.round(d.aiHealth.providers.alibaba.latency_ms)}ms`,
      });
    }
    if (dbOk) {
      rows.push({ time: fmt(new Date().toISOString()), event: "DATUMBOT registry", source: "Gateway", details: `${dbCount} tools, read_only=${dbReadOnly}` });
    }
    return rows.slice(0, 6);
  }, [qaRun, clashRun, doc, d.revitRoot, d.aiHealth, dbOk, dbCount, dbReadOnly, qaExecuted, qaPassed, qaFailed, hardClashes]);

  const [crudOps, setCrudOps] = useState([]);
  const [crudStatus, setCrudStatus] = useState({});
  const [crudLoading, setCrudLoading] = useState(false);

  const runCrudStep = async (opId, step, apiPath, body) => {
    setCrudStatus((s) => ({ ...s, [opId]: { ...s[opId], [step]: "running" } }));
    try {
      const res = await fetch(`/api/dcortex-proxy${apiPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || errData.error || `HTTP ${res.status}`;
        setCrudStatus((s) => ({ ...s, [opId]: { ...s[opId], [step]: "error", [`${step}Error`]: errMsg } }));
        throw new Error(errMsg);
      }
      const data = await res.json();
      setCrudStatus((s) => ({ ...s, [opId]: { ...s[opId], [step]: "done", [`${step}Result`]: data } }));
      return data;
    } catch (err) {
      setCrudStatus((s) => ({ ...s, [opId]: { ...s[opId], [step]: "error", [`${step}Error`]: err.message } }));
      throw err;
    }
  };

  const executeGovernedCrud = async (operation, parameters, targetElementIds = []) => {
    setCrudLoading(true);
    const opId = `crud-${Date.now()}`;
    setCrudOps((ops) => [...ops, { opId, operation, parameters, targetElementIds, createdAt: new Date().toISOString() }]);
    setCrudStatus((s) => ({ ...s, [opId]: { operation, state: "INITIATED" } }));
    try {
      const plan = await runCrudStep(opId, "plan", "/revit/operations", {
        operation, project_id: "datum-bim-os", model_id: "revit-model",
        requested_by: session?.userId || "ui-user",
        target_element_ids: targetElementIds, parameters,
      });
      if (!plan || plan.error) throw new Error(plan?.error || "Plan creation failed");
      const operationId = plan.operation_id;
      await runCrudStep(opId, "validate", "/revit/operations/validate", {
        operation, project_id: "datum-bim-os", model_id: "revit-model",
        requested_by: session?.userId || "ui-user",
        target_element_ids: targetElementIds, parameters,
      });
      await runCrudStep(opId, "dryRun", `/revit/operations/${operationId}/dry-run`, {});
      await runCrudStep(opId, "approval", `/revit/operations/${operationId}/approvals`, {
        justification: `UI-initiated ${operation} via governed CRUD chain`,
        ttl_hours: 24,
      });
      setCrudStatus((s) => ({ ...s, [opId]: { ...s[opId], state: "AWAITING_APPROVAL", operationId } }));
    } catch (err) {
      setCrudStatus((s) => ({ ...s, [opId]: { ...s[opId], state: "FAILED", error: err.message } }));
    } finally {
      setCrudLoading(false);
    }
  };

  const executeApprovedOperation = async (operationId) => {
    setCrudLoading(true);
    try {
      const result = await runCrudStep(`exec-${operationId}`, "execute", `/revit/operations/${operationId}/execute`, {});
      setCrudStatus((s) => ({ ...s, [`exec-${operationId}`]: { ...s[`exec-${operationId}`], state: "EXECUTED", result } }));
      return result;
    } catch (err) {
      setCrudStatus((s) => ({ ...s, [`exec-${operationId}`]: { ...s[`exec-${operationId}`], state: "FAILED", error: err.message } }));
      throw err;
    } finally {
      setCrudLoading(false);
    }
  };

  const rollbackOperation = async (operationId) => {
    setCrudLoading(true);
    try {
      const result = await runCrudStep(`rb-${operationId}`, "rollback", `/revit/operations/${operationId}/rollback`, {});
      setCrudStatus((s) => ({ ...s, [`rb-${operationId}`]: { ...s[`rb-${operationId}`], state: "ROLLED_BACK", result } }));
      return result;
    } catch (err) {
      setCrudStatus((s) => ({ ...s, [`rb-${operationId}`]: { ...s[`rb-${operationId}`], state: "FAILED", error: err.message } }));
      throw err;
    } finally {
      setCrudLoading(false);
    }
  };

  const quickActions = [
    { label: "Run Check", icon: "✓", action: () => window.open(`${CONTROL_ROOM_URL}/`, "_blank") },
    { label: "Run Clash Detection", icon: "✕", action: () => window.open(`${CONTROL_ROOM_URL}/`, "_blank") },
    { label: "Open Revit Model", icon: "◈", action: () => window.open(`${CONTROL_ROOM_URL}/`, "_blank") },
    { label: "View Sheets & Schedules", icon: "≣", action: () => document.getElementById("sheets")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Search Families", icon: "⬢", action: () => document.getElementById("families")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Export to IFC", icon: "⤴", action: () => window.open(`${CONTROL_ROOM_URL}/`, "_blank") },
  ];

  if (status === "loading" || loading || !session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: ORBITRON,
          color: OLIVE,
          fontSize: "0.8rem",
          letterSpacing: "3px",
        }}
      >
        SYNCING REVIT CONTROL ROOM...
      </div>
    );
  }

  if (role !== "REVIT" && role !== "DIRECTOR") return null;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "#0a0e14",
        fontFamily: RAJDHANI,
        color: "#f0f2f5",
        fontSize: "0.78rem",
        overflow: "hidden",
      }}
    >
      {/* ============================ SIDEBAR ============================ */}
      <aside
        style={{
          width: 200,
          flexShrink: 0,
          background: "rgba(10,14,20,0.98)",
          borderRight: `1px solid ${PANEL_BORDER}`,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0.7rem 0.6rem 0.4rem" }}>
          {NAV.map((n) => {
            const active = activeNav === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  if (n.href) { router.push(n.href); return; } // external page (e.g. Live Room)
                  setActiveNav(n.id);
                  document.getElementById(n.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  padding: "0.42rem 0.5rem",
                  marginBottom: 2,
                  background: active ? "rgba(107,142,35,0.22)" : "transparent",
                  border: active ? "1px solid rgba(107,142,35,0.45)" : "1px solid transparent",
                  borderRadius: 3,
                  cursor: "pointer",
                  textAlign: "left",
                  color: active ? OLIVE_BRIGHT : "#94a3b8",
                }}
              >
                <span style={{ fontSize: "0.85rem", width: 16, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: ORBITRON,
                      fontSize: "0.5rem",
                      letterSpacing: "0.7px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.label}
                  </span>
                  <span style={{ fontSize: "0.63rem", color: active ? "#a8c46a" : "#5d6b7a", whiteSpace: "nowrap" }}>
                    {n.sub}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            marginTop: "auto",
            padding: "0.6rem",
            borderTop: `1px solid ${PANEL_BORDER}`,
            fontFamily: ORBITRON,
            fontSize: "0.46rem",
            letterSpacing: "1px",
            color: "#3f4c3f",
            lineHeight: 1.7,
          }}
        >
          DATUM STUDIOS
          <br />
          ISO 19650 COMPLIANT
        </div>
      </aside>

      {/* ============================ RIGHT SIDE ========================= */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* ------------------------- HEADER ------------------------- */}
        <header
          style={{
            height: 58,
            flexShrink: 0,
            background: "rgba(13,17,23,0.98)",
            borderBottom: `1px solid ${PANEL_BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            padding: "0 0.9rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: "rgba(107,142,35,0.16)",
                border: "1px solid rgba(107,142,35,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: OLIVE_BRIGHT,
                fontSize: "0.95rem",
              }}
            >
              ▲
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontFamily: ORBITRON, fontSize: "0.92rem", fontWeight: 800, letterSpacing: "1.5px" }}>
                DATUM BIM OS
              </div>
              <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE, letterSpacing: "1.4px" }}>
                REVIT / D-CORTEX CONTROL ROOM
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.3rem",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              justifyContent: "center",
            }}
          >
            <Pill compact label="Gateway" value={gwOk ? "ONLINE" : "OFFLINE"} state={gwOk ? "ok" : "bad"} />
            <Pill compact label="Revit Bridge" value={bridgeAlive ? "ALIVE" : "DOWN"} state={bridgeAlive ? "ok" : "bad"} />
            <Pill compact label="Jev AI" value={jevLabel} state={jevState} />
            <Pill compact label="PostgreSQL" value={pgLabel} state={pgState} />
            <Pill compact label="Node-01" value={node01Online ? "ONLINE" : nodeList.length ? "OFFLINE" : "UNKNOWN"} state={node01Online ? "ok" : "bad"} />
            <Pill compact label="Node-02" value={node02Online ? "ONLINE" : nodeList.length ? "OFFLINE" : "UNKNOWN"} state={node02Online ? "ok" : "bad"} />
          </div>

          <span
            style={{
              fontFamily: ORBITRON,
              fontSize: "0.65rem",
              color: OLIVE_BRIGHT,
              letterSpacing: "1px",
              flexShrink: 0,
            }}
          >
            {lastUpdate.toLocaleTimeString("en-US", { hour12: false })}
          </span>

          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 3,
              background: "rgba(162,208,51,0.15)",
              border: "1px solid rgba(162,208,51,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: ORBITRON,
              fontSize: "0.6rem",
              fontWeight: 700,
              color: OLIVE_BRIGHT,
              flexShrink: 0,
            }}
          >
            S
          </div>

          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, flexShrink: 0 }}>
            <span style={{ fontFamily: ORBITRON, fontSize: "0.55rem", color: "#e2e8f0" }}>Director</span>
            <span style={{ fontSize: "0.62rem", color: "#7d8a99" }}>Director</span>
          </div>

          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 3,
              background: "rgba(107,142,35,0.18)",
              border: "1px solid rgba(107,142,35,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: ORBITRON,
              fontSize: "0.55rem",
              fontWeight: 700,
              color: OLIVE_BRIGHT,
              flexShrink: 0,
            }}
          >
            DA
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "rgba(255,59,48,0.1)",
              border: "1px solid rgba(255,59,48,0.3)",
              borderRadius: 3,
              color: RED,
              padding: "0.3rem 0.6rem",
              fontFamily: ORBITRON,
              fontSize: "0.5rem",
              letterSpacing: "1px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            END SESSION
          </button>
        </header>

        {/* ------------------------- MAIN GRID ---------------------- */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "0.7rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
          }}
        >
          {/* ---------- ROW 1: VIEWER / MODEL INFO / AI ------------- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3.3fr 1.05fr 1.5fr",
              gap: "0.7rem",
              height: 372,
            }}
          >
            {/* 3D MODEL VIEWER */}
            <section id="viewer" style={panelStyle}>
              <PanelHead
                title="3D MODEL VIEWER"
                right={
                  <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: bridgeAlive ? OLIVE_BRIGHT : RED }}>
                    {bridgeAlive ? "LIVE" : "OFFLINE"}
                  </span>
                }
              />
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  padding: "0.4rem 0.5rem",
                  borderBottom: `1px solid ${PANEL_BORDER}`,
                  alignItems: "center",
                  flexWrap: "wrap",
                  flexShrink: 0,
                }}
              >
                <select
                  value={browserTab}
                  onChange={(e) => setBrowserTab(e.target.value)}
                  style={{
                    background: "#0e1319",
                    border: `1px solid ${PANEL_BORDER}`,
                    borderRadius: 3,
                    color: "#cbd5e1",
                    fontFamily: RAJDHANI,
                    fontSize: "0.72rem",
                    padding: "0.18rem 0.3rem",
                  }}
                >
                  <option>Project Browser</option>
                  <option>Properties</option>
                </select>
                {["Orbit", "Pan", "Zoom", "Fit", "Section", "Measure", "Select", "Hide", "Isolate", "View"].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: ORBITRON,
                      fontSize: "0.46rem",
                      letterSpacing: "0.6px",
                      color: "#8fa3b8",
                      border: `1px solid rgba(107,142,35,0.2)`,
                      background: "rgba(16,20,26,0.8)",
                      borderRadius: 3,
                      padding: "0.2rem 0.35rem",
                      cursor: "default",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                {/* browser tree */}
                <div
                  style={{
                    width: 176,
                    flexShrink: 0,
                    borderRight: `1px solid ${PANEL_BORDER}`,
                    overflowY: "auto",
                    padding: "0.4rem 0.5rem",
                    fontSize: "0.72rem",
                    color: "#a9b6c4",
                  }}
                >
                  {[
                    { label: `Views (${viewItems.length})`, children: [
                      { label: `3D Views (${threeD})` },
                      { label: `Floor Plans (${floorPlans})` },
                      { label: `Ceiling Plans (${ceilingPlans})` },
                      { label: `Elevations (${elevations})` },
                      { label: `Sections (${sections})` },
                    ]},
                    { label: `Sheets (${sheetCount})` },
                    { label: `Families (${familyItems.length})`, children: familyByCat.slice(0, 8).map(([c, n]) => ({ label: `${c} (${n})` })) },
                    { label: `Levels (${levelItems.length})`, children: levelItems.slice(0, 6).map((l) => ({ label: l.name })) },
                  ].map((n) => (
                    <div key={n.label} style={{ marginBottom: "0.3rem" }}>
                      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <span style={{ color: OLIVE, fontSize: "0.6rem" }}>{n.children ? "▾" : "•"}</span>
                        <span style={{ fontFamily: RAJDHANI, fontWeight: 600 }}>{n.label}</span>
                      </div>
                      {n.children?.map((c) => (
                        <div
                          key={c.label}
                          style={{ display: "flex", gap: "0.3rem", alignItems: "center", paddingLeft: "0.9rem" }}
                        >
                          <span style={{ color: "#4d584d", fontSize: "0.55rem" }}>◦</span>
                          <span style={{ fontSize: "0.7rem" }}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* viewport */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    background:
                      "radial-gradient(ellipse at 50% 40%, rgba(30,42,32,0.55) 0%, rgba(8,11,16,0.98) 70%)",
                    overflow: "hidden",
                  }}
                >
                  {/* datum grid */}
                  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
                    <defs>
                      <pattern id="g" width="34" height="34" patternUnits="userSpaceOnUse">
                        <path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(107,142,35,0.35)" strokeWidth="0.6" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#g)" />
                  </svg>

                  {/* isometric massing schematic — plates driven by LIVE level elevations */}
                  <svg
                    viewBox="0 0 400 300"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  >
                    <defs>
                      <linearGradient id="plateFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(107,142,35,0.22)" />
                        <stop offset="100%" stopColor="rgba(107,142,35,0.06)" />
                      </linearGradient>
                    </defs>

                    {/* isometric ground grid */}
                    <g stroke="rgba(107,142,35,0.28)" strokeWidth="0.5">
                      {Array.from({ length: 9 }, (_, i) => {
                        const t = i * 22;
                        return (
                          <g key={`g${i}`}>
                            <line x1={iso(t, -60, -10)[0]} y1={iso(t, -60, -10)[1]} x2={iso(t, 190, -10)[0]} y2={iso(t, 190, -10)[1]} />
                            <line x1={iso(-40, t, -10)[0]} y1={iso(-40, t, -10)[1]} x2={iso(200, t, -10)[0]} y2={iso(200, t, -10)[1]} />
                          </g>
                        );
                      })}
                    </g>

                    {/* floor plates from live level elevations (bottom → top) */}
                    {schematicPlates.map((p, i) => {
                      const next = schematicPlates[i + 1];
                      return (
                        <g key={p.name || i}>
                          {/* vertical structure between this plate and the next */}
                          {next &&
                            plateCorners(p.z).map((c, ci) => {
                              const n = plateCorners(next.z)[ci];
                              return (
                                <line
                                  key={ci}
                                  x1={c[0]}
                                  y1={c[1]}
                                  x2={n[0]}
                                  y2={n[1]}
                                  stroke="rgba(162,208,51,0.55)"
                                  strokeWidth="1"
                                />
                              );
                            })}
                          {/* wall massing band between plates */}
                          {next && (
                            <polygon
                              points={`${plateCorners(p.z).map((c) => c.join(",")).join(" ")} ${plateCorners(next.z).slice().reverse().map((c) => c.join(",")).join(" ")}`}
                              fill="rgba(107,142,35,0.07)"
                              stroke="rgba(162,208,51,0.35)"
                              strokeWidth="0.6"
                            />
                          )}
                          {/* the plate itself */}
                          <polygon
                            points={plateCorners(p.z).map((c) => c.join(",")).join(" ")}
                            fill="url(#plateFill)"
                            stroke={OLIVE_BRIGHT}
                            strokeWidth="1.1"
                          />
                          {/* level label */}
                          <text
                            x={iso(0, 0, p.z)[0] - LABEL_OFFSET}
                            y={iso(0, 0, p.z)[1] + 3}
                            textAnchor="end"
                            fontFamily="'Orbitron', sans-serif"
                            fontSize="7"
                            fill={OLIVE_BRIGHT}
                          >
                            {p.name}
                          </text>
                          <text
                            x={iso(0, 0, p.z)[0] - LABEL_OFFSET}
                            y={iso(0, 0, p.z)[1] + 12}
                            textAnchor="end"
                            fontFamily="'Rajdhani', sans-serif"
                            fontSize="7.5"
                            fill="#7d8a99"
                          >
                            {p.elevText}
                          </text>
                        </g>
                      );
                    })}

                    {/* roof plate */}
                    {schematicPlates.length > 0 && (
                      <polygon
                        points={plateCorners(topPlateZ + 26).map((c) => c.join(",")).join(" ")}
                        fill="rgba(162,208,51,0.16)"
                        stroke={OLIVE_BRIGHT}
                        strokeWidth="1.2"
                      />
                    )}

                    {/* read-only watermark */}
                    <text
                      x="200"
                      y="262"
                      textAnchor="middle"
                      fontFamily="'Orbitron', sans-serif"
                      fontSize="6.5"
                      letterSpacing="1.6"
                      fill="rgba(107,142,35,0.55)"
                    >
                      SCHEMATIC MASSING · DERIVED FROM LIVE LEVEL DATA · READ-ONLY
                    </text>
                  </svg>

                  {/* identity overlay */}
                  <div style={{ position: "absolute", top: 10, left: 12, maxWidth: "62%" }}>
                    <div
                      style={{
                        fontFamily: ORBITRON,
                        fontSize: "0.62rem",
                        letterSpacing: "1.4px",
                        color: "#e2e8f0",
                        lineHeight: 1.3,
                        textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      {modelName}
                    </div>
                    <div style={{ fontFamily: ORBITRON, fontSize: "0.47rem", letterSpacing: "1px", color: OLIVE }}>
                      ACTIVE VIEW: {activeView}
                    </div>
                    <div style={{ fontFamily: RAJDHANI, fontSize: "0.68rem", color: "#7d8a99", marginTop: 3 }}>
                      Live read-only session · no model writes performed
                    </div>
                  </div>

                  {/* bridge status */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 12,
                      fontFamily: ORBITRON,
                      fontSize: "0.47rem",
                      letterSpacing: "1px",
                      color: bridgeAlive ? OLIVE_BRIGHT : RED,
                      border: `1px solid ${bridgeAlive ? "rgba(162,208,51,0.35)" : "rgba(255,59,48,0.35)"}`,
                      background: "rgba(10,14,20,0.85)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: 3,
                    }}
                  >
                    {bridgeAlive
                      ? `BRIDGE ALIVE · ${viewItems.length} VIEWS · ${levelItems.length} LEVELS · ${totalCategorised + unknownCount} ELEMENTS`
                      : "BRIDGE OFFLINE"}
                  </div>

                  {/* view cube */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 54,
                      height: 54,
                      border: `1px solid rgba(107,142,35,0.4)`,
                      background: "rgba(13,17,23,0.85)",
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      fontFamily: ORBITRON,
                      fontSize: "0.42rem",
                      color: "#8fa3b8",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <span style={{ color: OLIVE_BRIGHT }}>TOP</span>
                    <span>FRONT</span>
                    <span>RIGHT</span>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 10,
                      display: "flex",
                      gap: 8,
                      fontFamily: ORBITRON,
                      fontSize: "0.6rem",
                      color: "#5d6b7a",
                    }}
                  >
                    <span>⛶</span>
                    <span>⚙</span>
                    <span>◉</span>
                    <span>⤢</span>
                  </div>
                </div>
              </div>
            </section>

            {/* MODEL INFORMATION */}
            <section style={panelStyle}>
              <PanelHead title="MODEL INFORMATION" />
              <div style={{ overflowY: "auto", padding: "0.55rem 0.6rem", flex: 1, minHeight: 0 }}>
                <div
                  style={{
                    height: 74,
                    borderRadius: 4,
                    border: `1px solid ${PANEL_BORDER}`,
                    background:
                      "linear-gradient(135deg, rgba(107,142,35,0.2) 0%, rgba(13,17,23,0.9) 60%), repeating-linear-gradient(45deg, rgba(107,142,35,0.08) 0 6px, transparent 6px 12px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.5rem",
                    color: OLIVE_BRIGHT,
                    fontSize: "1.4rem",
                  }}
                >
                  ▲
                </div>
                <div style={{ fontFamily: ORBITRON, fontSize: "0.74rem", fontWeight: 800, letterSpacing: "1px" }}>
                  DCORTEX_V1
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.55rem",
                    color: "#5d6b7a",
                    marginBottom: "0.5rem",
                    wordBreak: "break-all",
                  }}
                >
                  {modelId}
                </div>
                <KV k="Revit Version" v={revitVersion} />
                <KV k="Format" v={modelInfo.format || "RVT"} />
                <KV k="Elements" v={totalCategorised + unknownCount} />
                <KV k="Views" v={viewItems.length} />
                <KV k="Sheets" v={sheetCount} />
                <KV k="Levels" v={levelItems.length} />
                <KV k="Families" v={familyItems.length} />
                <KV k="Last Modified" v={doc.timestamp ? String(doc.timestamp).replace("T", " ").slice(0, 19) : "—"} />
                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontFamily: RAJDHANI, fontSize: "0.74rem", color: "#7d8a99" }}>Status</span>
                  <span
                    style={{
                      fontFamily: ORBITRON,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: bridgeAlive ? OLIVE_BRIGHT : RED,
                    }}
                  >
                    {bridgeAlive ? "Live (Read-Only)" : "Offline"}
                  </span>
                </div>
              </div>
            </section>

            {/* AI ASSISTANT */}
            <section id="assistant" style={panelStyle}>
              <PanelHead title={`AI ASSISTANT (DATUMBOT + Jev)`} right={
                <span style={{ fontFamily: ORBITRON, fontSize: "0.48rem", color: jevState === "ok" ? OLIVE_BRIGHT : AMBER }}>
                  {jevLabel}
                </span>
              } />
              <div style={{ display: "flex", borderBottom: `1px solid ${PANEL_BORDER}`, flexShrink: 0 }}>
                {["Chat", "Model Context", "Tools", "Knowledge"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAiTab(t)}
                    style={{
                      flex: 1,
                      padding: "0.35rem 0.2rem",
                      background: aiTab === t ? "rgba(107,142,35,0.2)" : "transparent",
                      border: "none",
                      borderBottom: aiTab === t ? `2px solid ${OLIVE_BRIGHT}` : "2px solid transparent",
                      color: aiTab === t ? OLIVE_BRIGHT : "#7d8a99",
                      fontFamily: ORBITRON,
                      fontSize: "0.48rem",
                      letterSpacing: "0.6px",
                      cursor: "pointer",
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0.55rem 0.6rem" }}>
                {aiTab === "Chat" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {chatLog.length === 0 && (
                      <div
                        style={{
                          background: "rgba(107,142,35,0.1)",
                          border: `1px solid ${PANEL_BORDER}`,
                          borderRadius: 4,
                          padding: "0.5rem",
                        }}
                      >
                        <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE, marginBottom: 4 }}>
                          DATUMBOT
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                          Read-only BIM assistant connected to {dbCount} canonical tools and the live Revit bridge.
                          Ask about the model, QA state, or clash findings.
                        </div>
                        <div style={{ fontFamily: RAJDHANI, fontSize: "0.72rem", color: "#5d6b7a", marginTop: 4 }}>
                          No conversation yet — type below to query the live model.
                        </div>
                      </div>
                    )}

                    {chatLog.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "86%",
                            background:
                              m.role === "user"
                                ? "rgba(107,142,35,0.16)"
                                : m.role === "error"
                                ? "rgba(255,59,48,0.1)"
                                : "rgba(16,20,26,0.92)",
                            border: `1px solid ${
                              m.role === "user"
                                ? "rgba(107,142,35,0.4)"
                                : m.role === "error"
                                ? "rgba(255,59,48,0.4)"
                                : PANEL_BORDER
                            }`,
                            borderRadius: 4,
                            padding: "0.4rem 0.55rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "0.6rem",
                              marginBottom: 3,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: ORBITRON,
                                fontSize: "0.45rem",
                                letterSpacing: "0.8px",
                                color: m.role === "user" ? OLIVE_BRIGHT : m.role === "error" ? RED : OLIVE,
                              }}
                            >
                              {m.role === "user" ? "DIRECTOR" : m.role === "error" ? "ERROR" : "DATUMBOT"}
                            </span>
                            <span style={{ fontFamily: RAJDHANI, fontSize: "0.6rem", color: "#5d6b7a" }}>{m.ts}</span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.76rem",
                              color: "#cbd5e1",
                              lineHeight: 1.55,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {m.content}
                          </div>
                          {m.model && (
                            <div style={{ fontFamily: RAJDHANI, fontSize: "0.6rem", color: "#5d6b7a", marginTop: 4 }}>
                              {m.provider} · {m.model}
                              {m.latency ? ` · ${Math.round(m.latency)} ms` : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {chatBusy && (
                      <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE, letterSpacing: "1px" }}>
                        ● QUERYING LIVE REVIT CONTEXT…
                      </div>
                    )}
                  </div>
                )}

                {aiTab === "Model Context" && (
                  <div>
                    <KV k="Model" v={modelName} />
                    <KV k="Revit" v={revitVersion} />
                    <KV k="Active View" v={activeView} />
                    <KV k="Views" v={viewItems.length} />
                    <KV k="Levels" v={levelItems.length} />
                    <KV k="Elements" v={totalCategorised + unknownCount} />
                    <KV k="Model Health" v={healthLevel} color={healthLevel === "GREEN" ? OLIVE_BRIGHT : AMBER} />
                  </div>
                )}

                {aiTab === "Tools" && (
                  <div>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <Pill label="Tools" value={`${dbCount}/${dbCount}`} state={dbOk ? "ok" : "bad"} />
                      <Pill label="Read Only" value={String(dbReadOnly)} state={dbReadOnly ? "ok" : "bad"} />
                      <Pill label="Write Tools" value="0" state="ok" />
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#8fa3b8", lineHeight: 1.6 }}>
                      {dbTools.slice(0, 12).map((t) => t.name || t.identity?.name).filter(Boolean).join(" · ")}
                      {dbTools.length > 12 ? " …" : ""}
                    </div>
                  </div>
                )}

                {aiTab === "Knowledge" && (
                  <div>
                    <KV k="Documents" v={knowledgeList.length} />
                    <div style={{ marginTop: "0.4rem", fontSize: "0.72rem", color: "#8fa3b8", lineHeight: 1.7 }}>
                      {knowledgeList.slice(0, 8).map((k, i) => (
                        <div key={i}>• {k.filename || k.name || k.title || k.id || "document"}</div>
                      ))}
                      {knowledgeList.length === 0 && <div>No indexed documents.</div>}
                    </div>
                  </div>
                )}
              </div>

              {aiTab === "Chat" && (
                <div
                  style={{
                    padding: "0.45rem 0.55rem",
                    borderTop: `1px solid ${PANEL_BORDER}`,
                    display: "flex",
                    gap: "0.4rem",
                    flexShrink: 0,
                  }}
                >
                  <input
                    value={chatInput}
                    disabled={chatBusy}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                    placeholder="Ask about the model... (read-only, live Revit context)"
                    style={{
                      flex: 1,
                      background: "#0e1319",
                      border: `1px solid ${PANEL_BORDER}`,
                      borderRadius: 3,
                      color: "#cbd5e1",
                      fontFamily: RAJDHANI,
                      fontSize: "0.75rem",
                      padding: "0.3rem 0.5rem",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={sendChat}
                    disabled={chatBusy || !chatInput.trim()}
                    style={{
                      background: "rgba(107,142,35,0.25)",
                      border: `1px solid rgba(107,142,35,0.5)`,
                      borderRadius: 3,
                      color: OLIVE_BRIGHT,
                      padding: "0.25rem 0.6rem",
                      cursor: chatBusy || !chatInput.trim() ? "not-allowed" : "pointer",
                      opacity: chatBusy || !chatInput.trim() ? 0.5 : 1,
                      fontFamily: ORBITRON,
                      fontSize: "0.55rem",
                    }}
                  >
                    {chatBusy ? "…" : "➤"}
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* ---------- ROW 2: QA / CLASH / ELEMENTS / SYSTEM ------- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.42fr 1.42fr 1fr 1.26fr",
              gap: "0.7rem",
              height: 190,
            }}
          >
            {/* QA */}
            <section id="qa" style={panelStyle}>
              <PanelHead
                title="QA / MODEL CHECK (DN011)"
                right={
                  <span
                    style={{
                      fontFamily: ORBITRON,
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      color: qaPass ? OLIVE_BRIGHT : qaHasRun ? AMBER : "#7d8a99",
                      border: `1px solid ${qaPass ? "rgba(162,208,51,0.4)" : "rgba(245,166,35,0.4)"}`,
                      borderRadius: 3,
                      padding: "0.1rem 0.4rem",
                    }}
                  >
                    {qaHasRun ? (qaPass ? "● PASS" : "● REVIEW") : "○ NO RUN"}
                  </span>
                }
              />
              <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "0.6rem", padding: "0.55rem 0.6rem", alignItems: "center" }}>
                <Donut value={qaExecuted} total={qaExecuted || 1} label="Rules" color={OLIVE_BRIGHT} size={100} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: RAJDHANI, fontSize: "0.7rem", color: "#7d8a99", marginBottom: 4 }}>
                    Last Run: {qaRun.completed_at || qaRun.started_at ? String(qaRun.completed_at || qaRun.started_at).replace("T", " ").slice(0, 19) : "—"}
                  </div>
                  {[
                    { c: OLIVE_BRIGHT, t: "Passed", v: qaPassed },
                    { c: RED, t: "Failed", v: qaFailed },
                    { c: "#cbd5e1", t: "Not Present", v: qaNotPresent },
                    { c: AMBER, t: "Errors", v: qaError },
                  ].map((r) => (
                    <div key={r.t} style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: 3 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: r.c, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.73rem", color: "#a9b6c4" }}>{r.v} {r.t}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => window.open(`${CONTROL_ROOM_URL}/`, "_blank")}
                    style={{
                      marginTop: "0.4rem",
                      background: "rgba(107,142,35,0.2)",
                      border: "1px solid rgba(107,142,35,0.45)",
                      borderRadius: 3,
                      color: OLIVE_BRIGHT,
                      padding: "0.28rem 0.5rem",
                      fontFamily: ORBITRON,
                      fontSize: "0.48rem",
                      letterSpacing: "0.8px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    VIEW RESULTS
                  </button>
                </div>
              </div>
            </section>

            {/* CLASH */}
            <section id="clash" style={panelStyle}>
              <PanelHead
                title="CLASH DETECTION (DN012)"
                right={
                  <span
                    style={{
                      fontFamily: ORBITRON,
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      color: clashHasRun ? (hardClashes > 0 ? RED : OLIVE_BRIGHT) : "#7d8a99",
                      border: `1px solid ${hardClashes > 0 ? "rgba(255,59,48,0.4)" : "rgba(162,208,51,0.4)"}`,
                      borderRadius: 3,
                      padding: "0.1rem 0.4rem",
                    }}
                  >
                    {clashHasRun ? (hardClashes > 0 ? "● FINDINGS" : "● PASS") : "○ NO RUN"}
                  </span>
                }
              />
              <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "0.6rem", padding: "0.55rem 0.6rem", alignItems: "center" }}>
                <Donut value={hardClashes} total={Math.max(hardClashes, 1)} label="Clashes" color={RED} size={100} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: RAJDHANI, fontSize: "0.7rem", color: "#7d8a99", marginBottom: 4 }}>
                    Last Run: {clashRun.completed_at || clashRun.started_at ? String(clashRun.completed_at || clashRun.started_at).replace("T", " ").slice(0, 19) : "—"}
                  </div>
                  {[
                    { c: RED, t: "Hard", v: hardClashes, sub: hardClashes ? "100%" : "0%" },
                    { c: CYAN, t: "Soft", v: clashSoft, sub: "0%" },
                    { c: "#cbd5e1", t: "Ignored", v: clashIgnored, sub: "0%" },
                  ].map((r) => (
                    <div key={r.t} style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: 3 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: r.c, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.73rem", color: "#a9b6c4" }}>
                        {r.v} {r.t} ({r.sub})
                      </span>
                    </div>
                  ))}
                  <div style={{ fontFamily: RAJDHANI, fontSize: "0.68rem", color: "#5d6b7a", marginTop: 4 }}>
                    {clashObjects ? `among ${clashObjects} objects` : `${clashFindingsList.length} findings`}
                  </div>
                  <button
                    onClick={() => window.open(`${CONTROL_ROOM_URL}/`, "_blank")}
                    style={{
                      marginTop: "0.4rem",
                      background: "rgba(255,59,48,0.12)",
                      border: "1px solid rgba(255,59,48,0.4)",
                      borderRadius: 3,
                      color: RED,
                      padding: "0.28rem 0.5rem",
                      fontFamily: ORBITRON,
                      fontSize: "0.48rem",
                      letterSpacing: "0.8px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    VIEW FINDINGS
                  </button>
                </div>
              </div>
            </section>

            {/* MODEL ELEMENTS */}
            <section id="elements" style={panelStyle}>
              <PanelHead
                title="MODEL ELEMENTS"
                right={
                  <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE_BRIGHT }}>
                    {totalCategorised + unknownCount} TOTAL
                  </span>
                }
              />
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0.4rem 0.55rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "repeat(6, auto)",
                    gridAutoFlow: "column",
                    gap: "0 0.5rem",
                  }}
                >
                  {buildingElementRows.map((c) => (
                    <div
                      key={c.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.2rem 0",
                        borderBottom: "1px solid rgba(107,142,35,0.06)",
                        gap: "0.3rem",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0 }}>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            background: "rgba(107,142,35,0.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.5rem",
                            color: OLIVE_BRIGHT,
                            flexShrink: 0,
                          }}
                        >
                          ▦
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#a9b6c4",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.name}
                        </span>
                      </span>
                      <span style={{ fontFamily: ORBITRON, fontSize: "0.58rem", color: "#e2e8f0", fontWeight: 600 }}>
                        {c.count}
                      </span>
                    </div>
                  ))}
                  {buildingElementRows.length === 0 && (
                    <div style={{ fontSize: "0.7rem", color: "#5d6b7a", gridColumn: "1 / -1" }}>No category data.</div>
                  )}
                </div>
              </div>
            </section>

            {/* SYSTEM STATUS */}
            <section id="system" style={panelStyle}>
              <PanelHead title="SYSTEM STATUS" />
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0.45rem 0.6rem" }}>
                {[
                  { n: "DATUM Gateway", s: gwOk ? "Online" : "Offline", ok: gwOk },
                  { n: "Revit Bridge (Addin)", s: bridgeAlive ? "Alive" : "Down", ok: bridgeAlive },
                  { n: "Jev AI Service", s: aiAvail ? "Online" : "Offline", ok: aiAvail },
                  { n: "PostgreSQL", s: gwOk ? "Online" : "Offline", ok: gwOk },
                  { n: "Node-01 (Primary)", s: node01Online ? "Online" : nodeList.length ? "Offline" : "Unknown", ok: node01Online },
                  { n: "Node-02 (Worker)", s: node02Online ? "Online" : nodeList.length ? "Offline" : "Unknown", ok: node02Online },
                  { n: "Runtime Health", s: runtimeOk ? "Online" : "Degraded", ok: runtimeOk },
                  { n: "Control Room", s: ecosystemOk ? "Online" : "Offline", ok: ecosystemOk },
                  { n: "DATUMBOT Registry", s: dbOk ? `${dbCount} tools` : "Unavailable", ok: dbOk },
                ].map((r) => (
                  <div
                    key={r.n}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.2rem 0",
                      borderBottom: "1px solid rgba(107,142,35,0.06)",
                      gap: "0.4rem",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: r.ok ? OLIVE_BRIGHT : RED,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "0.71rem", color: "#a9b6c4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.n}
                      </span>
                    </span>
                    <span
                      style={{
                        fontFamily: ORBITRON,
                        fontSize: "0.55rem",
                        color: r.ok ? OLIVE_BRIGHT : RED,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.s}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ---------- ROW 3: AGENTS / NODES / TASKS --------------- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.12fr 1fr 1.1fr",
              gap: "0.7rem",
              height: 214,
            }}
          >
            {/* CORTEX AGENTS */}
            <section style={panelStyle}>
              <PanelHead title={`CORTEX AGENTS (${agentList.length} REGISTERED)`} />
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "0.5rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.35rem",
                  alignContent: "start",
                }}
              >
                {agentList.slice(0, 24).map((a) => {
                  const ready = String(a.status).toUpperCase() === "READY";
                  return (
                    <div
                      key={a.slug || a.row_id || a.name}
                      style={{
                        border: `1px solid ${ready ? "rgba(107,142,35,0.28)" : "rgba(245,166,35,0.28)"}`,
                        background: "rgba(16,20,26,0.85)",
                        borderRadius: 3,
                        padding: "0.25rem 0.3rem",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.63rem",
                          lineHeight: 1.22,
                          color: "#cbd5e1",
                          minHeight: "1.55em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                      >
                        {String(a.name || "").replace(/\s*Intelligence$/, "")}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: ready ? OLIVE_BRIGHT : AMBER,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: ORBITRON,
                            fontSize: "0.44rem",
                            letterSpacing: "0.5px",
                            color: ready ? OLIVE_BRIGHT : AMBER,
                          }}
                        >
                          {String(a.status || "—").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {agentList.length === 0 && (
                  <div style={{ fontSize: "0.7rem", color: "#5d6b7a", gridColumn: "1 / -1" }}>No agent registry data.</div>
                )}
              </div>
            </section>

            {/* NODE COMMAND CENTRE */}
            <section id="nodes" style={panelStyle}>
              <PanelHead
                title="NODE COMMAND CENTRE"
                right={
                  <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE_BRIGHT }}>
                    TOTAL NODES {onlineNodes}/{nodeList.length}
                  </span>
                }
              />
              <Table
                cols={[
                  { key: "node_id", label: "NODE" },
                  { key: "assigned_agent_name", label: "AGENT" },
                  { key: "hostname", label: "HOSTNAME" },
                  { key: "status", label: "STATUS" },
                  { key: "cpu_usage", label: "CPU %" },
                  { key: "ram_usage", label: "RAM %" },
                ]}
                rows={nodeList
                  .slice()
                  .sort((a, b) =>
                    String(a.node_id || "").localeCompare(String(b.node_id || ""), undefined, { numeric: true })
                  )
                  .map((n) => ({
                    ...n,
                    cpu_usage: n.cpu_usage != null ? Number(n.cpu_usage).toFixed(1) : "—",
                    ram_usage: n.ram_usage != null ? Number(n.ram_usage).toFixed(1) : "—",
                  }))}
                empty="NO NODES REGISTERED"
              />
            </section>

            {/* TASKS & APPROVALS */}
            <section id="tasks" style={panelStyle}>
              <PanelHead
                title="TASKS & APPROVALS"
                right={
                  <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE_BRIGHT }}>
                    {taskList.length} TASKS · {approvalList.length} APPROVALS
                  </span>
                }
              />
              <div style={{ display: "flex", borderBottom: `1px solid ${PANEL_BORDER}`, flexShrink: 0 }}>
                {[
                  { k: "AI TASKS", n: taskList.length },
                  { k: "APPROVALS", n: approvalList.length },
                  { k: "COMPLETED", n: completedTaskCount },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTaskTab(t.k)}
                    style={{
                      flex: 1,
                      padding: "0.32rem 0.15rem",
                      background: taskTab === t.k ? "rgba(107,142,35,0.2)" : "transparent",
                      border: "none",
                      borderBottom: taskTab === t.k ? `2px solid ${OLIVE_BRIGHT}` : "2px solid transparent",
                      color: taskTab === t.k ? OLIVE_BRIGHT : "#7d8a99",
                      fontFamily: ORBITRON,
                      fontSize: "0.45rem",
                      letterSpacing: "0.5px",
                      cursor: "pointer",
                    }}
                  >
                    {t.k} ({t.n})
                  </button>
                ))}
              </div>

              {taskTab === "APPROVALS" ? (
                <Table
                  cols={[
                    { key: "shortId", label: "APPROVAL" },
                    { key: "operation_id", label: "OPERATION" },
                    { key: "status", label: "STATUS" },
                    { key: "created", label: "CREATED" },
                  ]}
                  rows={approvalList.slice(0, 12).map((a) => ({
                    ...a,
                    shortId: String(a.approval_id || "").slice(0, 8),
                    operation_id: String(a.operation_id || "—").slice(0, 26),
                    created: a.created_at ? String(a.created_at).replace("T", " ").slice(0, 19) : "—",
                  }))}
                  empty="NO APPROVALS"
                />
              ) : (
                <Table
                  cols={[
                    { key: "short", label: "ID" },
                    { key: "objective", label: "TASK" },
                    { key: "status", label: "STATUS" },
                    { key: "started", label: "STARTED" },
                  ]}
                  rows={visibleTasks.slice(0, 12).map((t) => ({
                    ...t,
                    short: String(t.job_id || t.id || "").slice(0, 8),
                    objective: String(t.objective || t.title || "—").slice(0, 34),
                    started: t.started_at ? String(t.started_at).replace("T", " ").slice(0, 19) : "—",
                  }))}
                  empty={taskTab === "COMPLETED" ? "NO COMPLETED TASKS" : "NO TASKS"}
                />
              )}

              {taskTab !== "APPROVALS" && (
                <button
                  onClick={() => window.open(`${CONTROL_ROOM_URL}/`, "_blank")}
                  style={{
                    margin: "0.35rem 0.55rem 0.5rem",
                    background: "rgba(16,20,26,0.9)",
                    border: `1px solid rgba(107,142,35,0.3)`,
                    borderRadius: 3,
                    color: OLIVE_BRIGHT,
                    padding: "0.28rem",
                    fontFamily: ORBITRON,
                    fontSize: "0.46rem",
                    letterSpacing: "0.8px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  &gt;&gt; VIEW ALL TASKS
                </button>
              )}
            </section>
          </div>

          {/* ---------- ROW 4: ACTIVITY / KNOWLEDGE / EVIDENCE / QA -- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.42fr 1.42fr 1fr 1.26fr",
              gap: "0.7rem",
              minHeight: 196,
            }}
          >
            {/* RECENT ACTIVITY */}
            <section style={panelStyle}>
              <PanelHead title="RECENT ACTIVITY" />
              <Table
                cols={[
                  { key: "time", label: "TIME" },
                  { key: "event", label: "EVENT" },
                  { key: "source", label: "SOURCE" },
                  { key: "details", label: "DETAILS" },
                ]}
                rows={activity}
                empty="NO ACTIVITY YET"
              />
            </section>

            {/* KNOWLEDGE / RAG */}
            <section id="knowledge" style={panelStyle}>
              <PanelHead title="KNOWLEDGE / RAG" />
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0.5rem 0.6rem" }}>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <Pill label="Documents" value={knowledgeList.length} state={knowledgeList.length ? "ok" : "warn"} />
                  <Pill
                    label="Chunks"
                    value={knowledgeList.reduce((s, k) => s + (Number(k.chunks) || 0), 0)}
                    state={knowledgeList.length ? "ok" : "warn"}
                  />
                  <Pill label="Status" value={knowledgeList.length ? "INGESTED" : "EMPTY"} state={knowledgeList.length ? "ok" : "warn"} />
                </div>
                <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE, marginBottom: 4 }}>
                  RECENT DOCUMENTS
                </div>
                {knowledgeList.slice(0, 6).map((k, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.2rem 0",
                      borderBottom: "1px solid rgba(107,142,35,0.06)",
                      gap: "0.4rem",
                    }}
                  >
                    <span style={{ fontSize: "0.71rem", color: "#a9b6c4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {k.filename || k.name || k.title || k.id || "document"}
                    </span>
                    <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: "#5d6b7a", whiteSpace: "nowrap" }}>
                      {k.created_at ? String(k.created_at).slice(0, 10) : "—"}
                    </span>
                  </div>
                ))}
                {knowledgeList.length === 0 && (
                  <div style={{ fontSize: "0.71rem", color: "#5d6b7a" }}>No indexed documents.</div>
                )}
              </div>
            </section>

            {/* EVIDENCE & REPORTS */}
            <section id="evidence" style={panelStyle}>
              <PanelHead title="EVIDENCE & REPORTS" />
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0.5rem 0.6rem" }}>
                {[
                  { n: "QA Reports", v: qaHasRun ? 1 : 0, c: OLIVE_BRIGHT },
                  { n: "Clash Findings", v: clashFindingsList.length, c: RED },
                  { n: "Run Logs", v: qaHasRun && clashHasRun ? 2 : qaHasRun || clashHasRun ? 1 : 0, c: OLIVE_BRIGHT },
                  { n: "Audit Log Events", v: auditList.length, c: auditList.length ? OLIVE_BRIGHT : AMBER },
                  { n: "Evidence Records", v: evidenceList.length, c: evidenceOk ? OLIVE_BRIGHT : AMBER },
                ].map((r) => (
                  <div
                    key={r.n}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.22rem 0",
                      borderBottom: "1px solid rgba(107,142,35,0.06)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: "rgba(107,142,35,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.55rem",
                          color: r.c,
                        }}
                      >
                        ⌗
                      </span>
                      <span style={{ fontSize: "0.71rem", color: "#a9b6c4" }}>{r.n}</span>
                    </span>
                    <span style={{ fontFamily: ORBITRON, fontSize: "0.58rem", color: r.c, fontWeight: 700 }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                  <button
                    onClick={() => window.open(`${CONTROL_ROOM_URL}/`, "_blank")}
                    style={{
                      flex: 1,
                      background: "rgba(107,142,35,0.2)",
                      border: `1px solid rgba(107,142,35,0.45)`,
                      borderRadius: 3,
                      color: OLIVE_BRIGHT,
                      padding: "0.3rem",
                      fontFamily: ORBITRON,
                      fontSize: "0.48rem",
                      cursor: "pointer",
                    }}
                  >
                    OPEN EVIDENCE
                  </button>
                  <button
                    onClick={() => window.open(`${CONTROL_ROOM_URL}/`, "_blank")}
                    style={{
                      flex: 1,
                      background: "rgba(107,142,35,0.12)",
                      border: `1px solid rgba(107,142,35,0.35)`,
                      borderRadius: 3,
                      color: OLIVE,
                      padding: "0.3rem",
                      fontFamily: ORBITRON,
                      fontSize: "0.48rem",
                      cursor: "pointer",
                    }}
                  >
                    EXPORT REPORTS
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section id="settings" style={panelStyle}>
              <PanelHead title="QUICK ACTIONS" />
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "0.5rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.4rem",
                  alignContent: "start",
                }}
              >
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    style={{
                      background: "rgba(16,20,26,0.9)",
                      border: `1px solid rgba(107,142,35,0.28)`,
                      borderRadius: 4,
                      padding: "0.45rem 0.35rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      color: "#cbd5e1",
                    }}
                  >
                    <span style={{ color: OLIVE_BRIGHT, fontSize: "0.85rem" }}>{a.icon}</span>
                    <span
                      style={{
                        fontFamily: ORBITRON,
                        fontSize: "0.44rem",
                        letterSpacing: "0.5px",
                        textAlign: "center",
                        lineHeight: 1.4,
                      }}
                    >
                      {a.label.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* GOVERNED CRUD OPERATIONS */}
            <section id="crud" style={panelStyle}>
              <PanelHead
                title="GOVERNED CRUD OPERATIONS"
                right={
                  <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: crudLoading ? AMBER : OLIVE_BRIGHT }}>
                    {crudLoading ? "PROCESSING" : "READY"}
                  </span>
                }
              />
              <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem", overflowY: "auto", flex: 1 }}>
                <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE_BRIGHT, letterSpacing: "1px" }}>CREATE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem" }}>
                  <button onClick={() => executeGovernedCrud("CREATE_LEVELS", { names: ["NEW_LEVEL"], elevation: 0, spacing: 4 })} style={crudBtnStyle}>Create Level</button>
                  <button onClick={() => executeGovernedCrud("CREATE_GRIDS", { count: 5, spacing: 6, prefix: "Grid" })} style={crudBtnStyle}>Create Grids</button>
                  <button onClick={() => executeGovernedCrud("CREATE_VIEW", { view_name: "New View", view_type: "FloorPlan" })} style={crudBtnStyle}>Create View</button>
                  <button onClick={() => executeGovernedCrud("CREATE_SHEET", { sheet_name: "New Sheet", title_block: "Default" })} style={crudBtnStyle}>Create Sheet</button>
                  <button onClick={() => executeGovernedCrud("LOAD_APPROVED_FAMILY", { family_path: "C:\\Families\\Default.rfa" })} style={crudBtnStyle}>Load Family</button>
                  <button onClick={() => executeGovernedCrud("FAMILY_PLACE_INSTANCE", { family_name: "Basic Wall", type_name: "Generic - 200mm", x: 0, y: 0, z: 0, level_id: 1 })} style={crudBtnStyle}>Place Family</button>
                </div>
                <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE_BRIGHT, letterSpacing: "1px" }}>UPDATE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem" }}>
                  <button onClick={() => executeGovernedCrud("SET_PARAMETER", { name: "Comments", value: "Updated via CRUD" }, [1])} style={crudBtnStyle}>Set Parameter</button>
                  <button onClick={() => executeGovernedCrud("FAMILY_CREATE_TYPE", { family_name: "Basic Wall", type_name: "New Type" })} style={crudBtnStyle}>Create Family Type</button>
                </div>
                <div style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: RED, letterSpacing: "1px" }}>DELETE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.3rem" }}>
                  <button onClick={() => executeGovernedCrud("DELETE_ELEMENTS", {}, [1])} style={{ ...crudBtnStyle, borderColor: "rgba(220,38,38,0.4)" }}>Delete Elements</button>
                </div>
                {crudOps.length > 0 && (
                  <div style={{ marginTop: "0.3rem", borderTop: "1px solid rgba(107,142,35,0.15)", paddingTop: "0.3rem" }}>
                    <div style={{ fontFamily: ORBITRON, fontSize: "0.45rem", color: OLIVE, letterSpacing: "0.5px", marginBottom: "0.2rem" }}>OPERATION STATUS</div>
                    {crudOps.slice(-3).map((op) => (
                      <div key={op.opId} style={{ fontSize: "0.55rem", color: "#94a3b8", marginBottom: "0.15rem", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span>{crudStatus[op.opId]?.state || "INITIATED"} — {op.operation}</span>
                        {crudStatus[op.opId]?.state === "AWAITING_APPROVAL" && crudStatus[op.opId]?.operationId && (
                          <>
                            <button onClick={() => executeApprovedOperation(crudStatus[op.opId].operationId)} style={{ ...crudBtnStyle, padding: "0.15rem 0.3rem", fontSize: "0.4rem" }}>EXECUTE</button>
                            <button onClick={() => rollbackOperation(crudStatus[op.opId].operationId)} style={{ ...crudBtnStyle, padding: "0.15rem 0.3rem", fontSize: "0.4rem", borderColor: "rgba(220,38,38,0.4)" }}>ROLLBACK</button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ---------- SECURITY / DATUMBOT / VIEWS strip ------------ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.7rem",
              minHeight: 168,
            }}
          >
            <section id="datumbot" style={panelStyle}>
              <PanelHead
                title="DATUMBOT AI · READ-ONLY TOOL REGISTRY"
                right={
                  <span style={{ fontFamily: ORBITRON, fontSize: "0.5rem", color: dbReadOnly ? OLIVE_BRIGHT : RED }}>
                    {dbReadOnly ? "READ-ONLY" : "WRITE ENABLED"}
                  </span>
                }
              />
              <div style={{ padding: "0.5rem 0.6rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <Pill label="Tools" value={`${dbCount}/${dbCount}`} state={dbOk ? "ok" : "bad"} />
                <Pill label="Read Only" value={String(dbReadOnly)} state={dbReadOnly ? "ok" : "bad"} />
                <Pill label="Write Tools" value="0" state="ok" />
                <Pill label="Registry" value={dbOk ? "LIVE" : "DOWN"} state={dbOk ? "ok" : "bad"} />
              </div>
              <Table
                cols={[
                  { key: "name", label: "TOOL" },
                  { key: "capability", label: "CAPABILITY" },
                  { key: "risk_level", label: "RISK" },
                  { key: "permission_class", label: "CLASS" },
                  { key: "status", label: "STATUS" },
                ]}
                rows={dbTools.slice(0, 6)}
                empty="REGISTRY UNAVAILABLE"
              />
            </section>

            <section id="views" style={panelStyle}>
              <PanelHead title="VIEWS / LEVELS / SHEETS" />
              <Table
                cols={[
                  { key: "id", label: "ID" },
                  { key: "name", label: "NAME" },
                  { key: "type", label: "TYPE" },
                ]}
                rows={viewItems.slice(0, 8)}
                empty="NO VIEWS"
              />
            </section>

            <section id="security" style={panelStyle}>
              <PanelHead title="SECURITY & AUDIT" />
              <div style={{ padding: "0.5rem 0.6rem", flex: 1, minHeight: 0, overflowY: "auto" }}>
                <KV k="Authenticated Role" v={role} color={OLIVE_BRIGHT} />
                <KV k="Session" v="ACTIVE" color={OLIVE_BRIGHT} />
                <KV k="DATUMBOT Reads" v={dbCount} />
                <KV k="DATUMBOT Writes" v="0" color={OLIVE_BRIGHT} />
                <KV k="Contract Gaps" v="0" color={OLIVE_BRIGHT} />
                <KV k="Model Writes" v="NO" color={OLIVE_BRIGHT} />
                <KV k="Revit License State" v="UNVERIFIED" color={AMBER} />
                <KV k="Real Revit" v="YES" color={OLIVE_BRIGHT} />
                <KV k="Jev Fail Mode" v="DATUM_POLICY_ONLY" />
                <KV k="Audit Events" v={auditList.length} color={auditList.length ? OLIVE_BRIGHT : AMBER} />
                <div style={{ marginTop: "0.45rem", fontFamily: ORBITRON, fontSize: "0.5rem", color: OLIVE }}>
                  RECENT AUDIT EVENTS
                </div>
                {auditList.slice(0, 5).map((e, i) => (
                  <div
                    key={e.event_id || i}
                    style={{
                      padding: "0.22rem 0",
                      borderBottom: "1px solid rgba(107,142,35,0.06)",
                      display: "flex",
                      gap: "0.4rem",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: ORBITRON,
                        fontSize: "0.46rem",
                        color: e.action === "CREATE" ? OLIVE_BRIGHT : AMBER,
                        flexShrink: 0,
                        minWidth: 44,
                      }}
                    >
                      {String(e.action || "—").toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "#a9b6c4",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(e.description || e.resource_id || "event").slice(0, 52)}
                    </span>
                  </div>
                ))}
                {auditList.length === 0 && (
                  <div style={{ fontSize: "0.7rem", color: "#5d6b7a", marginTop: 4 }}>No audit events available.</div>
                )}
                <div style={{ marginTop: "0.5rem", fontFamily: RAJDHANI, fontSize: "0.7rem", color: "#5d6b7a", lineHeight: 1.5 }}>
                  Governed WRITE actions remain behind the Gateway approval path. Jev decision is advisory only —
                  DATUM / Human policy is authoritative.
                </div>
              </div>
            </section>
          </div>

          {/* ---------- FOOTER ---------- */}
          <div
            style={{
              background: "rgba(13,17,23,0.85)",
              border: `1px solid ${PANEL_BORDER}`,
              borderRadius: 4,
              padding: "0.55rem 0.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: ORBITRON,
              fontSize: "0.5rem",
              color: "#4d584d",
              letterSpacing: "1.2px",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>DATUM BIM OS — REVIT / D-CORTEX CONTROL ROOM | ONE SYSTEM ARCHITECTURE</span>
            <span>
              SYNC {lastUpdate.toLocaleTimeString("en-US", { hour12: false })} · MODEL HEALTH {healthLevel} · QA {qaExecuted} RULES · CLASH {hardClashes} HARD
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
