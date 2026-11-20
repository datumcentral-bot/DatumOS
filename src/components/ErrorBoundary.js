"use client";
import { Component } from "react";

// ErrorBoundary — catches client-side render exceptions in the
// director pages and shows the REAL error message + component stack
// on-screen, instead of the generic "A client-side exception has
// occurred" overlay. This makes the failing component diagnosable
// from the page itself (no browser console needed).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] director page crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const err = this.state.error;
      return (
        <div
          style={{
            margin: "1rem",
            padding: "1.25rem",
            background: "rgba(255,59,48,0.06)",
            border: "1px solid rgba(255,59,48,0.35)",
            borderRadius: 8,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          <p
            style={{
              margin: "0 0 0.5rem",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "#ff3b30",
              textTransform: "uppercase",
            }}
          >
            Component error — a render exception was caught
          </p>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.78rem",
              lineHeight: 1.5,
              color: "#f0f2f5",
              background: "rgba(0,0,0,0.35)",
              borderRadius: 6,
              padding: "0.75rem",
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            {String(err?.stack || err?.message || err)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: "0.75rem",
              background: "#6b8e23",
              color: "#0a0e14",
              border: "none",
              borderRadius: 6,
              padding: "0.45rem 1rem",
              fontWeight: 700,
              fontSize: "0.7rem",
              cursor: "pointer",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
