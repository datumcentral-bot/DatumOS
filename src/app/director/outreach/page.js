"use client";
import { useState } from "react";

const SEQUENCES = [
  {
    id: 1,
    name: "BIM Consultancy Introduction",
    target: "New Prospects",
    steps: [
      { day: 1, subject: "Introducing Datum Studios — BIM Excellence for {company}", body: "Dear {name},\n\nI hope this message finds you well. My name is [Your Name] from Datum Studios Engineering Consultancy, a leading BIM and digital construction firm based in Dubai.\n\nWe specialize in ISO 19650-compliant BIM delivery for major infrastructure and real estate projects across the UAE and GCC.\n\nI'd love to explore how we can support {company}'s upcoming projects with our digital engineering capabilities.\n\nWould you be available for a 20-minute call this week?\n\nBest regards,\n[Your Name]\nDatum Studios", type: "EMAIL" },
      { day: 4, subject: "Following up — BIM Services for {company}", body: "Dear {name},\n\nI wanted to follow up on my previous email regarding BIM consultancy services for {company}.\n\nWe recently completed a similar project for a leading developer in Dubai, delivering:\n• Full ISO 19650 compliance\n• 40% reduction in clash detection time\n• Seamless CDE integration with ACC\n\nI'd be happy to share a case study relevant to your sector.\n\nLooking forward to connecting.\n\nBest,\n[Your Name]", type: "EMAIL" },
      { day: 10, subject: "Final outreach — Datum Studios BIM Services", body: "Dear {name},\n\nThis is my final outreach regarding BIM consultancy services for {company}.\n\nIf the timing isn't right, I completely understand. I'll keep you on our radar for future opportunities.\n\nIn the meantime, feel free to visit our portfolio at datumbim.com or reach out whenever you're ready to explore digital construction solutions.\n\nWarm regards,\n[Your Name]\nDatum Studios", type: "EMAIL" },
    ],
  },
  {
    id: 2,
    name: "Post-Meeting Follow-Up",
    target: "Meeting Stage Leads",
    steps: [
      { day: 1, subject: "Great meeting you — next steps for {company}", body: "Dear {name},\n\nThank you for taking the time to meet with us today. It was a pleasure learning about {company}'s upcoming projects.\n\nAs discussed, I'll prepare a tailored BIM execution proposal covering:\n• Project scope and deliverables\n• ISO 19650 compliance roadmap\n• Team structure and timeline\n• Investment summary\n\nExpect to receive this within 3 business days.\n\nBest regards,\n[Your Name]", type: "EMAIL" },
      { day: 3, subject: "BIM Proposal for {company} — Ready for Review", body: "Dear {name},\n\nPlease find attached our BIM consultancy proposal for {company}.\n\nKey highlights:\n• Dedicated BIM Manager assigned to your project\n• Full CDE setup on Autodesk Construction Cloud\n• Weekly coordination meetings\n• ISO 19650 Part 2 compliance guaranteed\n\nI'm available for a call to walk you through the proposal at your convenience.\n\nBest,\n[Your Name]", type: "EMAIL" },
    ],
  },
  {
    id: 3,
    name: "LinkedIn Connection Sequence",
    target: "LinkedIn Prospects",
    steps: [
      { day: 1, subject: "LinkedIn Connection Request", body: "Hi {name},\n\nI came across your profile and was impressed by your work at {company}. I'm the BIM Director at Datum Studios, specializing in digital construction for major UAE projects.\n\nI'd love to connect and explore potential synergies.\n\n[Your Name]", type: "LINKEDIN" },
      { day: 5, subject: "LinkedIn Follow-up Message", body: "Hi {name},\n\nThank you for connecting! I noticed {company} is involved in some exciting projects.\n\nAt Datum Studios, we've been helping developers and contractors achieve ISO 19650 compliance and streamline their BIM workflows.\n\nWould love to share how we've helped similar organizations. Are you open to a quick chat?\n\n[Your Name]", type: "LINKEDIN" },
    ],
  },
];

function Toast({ msg, onClose }) {
  const { useEffect } = require("react");
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999 }}>✓ {msg}</div>;
}

export default function OutreachPage() {
  const [selected, setSelected] = useState(SEQUENCES[0]);
  const [previewVars, setPreviewVars] = useState({ company: "ADNOC", name: "Ahmed Al-Rashid" });
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [sequences, setSequences] = useState(SEQUENCES);

  const applyVars = (text) => text.replace(/\{company\}/g, previewVars.company).replace(/\{name\}/g, previewVars.name);

  const copyStep = (step) => {
    const text = `Subject: ${applyVars(step.subject)}\n\n${applyVars(step.body)}`;
    navigator.clipboard.writeText(text).then(() => setToast("Step copied to clipboard"));
  };

  const copyAll = () => {
    const text = selected.steps.map((s, i) => `=== STEP ${i+1} (Day ${s.day}) ===\nSubject: ${applyVars(s.subject)}\n\n${applyVars(s.body)}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text).then(() => setToast("All steps copied to clipboard"));
  };

  const TYPE_COLORS = { EMAIL: "#6b8e23", LINKEDIN: "#60a5fa", PHONE: "#c19749" };

  const S = {
    card: { background:"rgba(13,17,23,0.8)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:4, padding:"1.25rem" },
    h2: { fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1rem", textTransform:"uppercase" },
    btn: (c="#6b8e23") => ({ background:`rgba(107,142,35,0.12)`, border:`1px solid ${c}`, borderRadius:3, color:c, padding:"0.4rem 0.9rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer" }),
  };

  return (
    <div style={{ fontFamily:"'Rajdhani',sans-serif", color:"#f0f2f5" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>✉ OUTREACH SEQUENCES</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Email & LinkedIn sequence templates with variable substitution</p>
        </div>
        <button onClick={copyAll} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>📋 COPY ALL STEPS</button>
      </div>

      {/* Variable Preview */}
      <div style={{ ...S.card, marginBottom:"1.25rem", background:"rgba(193,151,73,0.05)", borderColor:"rgba(193,151,73,0.2)" }}>
        <p style={{ ...S.h2, color:"#c19749" }}>⚙ PREVIEW VARIABLES</p>
        <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <label style={{ fontSize:"0.7rem", color:"#4d584d" }}>{"{company}"}</label>
            <input value={previewVars.company} onChange={e => setPreviewVars(p => ({...p, company:e.target.value}))} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(193,151,73,0.3)", borderRadius:3, color:"#f0f2f5", padding:"0.4rem 0.6rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.85rem", width:160 }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <label style={{ fontSize:"0.7rem", color:"#4d584d" }}>{"{name}"}</label>
            <input value={previewVars.name} onChange={e => setPreviewVars(p => ({...p, name:e.target.value}))} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(193,151,73,0.3)", borderRadius:3, color:"#f0f2f5", padding:"0.4rem 0.6rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.85rem", width:200 }} />
          </div>
          <span style={{ fontSize:"0.75rem", color:"#4d584d" }}>← Edit to preview personalized content</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:"1.25rem" }}>
        {/* Sequence List */}
        <div style={S.card}>
          <p style={S.h2}>📋 SEQUENCES</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            {sequences.map(seq => (
              <button key={seq.id} onClick={() => setSelected(seq)} style={{ textAlign:"left", padding:"0.75rem", background: selected.id === seq.id ? "rgba(107,142,35,0.15)" : "rgba(255,255,255,0.02)", border:`1px solid ${selected.id === seq.id ? "#6b8e23" : "rgba(255,255,255,0.06)"}`, borderRadius:3, cursor:"pointer", color:"#f0f2f5" }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color: selected.id === seq.id ? "#6b8e23" : "#f0f2f5", letterSpacing:"1px", marginBottom:4 }}>{seq.name}</div>
                <div style={{ fontSize:"0.7rem", color:"#4d584d" }}>{seq.target}</div>
                <div style={{ fontSize:"0.65rem", color:"#4d584d", marginTop:4 }}>{seq.steps.length} steps</div>
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <div>
              <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"#fff", letterSpacing:"2px", margin:0 }}>{selected.name}</h2>
              <p style={{ color:"#4d584d", fontSize:"0.75rem", margin:"0.25rem 0 0" }}>Target: {selected.target}</p>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {selected.steps.map((step, i) => (
              <div key={i} style={S.card}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(107,142,35,0.15)", border:"1px solid #6b8e23", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#6b8e23" }}>{i+1}</div>
                    <div>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:"#4d584d", letterSpacing:"1px" }}>STEP {i+1} — DAY {step.day}</div>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:TYPE_COLORS[step.type]||"#6b8e23", border:`1px solid ${TYPE_COLORS[step.type]||"#6b8e23"}`, borderRadius:2, padding:"1px 5px", letterSpacing:"1px" }}>{step.type}</span>
                    </div>
                  </div>
                  <button onClick={() => copyStep(step)} style={S.btn()}>📋 COPY STEP</button>
                </div>
                <div style={{ marginBottom:"0.5rem" }}>
                  <div style={{ fontSize:"0.65rem", color:"#4d584d", marginBottom:4 }}>SUBJECT:</div>
                  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3, padding:"0.5rem 0.75rem", fontSize:"0.85rem", color:"#c19749" }}>{applyVars(step.subject)}</div>
                </div>
                <div>
                  <div style={{ fontSize:"0.65rem", color:"#4d584d", marginBottom:4 }}>BODY:</div>
                  <pre style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3, padding:"0.75rem", fontSize:"0.8rem", color:"#f0f2f5", whiteSpace:"pre-wrap", fontFamily:"'Rajdhani',sans-serif", margin:0, lineHeight:1.6 }}>{applyVars(step.body)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
