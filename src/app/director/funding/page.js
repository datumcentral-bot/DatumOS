"use client";
import { useState, useEffect } from "react";

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999 }}>✓ {msg}</div>;
}

const FUNDING_TYPES = ["BOOTSTRAP", "REVENUE", "INVESTMENT", "GRANT", "LOAN"];
const TYPE_COLORS = { BOOTSTRAP:"#6b8e23", REVENUE:"#4ade80", INVESTMENT:"#c19749", GRANT:"#60a5fa", LOAN:"#ff9500" };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function FundingTrackerPage() {
  const [lines, setLines] = useState([
    { id:1, name:"Client Revenue — ADNOC Tower", type:"REVENUE", amount:285000, received:210000, date:"2026-03-01", status:"ACTIVE", notes:"Monthly retainer + milestone payments" },
    { id:2, name:"Client Revenue — BAGC HQ", type:"REVENUE", amount:145000, received:145000, date:"2026-01-15", status:"COMPLETED", notes:"Full payment received" },
    { id:3, name:"Seed Investment — Founders", type:"INVESTMENT", amount:500000, received:500000, date:"2025-06-01", status:"COMPLETED", notes:"Initial capital injection" },
    { id:4, name:"NEOM Pavilion Contract", type:"REVENUE", amount:320000, received:80000, date:"2026-05-01", status:"ACTIVE", notes:"25% upfront, balance on milestones" },
    { id:5, name:"UAE Innovation Grant", type:"GRANT", amount:75000, received:0, date:"2026-07-01", status:"PENDING", notes:"Application submitted — awaiting approval" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editLine, setEditLine] = useState(null);
  const [form, setForm] = useState({ name:"", type:"REVENUE", amount:"", received:"", date:"", notes:"" });
  const [toast, setToast] = useState(null);
  const [burnRate] = useState(85000); // monthly burn

  const totalFunding = lines.reduce((s, l) => s + l.amount, 0);
  const totalReceived = lines.reduce((s, l) => s + l.received, 0);
  const totalPending = totalFunding - totalReceived;
  const runway = Math.round(totalReceived / burnRate);

  // Monthly cash flow (last 6 months)
  const cashFlow = MONTHS.slice(0, 6).map((m, i) => ({
    month: m,
    income: Math.round(30000 + Math.random() * 80000),
    expense: Math.round(60000 + Math.random() * 30000),
  }));

  // Pie chart data
  const byType = FUNDING_TYPES.map(t => ({
    type: t,
    amount: lines.filter(l => l.type === t).reduce((s, l) => s + l.amount, 0),
    color: TYPE_COLORS[t],
  })).filter(t => t.amount > 0);

  const openModal = (line = null) => {
    if (line) { setEditLine(line); setForm({ name:line.name, type:line.type, amount:String(line.amount), received:String(line.received), date:line.date, notes:line.notes||"" }); }
    else { setEditLine(null); setForm({ name:"", type:"REVENUE", amount:"", received:"", date:"", notes:"" }); }
    setShowModal(true);
  };

  const saveLine = () => {
    if (!form.name || !form.amount) return;
    if (editLine) {
      setLines(prev => prev.map(l => l.id === editLine.id ? { ...l, ...form, amount:Number(form.amount), received:Number(form.received||0) } : l));
      setToast("Funding line updated");
    } else {
      setLines(prev => [...prev, { id: Date.now(), ...form, amount:Number(form.amount), received:Number(form.received||0), status:"ACTIVE" }]);
      setToast("Funding line added");
    }
    setShowModal(false);
  };

  const deleteLine = (id) => {
    setLines(prev => prev.filter(l => l.id !== id));
    setToast("Funding line removed");
  };

  const exportCSV = () => {
    const rows = [["Name","Type","Amount","Received","Date","Status","Notes"], ...lines.map(l => [l.name,l.type,l.amount,l.received,l.date,l.status,l.notes||""])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "funding_tracker.csv"; a.click();
    setToast("CSV exported");
  };

  const S = {
    card: { background:"rgba(13,17,23,0.8)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:4, padding:"1.25rem" },
    h2: { fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1rem", textTransform:"uppercase" },
    btn: (c="#6b8e23") => ({ background:`rgba(107,142,35,0.12)`, border:`1px solid ${c}`, borderRadius:3, color:c, padding:"0.4rem 0.9rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer" }),
    input: { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" },
  };

  const maxCF = Math.max(...cashFlow.map(m => Math.max(m.income, m.expense)));

  return (
    <div style={{ fontFamily:"'Rajdhani',sans-serif", color:"#f0f2f5" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>◈ FUNDING TRACKER</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Capital & Revenue Management</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={exportCSV} style={S.btn("#4d584d")}>⬇ EXPORT CSV</button>
          <button onClick={() => openModal()} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>+ ADD FUNDING LINE</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }}>
        {[
          { label:"TOTAL FUNDING", value:`AED ${(totalFunding/1000).toFixed(0)}K`, color:"#6b8e23" },
          { label:"RECEIVED", value:`AED ${(totalReceived/1000).toFixed(0)}K`, color:"#4ade80" },
          { label:"PENDING", value:`AED ${(totalPending/1000).toFixed(0)}K`, color:"#ff9500" },
          { label:"RUNWAY", value:`${runway} MOS`, color:"#c19749" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.3rem", color:s.color, fontWeight:800 }}>{s.value}</div>
            <div style={{ fontSize:"0.65rem", color:"#4d584d", letterSpacing:"1px", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Burn Rate Calculator */}
      <div style={{ ...S.card, marginBottom:"1.25rem", background:"rgba(255,149,0,0.05)", borderColor:"rgba(255,149,0,0.2)" }}>
        <p style={{ ...S.h2, color:"#ff9500" }}>🔥 BURN RATE CALCULATOR</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
          <div>
            <div style={{ fontSize:"0.7rem", color:"#4d584d", marginBottom:4 }}>MONTHLY BURN</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.2rem", color:"#ff9500" }}>AED {burnRate.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize:"0.7rem", color:"#4d584d", marginBottom:4 }}>CASH ON HAND</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.2rem", color:"#4ade80" }}>AED {totalReceived.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize:"0.7rem", color:"#4d584d", marginBottom:4 }}>RUNWAY</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.2rem", color: runway < 6 ? "#ff3b30" : runway < 12 ? "#ff9500" : "#4ade80" }}>{runway} months</div>
          </div>
          <div>
            <div style={{ fontSize:"0.7rem", color:"#4d584d", marginBottom:4 }}>BREAK-EVEN</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.2rem", color:"#c19749" }}>Q4 2026</div>
          </div>
        </div>
        <div style={{ marginTop:"1rem", height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${Math.min(100, (runway/24)*100)}%`, background: runway < 6 ? "#ff3b30" : runway < 12 ? "#ff9500" : "#4ade80", borderRadius:4 }} />
        </div>
        <div style={{ fontSize:"0.65rem", color:"#4d584d", marginTop:4 }}>Runway health: {runway < 6 ? "CRITICAL" : runway < 12 ? "CAUTION" : "HEALTHY"} ({runway}/24 months)</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"1.25rem", marginBottom:"1.25rem" }}>
        {/* Cash Flow Chart */}
        <div style={S.card}>
          <p style={S.h2}>📊 MONTHLY CASH FLOW</p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:120 }}>
            {cashFlow.map((m, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ width:"100%", display:"flex", gap:2, alignItems:"flex-end", height:100 }}>
                  <div style={{ flex:1, background:"rgba(107,142,35,0.6)", borderRadius:"2px 2px 0 0", height:`${(m.income/maxCF)*100}%`, minHeight:4 }} title={`Income: AED ${m.income.toLocaleString()}`} />
                  <div style={{ flex:1, background:"rgba(255,59,48,0.5)", borderRadius:"2px 2px 0 0", height:`${(m.expense/maxCF)*100}%`, minHeight:4 }} title={`Expense: AED ${m.expense.toLocaleString()}`} />
                </div>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:"#4d584d" }}>{m.month}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:"1rem", marginTop:"0.75rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:10, height:10, background:"rgba(107,142,35,0.6)", borderRadius:1 }} /><span style={{ fontSize:"0.7rem", color:"#4d584d" }}>Income</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:10, height:10, background:"rgba(255,59,48,0.5)", borderRadius:1 }} /><span style={{ fontSize:"0.7rem", color:"#4d584d" }}>Expenses</span></div>
          </div>
        </div>

        {/* Funding Breakdown Pie */}
        <div style={S.card}>
          <p style={S.h2}>🥧 FUNDING SOURCES</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {byType.map(t => {
              const pct = Math.round((t.amount / totalFunding) * 100);
              return (
                <div key={t.type}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:"0.75rem", color:"#f0f2f5" }}>{t.type}</span>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:t.color }}>{pct}%</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:t.color, borderRadius:3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funding Lines Table */}
      <div style={S.card}>
        <p style={S.h2}>💰 FUNDING LINES</p>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(107,142,35,0.2)" }}>
                {["NAME","TYPE","AMOUNT","RECEIVED","DATE","STATUS",""].map(h => (
                  <th key={h} style={{ padding:"0.5rem 0.75rem", textAlign:"left", fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", color:"#4d584d", letterSpacing:"1px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(l => {
                const pct = Math.round((l.received / l.amount) * 100);
                const statusColor = l.status === "COMPLETED" ? "#4ade80" : l.status === "ACTIVE" ? "#6b8e23" : "#ff9500";
                return (
                  <tr key={l.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"0.75rem", color:"#f0f2f5", fontWeight:600 }}>{l.name}</td>
                    <td style={{ padding:"0.75rem" }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", color:TYPE_COLORS[l.type], border:`1px solid ${TYPE_COLORS[l.type]}`, borderRadius:2, padding:"2px 6px" }}>{l.type}</span>
                    </td>
                    <td style={{ padding:"0.75rem", color:"#c19749", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem" }}>AED {l.amount.toLocaleString()}</td>
                    <td style={{ padding:"0.75rem" }}>
                      <div style={{ fontSize:"0.75rem", color:"#4ade80" }}>AED {l.received.toLocaleString()}</div>
                      <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:2, marginTop:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:"#4ade80", borderRadius:2 }} />
                      </div>
                    </td>
                    <td style={{ padding:"0.75rem", color:"#4d584d", fontSize:"0.75rem" }}>{l.date}</td>
                    <td style={{ padding:"0.75rem" }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:statusColor, border:`1px solid ${statusColor}`, borderRadius:2, padding:"2px 6px" }}>{l.status}</span>
                    </td>
                    <td style={{ padding:"0.75rem" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={() => openModal(l)} style={{ background:"none", border:"1px solid rgba(107,142,35,0.3)", borderRadius:2, color:"#6b8e23", padding:"3px 8px", cursor:"pointer", fontSize:"0.7rem" }}>✎</button>
                        <button onClick={() => deleteLine(l.id)} style={{ background:"none", border:"1px solid rgba(255,59,48,0.3)", borderRadius:2, color:"#ff3b30", padding:"3px 8px", cursor:"pointer", fontSize:"0.7rem" }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#0d1117", border:"1px solid rgba(107,142,35,0.3)", borderRadius:6, padding:"2rem", width:460, maxWidth:"90vw" }}>
            <h3 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1.5rem" }}>{editLine ? "EDIT" : "+ ADD"} FUNDING LINE</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
              {[["NAME *","name","text"],["AMOUNT (AED) *","amount","number"],["RECEIVED (AED)","received","number"],["DATE","date","date"]].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({...p, [key]:e.target.value}))} style={S.input} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>TYPE</label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type:e.target.value}))} style={{ ...S.input, background:"#0d1117" }}>
                  {FUNDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>NOTES</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes:e.target.value}))} style={{ ...S.input, minHeight:60, resize:"vertical" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
              <button onClick={() => setShowModal(false)} style={S.btn("#4d584d")}>CANCEL</button>
              <button onClick={saveLine} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
