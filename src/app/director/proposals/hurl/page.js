"use client";
import { useState, useEffect } from "react";
import { PageHeader, StatCard, MilTable, MilBadge, MilBtn, ToastProvider } from "@/lib/mil";

export default function HurlProposalPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/proposals/hurl").then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, color: "#8a9bb0" }}>Loading proposal...</div>;
  if (!data) return <div style={{ padding: 24, color: "#ff3b30" }}>Failed to load proposal.</div>;

  const { proposal, content } = data;
  const filteredSections = content.sections.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase())
  );
  const section = content.sections.find(s => s.id === activeSection);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <ToastProvider />
      <PageHeader
        title="HURL INFRASTRUCTURE BIM PROPOSAL"
        subtitle={`${content.quotationNumber} · Rev.${content.revision} · ${content.totalFeeWords}`}
        actions={<MilBtn onClick={() => window.print()}>PRINT / PDF</MilBtn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <StatCard label="PROJECT AREA" value={content.projectCoverage} />
        <StatCard label="DURATION" value={content.duration} />
        <StatCard label="FEE" value="PKR 1,500,000" />
        <StatCard label="STATUS" value={proposal.status} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 280, maxHeight: "70vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sections..." style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#e6edf3", padding: "6px 10px", borderRadius: 2, fontSize: "0.7rem", marginBottom: 8 }} />
          {filteredSections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: "block", width: "100%", textAlign: "left", background: activeSection === s.id ? "rgba(74,158,255,0.15)" : "transparent", border: "none", color: activeSection === s.id ? "#4a9eff" : "#8a9bb0", padding: "6px 10px", borderRadius: 2, fontSize: "0.7rem", cursor: "pointer", marginBottom: 2 }}>
              {String(s.id).padStart(2,"0")} — {s.title}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
          {section ? (
            <>
              <h2 style={{ color: "#c8a84b", fontSize: "0.9rem", letterSpacing: 1, marginBottom: 12 }}>{String(section.id).padStart(2,"0")} — {section.title.toUpperCase()}</h2>
              <p style={{ color: "#e6edf3", fontSize: "0.85rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{section.content}</p>
            </>
          ) : <p style={{ color: "#8a9bb0" }}>Select a section</p>}

          {activeSection === 23 && (
            <div style={{ marginTop: 20 }}>
              <MilTable columns={[{key:"no",label:"#"},{key:"package",label:"SERVICE PACKAGE"},{key:"fee",label:"FEE (PKR)",render:v=>v?.toLocaleString()}]} data={content.lineItems} />
              <div style={{ marginTop: 12, padding: 12, background: "rgba(200,168,75,0.1)", borderRadius: 4 }}>
                <strong style={{ color: "#c8a84b" }}>TOTAL: PKR {content.totalFee.toLocaleString()}</strong>
              </div>
            </div>
          )}
          {activeSection === 24 && (
            <div style={{ marginTop: 20 }}>
              <MilTable columns={[{key:"milestone",label:"MILESTONE"},{key:"percentage",label:"%"},{key:"amount",label:"AMOUNT (PKR)",render:v=>v?.toLocaleString()}]} data={content.paymentMilestones} />
            </div>
          )}
          {activeSection === 22 && (
            <div style={{ marginTop: 20 }}>
              <MilTable columns={[{key:"week",label:"WEEK"},{key:"activity",label:"ACTIVITY"},{key:"milestone",label:"MILESTONE"}]} data={content.programme} />
            </div>
          )}
          {activeSection === 13 && (
            <div style={{ marginTop: 20 }}>
              <MilTable columns={[{key:"lod",label:"LOD"},{key:"stage",label:"STAGE"},{key:"meaning",label:"MEANING"}]} data={content.lodFramework} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {content.utilitySystems.map(u => <MilBadge key={u} status="INFO" label={u} />)}
      </div>
    </div>
  );
}