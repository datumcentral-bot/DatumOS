"use client";

import { useEffect, useState } from "react";

// Small tactical live clock for the command-center top bar.
export function LiveClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return (
    <div className="hidden items-center gap-2 rounded-md border border-sand-500/25 bg-sand-500/5 px-2.5 py-1 md:flex">
      <span className="h-1.5 w-1.5 rounded-full bg-health-green animate-pulse-dot" />
      <span className="stencil text-xs font-semibold tabular-nums text-sand-200">
        {hh}:{mm}:{ss}
      </span>
    </div>
  );
}
