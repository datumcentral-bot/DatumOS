"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export function NewsletterForm({ className = "" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed successfully.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Enter a valid email address.");
      }
    } catch {
      setStatus("error");
      setMessage("Subscription failed. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-health-green/30 bg-health-green/10 px-4 py-3 text-sm text-health-green ${className}`}>
        <CheckCircle2 size={16} />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="h-10 w-full rounded-lg border border-hud-line/60 bg-hud-900 pl-9 pr-3 text-sm text-sand-100 placeholder-sand-400/60 outline-none transition focus:border-sand-400 focus:ring-1 focus:ring-sand-400/30"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-sand-500 px-4 py-2 text-sm font-bold text-hud-950 transition hover:bg-sand-400 disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={13} /> {message}
        </p>
      )}
    </form>
  );
}
