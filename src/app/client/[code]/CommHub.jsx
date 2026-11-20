"use client";

import { useState, useTransition } from "react";
import { sendClientMessage } from "./actions";
import { Send } from "lucide-react";

export function CommHub({ projectId, code, messages }) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [local, setLocal] = useState(messages);

  const send = () => {
    if (!text.trim()) return;
    const body = text.trim();
    setLocal((prev) => [...prev, { id: `tmp-${Date.now()}`, authorName: "James Whitfield", authorSide: "CLIENT", body, createdAt: new Date().toISOString() }]);
    setText("");
    startTransition(async () => {
      await sendClientMessage(projectId, body, code);
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 360 }}>
        {local.map((m) => {
          const mine = m.authorSide === "CLIENT";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-brand-700 text-white" : "bg-surface-muted text-slate-700"}`}>
                <p className={`mb-0.5 text-[10px] font-semibold ${mine ? "text-brand-100" : "text-slate-400"}`}>
                  {m.authorName} · {mine ? "You" : "Datum Studios"}
                </p>
                {m.body}
              </div>
            </div>
          );
        })}
        {local.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No messages yet — start the conversation.</p>}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message the delivery team…"
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent-400"
        />
        <button
          onClick={send}
          disabled={isPending || !text.trim()}
          className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
