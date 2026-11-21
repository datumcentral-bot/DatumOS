"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MIL = {
  bg: "#0a0e14",
  panel: "rgba(10,14,20,0.97)",
  border: "rgba(107,142,35,0.3)",
  green: "#6b8e23",
  gold: "#c19749",
  text: "#f0f2f5",
  dim: "#8a9bb0",
  blue: "#4a9eff",
  font: "'Rajdhani', sans-serif",
  head: "'Orbitron', sans-serif",
};

export default function AIAgentsPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ agentId: "", task: "" });
  const [response, setResponse] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/ai/agents");
      const data = await res.json();
      setAgents(data.agents || []);
      setTasks(data.tasks || []);
      setStats(data.stats || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const assignTask = async () => {
    if (!newTask.agentId || !newTask.task) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: newTask.agentId, task: newTask.task }),
      });
      const data = await res.json();
      setResponse(data);
      setNewTask({ agentId: "", task: "" });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto", fontFamily: MIL.font, color: MIL.text }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: `1px solid ${MIL.border}`,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>✦</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            AI AGENTS MANAGEMENT
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>Multi-agent system monitoring and task assignment</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
        {[stats && [
          { label: "AGENTS", value: stats.totalAgents, color: MIL.blue },
          { label: "ONLINE", value: stats.onlineAgents, color: MIL.green },
          { label: "TOTAL TASKS", value: stats.totalTasks, color: MIL.blue },
          { label: "COMPLETED", value: stats.completedTasks, color: MIL.green },
          { label: "PENDING", value: stats.pendingTasks, color: MIL.gold },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(16,20,26,0.8)",
              border: `1px solid ${MIL.border}`,
              borderRadius: 4,
              padding: "1rem",
              textAlign: "center",
              flex: 1,
            }}
          >
            <div style={{ fontSize: "0.6rem", color: MIL.dim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "1.5rem", fontFamily: MIL.head, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        )) : null}
      </div>

      {/* Agents */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          AGENTS
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Name</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Role</th>
                <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Status</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Capabilities</th>
                <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{agent.name}</td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{agent.role}</td>
                  <td style={{ padding: "0.3rem", textAlign: "center" }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: agent.status === "ONLINE" ? MIL.green : MIL.red,
                        display: "inline-block",
                        boxShadow: agent.status === "ONLINE" ? `0 0 6px ${MIL.green}` : `0 0 6px ${MIL.red}`,
                        marginRight: "0.5rem",
                      }}
                    />
                    {agent.status}
                  </td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.65rem" }}>{agent.capabilities.join(", ")}</td>
                  <td style={{ padding: "0.3rem", textAlign: "center", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{agent.tasksProcessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Assignment */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          ASSIGN TASK TO AGENT
        </div>
        <div style={{ background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Agent</label>
            <select
              value={newTask.agentId}
              onChange={(e) => setNewTask({ ...newTask, agentId: e.target.value })}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Task Description</label>
            <input
              type="text"
              placeholder="e.g., Check CPU status, Analyze project data, Generate report"
              value={newTask.task}
              onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <button
            onClick={assignTask}
            disabled={loading || !newTask.agentId || !newTask.task}
            style={{
              padding: "0.6rem 1rem",
              background: MIL.green,
              border: "none",
              borderRadius: 3,
              color: "#fff",
              fontFamily: MIL.head,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: loading || !newTask.agentId || !newTask.task ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            ASSIGN TASK
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          TASKS
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Task</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Agent</th>
                <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Status</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Result</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.task}</td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.agentName}</td>
                  <td style={{ padding: "0.3rem", textAlign: "center" }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          t.status === "COMPLETED" ? MIL.green : t.status === "PENDING" ? MIL.gold : MIL.blue,
                        display: "inline-block",
                        marginRight: "0.5rem",
                      }}
                    />
                    {t.status}
                  </td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.65rem" }}>{t.result || "—"}</td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.65rem" }}>{new Date(t.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {response && (
        <div
          style={{
            background: "rgba(16,20,26,0.8)",
            border: `1px solid ${MIL.border}`,
            borderRadius: 4,
            padding: "1rem",
            marginTop: "1.5rem",
            fontFamily: MIL.font,
            fontSize: "0.7rem",
            color: MIL.text,
          }}
        >
          <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
            RESPONSE
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.65rem", lineHeight: 1.5 }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
