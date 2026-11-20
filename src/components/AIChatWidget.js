"use client";
import { useState, useEffect, useRef, useCallback } from "react";

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

function generateSessionId() {
  return "session-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 12px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: MIL.green,
          animation: `aiDotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "USER";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "rgba(107,142,35,0.2)",
          border: "1px solid rgba(107,142,35,0.4)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "0.7rem", marginRight: 8, flexShrink: 0,
          fontFamily: MIL.head, color: MIL.green,
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser ? "rgba(107,142,35,0.15)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isUser ? "rgba(107,142,35,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        padding: "8px 12px",
        fontSize: "0.85rem",
        color: isUser ? "#a2d033" : MIL.text,
        fontFamily: MIL.font,
        lineHeight: 1.5,
        boxShadow: isUser ? "0 0 8px rgba(107,142,35,0.1)" : "none",
      }}>
        {/* Render markdown-like bold */}
        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={i} style={{ color: MIL.gold }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </div>
      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "rgba(193,151,73,0.2)",
          border: "1px solid rgba(193,151,73,0.4)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "0.6rem", marginLeft: 8, flexShrink: 0,
          fontFamily: MIL.head, color: MIL.gold,
        }}>YOU</div>
      )}
    </div>
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    setMessages([{
      role: "ASSISTANT",
      content: "Hello! I'm **DATUM AI**, your intelligent project assistant. I can help you with project status, BIM deliverables, invoices, timelines, and team contacts. What would you like to know?",
    }]);
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "USER", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          history: messages.slice(-8),
        }),
      });
      const data = await r.json();
      const aiMsg = { role: "ASSISTANT", content: data.reply || "I apologize, I couldn't process that request. Please try again." };
      setMessages(prev => [...prev, aiMsg]);
      if (!open) setUnread(n => n + 1);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ASSISTANT", content: "Connection error. Please check your network and try again." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, sessionId, open]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Project status update?",
    "Any invoice due?",
    "Clash detection status?",
    "Next milestone?",
  ];

  return (
    <>
      <style>{`
        @keyframes aiDotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes aiWidgetPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(107,142,35,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(107,142,35,0); }
        }
        @keyframes aiSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Floating bubble */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9998,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(107,142,35,0.9), rgba(107,142,35,0.6))",
          border: "2px solid rgba(107,142,35,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          animation: !open ? "aiWidgetPulse 2s ease-in-out infinite" : "none",
          backdropFilter: "blur(8px)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="DATUM AI Assistant"
      >
        <span style={{ fontSize: "1.4rem" }}>{open ? "✕" : "🤖"}</span>
        {unread > 0 && !open && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            background: "#ff3b30", color: "#fff", borderRadius: "50%",
            width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: MIL.head, fontSize: "0.5rem", fontWeight: "bold",
          }}>{unread}</div>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, right: 24, zIndex: 9997,
          width: 360, height: 520,
          background: MIL.panel,
          border: `1px solid ${MIL.border}`,
          borderRadius: 12,
          display: "flex", flexDirection: "column",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(107,142,35,0.1)",
          animation: "aiSlideUp 0.25s ease-out",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "rgba(107,142,35,0.08)",
            borderBottom: `1px solid ${MIL.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {/* HUD brackets */}
            <div style={{ position: "relative", width: 36, height: 36 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(107,142,35,0.2)", border: "1px solid rgba(107,142,35,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🤖</div>
              <div style={{ position: "absolute", top: -2, left: -2, width: 8, height: 8, borderTop: "2px solid #6b8e23", borderLeft: "2px solid #6b8e23" }} />
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 8, height: 8, borderBottom: "2px solid #6b8e23", borderRight: "2px solid #6b8e23" }} />
            </div>
            <div>
              <div style={{ fontFamily: MIL.head, fontSize: "0.65rem", color: MIL.green, letterSpacing: 2 }}>DATUM AI ASSISTANT</div>
              <div style={{ fontSize: "0.7rem", color: MIL.dim, marginTop: 1 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6b8e23", marginRight: 4, animation: "aiDotPulse 2s ease-in-out infinite" }} />
                Online · Powered by AI
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: MIL.dim, cursor: "pointer", fontSize: "1rem", padding: 4 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", scrollbarWidth: "thin", scrollbarColor: "rgba(107,142,35,0.3) transparent" }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px 12px 12px 2px", padding: "4px 8px" }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 14px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {quickQuestions.map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(sendMessage, 50); }}
                  style={{ background: "rgba(107,142,35,0.08)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 20, color: MIL.dim, padding: "4px 10px", fontFamily: MIL.font, fontSize: "0.72rem", cursor: "pointer" }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${MIL.border}`, display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your project..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 20, padding: "8px 14px", color: MIL.text, fontFamily: MIL.font,
                fontSize: "0.85rem", outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? MIL.green : "rgba(107,142,35,0.2)",
                border: "none", borderRadius: "50%", width: 36, height: 36,
                color: "#fff", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", transition: "background 0.2s",
              }}
            >
              {loading ? "⟳" : "↑"}
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: "4px 14px 8px", textAlign: "center", fontFamily: MIL.head, fontSize: "0.38rem", color: "rgba(138,155,176,0.5)", letterSpacing: 1 }}>
            DATUM STUDIOS · AI ASSISTANT · ISO 19650 COMPLIANT
          </div>
        </div>
      )}
    </>
  );
}
