"use client";
import { useState, useEffect } from "react";

const PRIORITY_COLORS = {
  CRITICAL: { bg: "rgba(255,59,48,0.15)", border: "#ff3b30", text: "#ff3b30", badge: "CRITICAL" },
  HIGH:     { bg: "rgba(255,149,0,0.12)", border: "#ff9500", text: "#ff9500", badge: "HIGH" },
  MEDIUM:   { bg: "rgba(193,151,73,0.12)", border: "#c19749", text: "#c19749", badge: "MEDIUM" },
  LOW:      { bg: "rgba(107,142,35,0.12)", border: "#6b8e23", text: "#6b8e23", badge: "LOW" },
};

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.5)" }}>
      ✓ {msg}
    </div>
  );
}

export default function WarRoomPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [weekView, setWeekView] = useState(false);
  const [standupNote, setStandupNote] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "" });
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [objectives, setObjectives] = useState([
    { id: 1, title: "Win 3 new BIM contracts Q3", progress: 67 },
    { id: 2, title: "Complete ISO 19650 certification", progress: 45 },
    { id: 3, title: "Reduce clash rate to <2%", progress: 80 },
    { id: 4, title: "Achieve 90% team utilization", progress: 72 },
  ]);

  const showToast = (msg) => setToast(msg);

  useEffect(() => {
    fetch("/api/pm-tasks")
      .then(r => r.json())
      .then(d => { setTasks(Array.isArray(d) ? d : d.tasks || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const res = await fetch("/api/pm-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.title, priority: newTask.priority, dueDate: newTask.dueDate || null, status: "TODO" }),
      });
      const created = await res.json();
      setTasks(prev => [created, ...prev]);
      setNewTask({ title: "", priority: "MEDIUM", dueDate: "" });
      setShowAddModal(false);
      showToast("Task added to War Room");
    } catch { showToast("Failed to add task"); }
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await fetch(`/api/pm-tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      if (newStatus === "DONE") showToast("Task completed ✓");
    } catch {}
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`/api/pm-tasks/${id}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast("Task removed");
    } catch {}
  };

  const filteredTasks = tasks.filter(t => filterPriority === "ALL" || t.priority === filterPriority);
  const focusTasks = [...filteredTasks].filter(t => t.status !== "DONE" && (t.priority === "CRITICAL" || t.priority === "HIGH")).slice(0, 3);
  const displayTasks = focusMode ? focusTasks : filteredTasks;
  const doneTasks = tasks.filter(t => t.status === "DONE").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const heatmap = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (89 - i));
    const activity = Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0;
    return { date: d, activity };
  });

  const S = {
    page: { fontFamily: "'Rajdhani',sans-serif", color: "#f0f2f5" },
    card: { background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 4, padding: "1.25rem" },
    h2: { fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", color: "#6b8e23", letterSpacing: "2px", marginBottom: "1rem", textTransform: "uppercase" },
    btn: (color) => ({ background: `rgba(107,142,35,0.12)`, border: `1px solid ${color||"#6b8e23"}`, borderRadius: 3, color: color||"#6b8e23", padding: "0.4rem 0.9rem", fontFamily: "'Orbitron',sans-serif", fontSize: "0.55rem", letterSpacing: "1px", cursor: "pointer" }),
  };

  return (
    <div style={S.page}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>⚔ WAR ROOM</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Daily Operations Command Center</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={() => setFocusMode(!focusMode)} style={S.btn(focusMode ? "#ff9500" : "#6b8e23")}>
            {focusMode ? "⊙ FOCUS ON" : "◎ FOCUS MODE"}
          </button>
          <button onClick={() => setWeekView(!weekView)} style={S.btn()}>
            {weekView ? "📋 LIST" : "📅 WEEK"}
          </button>
          <button onClick={() => setShowAddModal(true)} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>
            + NEW TASK
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }}>
        {[
          { label:"TOTAL TASKS", value: totalTasks, color:"#6b8e23" },
          { label:"COMPLETED", value: doneTasks, color:"#4ade80" },
          { label:"COMPLETION", value: `${completionRate}%`, color:"#c19749" },
          { label:"CRITICAL", value: tasks.filter(t=>t.priority==="CRITICAL"&&t.status!=="DONE").length, color:"#ff3b30" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", color:s.color, fontWeight:800 }}>{s.value}</div>
            <div style={{ fontSize:"0.65rem", color:"#4d584d", letterSpacing:"1px", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.25rem" }}>
        <div>
          <div style={{ ...S.card, marginBottom:"1rem" }}>
            <p style={S.h2}>📝 TODAY'S STANDUP NOTES</p>
            <textarea
              value={standupNote}
              onChange={e => setStandupNote(e.target.value)}
              placeholder="Yesterday / Today / Blockers..."
              style={{ width:"100%", minHeight:72, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", padding:"0.6rem", resize:"vertical", boxSizing:"border-box" }}
            />
          </div>

          <div style={{ display:"flex", gap:"0.4rem", marginBottom:"0.75rem", alignItems:"center" }}>
            <span style={{ fontSize:"0.65rem", color:"#4d584d", fontFamily:"'Orbitron',sans-serif", letterSpacing:"1px" }}>FILTER:</span>
            {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)} style={{ ...S.btn(filterPriority===p ? (PRIORITY_COLORS[p]?.text||"#6b8e23") : "#4d584d"), padding:"0.25rem 0.5rem", fontSize:"0.5rem" }}>
                {p}
              </button>
            ))}
          </div>

          <div style={S.card}>
            <p style={S.h2}>{focusMode ? "🎯 FOCUS — TOP 3 CRITICAL/HIGH" : "⚔ TASK BOARD"}</p>
            {loading ? (
              <div style={{ color:"#4d584d", textAlign:"center", padding:"2rem" }}>LOADING...</div>
            ) : displayTasks.length === 0 ? (
              <div style={{ color:"#4d584d", textAlign:"center", padding:"2rem", fontSize:"0.85rem" }}>No tasks. Click + NEW TASK to add one.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {displayTasks.map(task => {
                  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
                  const isDone = task.status === "DONE";
                  return (
                    <div key={task.id} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.75rem", background: isDone ? "rgba(255,255,255,0.02)" : pc.bg, border:`1px solid ${isDone ? "rgba(255,255,255,0.06)" : pc.border}`, borderRadius:3, opacity: isDone ? 0.6 : 1 }}>
                      <button onClick={() => toggleTask(task)} style={{ width:20, height:20, borderRadius:2, border:`2px solid ${isDone ? "#4ade80" : pc.border}`, background: isDone ? "#4ade80" : "transparent", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontSize:"0.7rem" }}>
                        {isDone ? "✓" : ""}
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"0.9rem", color: isDone ? "#4d584d" : "#f0f2f5", textDecoration: isDone ? "line-through" : "none", fontWeight:600 }}>{task.title}</div>
                        {task.dueDate && <div style={{ fontSize:"0.7rem", color:"#4d584d", marginTop:2 }}>Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                      </div>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:pc.text, border:`1px solid ${pc.border}`, borderRadius:2, padding:"2px 6px", letterSpacing:"1px", flexShrink:0 }}>
                        {pc.badge}
                      </span>
                      <button onClick={() => deleteTask(task.id)} style={{ background:"none", border:"none", color:"#ff3b30", cursor:"pointer", fontSize:"0.8rem", padding:"0 4px" }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={S.card}>
            <p style={S.h2}>🎯 OBJECTIVES</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {objectives.map(obj => (
                <div key={obj.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:"0.78rem", color:"#f0f2f5", fontWeight:600 }}>{obj.title}</span>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#c19749" }}>{obj.progress}%</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${obj.progress}%`, background: obj.progress >= 80 ? "#4ade80" : obj.progress >= 50 ? "#c19749" : "#ff9500", borderRadius:3, transition:"width 0.5s" }} />
                  </div>
                  <input type="range" min={0} max={100} value={obj.progress}
                    onChange={e => setObjectives(prev => prev.map(o => o.id === obj.id ? {...o, progress: Number(e.target.value)} : o))}
                    style={{ width:"100%", marginTop:4, accentColor:"#6b8e23" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <p style={S.h2}>📊 90-DAY ACTIVITY</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(13,1fr)", gap:2 }}>
              {heatmap.map((d, i) => {
                const bg = d.activity === 0 ? "rgba(255,255,255,0.04)" : d.activity === 1 ? "rgba(107,142,35,0.2)" : d.activity === 2 ? "rgba(107,142,35,0.4)" : d.activity === 3 ? "rgba(107,142,35,0.65)" : "rgba(107,142,35,0.9)";
                return <div key={i} title={`${d.date.toLocaleDateString()}: ${d.activity} tasks`} style={{ width:"100%", paddingBottom:"100%", background:bg, borderRadius:1 }} />;
              })}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#0d1117", border:"1px solid rgba(107,142,35,0.3)", borderRadius:6, padding:"2rem", width:420, maxWidth:"90vw" }}>
            <h3 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1.5rem" }}>+ NEW WAR ROOM TASK</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label style={{ fontSize:"0.7rem", color:"#4d584d", display:"block", marginBottom:4 }}>TASK TITLE *</label>
                <input value={newTask.title} onChange={e => setNewTask(p => ({...p, title:e.target.value}))} onKeyDown={e => e.key==="Enter" && addTask()} placeholder="Enter task..." style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ fontSize:"0.7rem", color:"#4d584d", display:"block", marginBottom:4 }}>PRIORITY</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({...p, priority:e.target.value}))} style={{ width:"100%", background:"#0d1117", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem" }}>
                  <option value="CRITICAL">🔴 CRITICAL</option>
                  <option value="HIGH">🟠 HIGH</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                  <option value="LOW">🟢 LOW</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:"0.7rem", color:"#4d584d", display:"block", marginBottom:4 }}>DUE DATE</label>
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({...p, dueDate:e.target.value}))} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
              <button onClick={() => setShowAddModal(false)} style={S.btn("#4d584d")}>CANCEL</button>
              <button onClick={addTask} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>ADD TASK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
