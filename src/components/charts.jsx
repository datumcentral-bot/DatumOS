"use client";

// Lightweight pure-SVG charts — no external charting dependency.

export function BarMini({ data = [], height = 64, tone = "#234b84", target }) {
  const max = Math.max(...data.map((d) => d.value), target || 0, 1);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 16} ${height}`} preserveAspectRatio="none">
      {target != null && (
        <line
          x1="0"
          x2={data.length * 16}
          y1={height - (target / max) * height}
          y2={height - (target / max) * height}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 4);
        const met = target == null || d.value >= target;
        return (
          <rect
            key={i}
            x={i * 16 + 3}
            y={height - h}
            width="10"
            height={h}
            rx="2"
            fill={met ? tone : "#cbd5e1"}
          />
        );
      })}
    </svg>
  );
}

export function Donut({ segments = [], size = 120, thickness = 16, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerLabel != null && (
        <div className="absolute text-center">
          <div className="text-xl font-bold text-brand-900">{centerLabel}</div>
          {centerSub && <div className="text-[10px] uppercase tracking-wide text-slate-400">{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

export function Sparkline({ data = [], width = 160, height = 44, tone = "#0e9a8c" }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={tone} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function GaugeRing({ value = 0, size = 120, tone = "#0e9a8c" }) {
  const radius = (size - 14) / 2;
  const circ = 2 * Math.PI * radius;
  const len = (Math.min(100, value) / 100) * circ;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef2f7" strokeWidth="14" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth="14"
          strokeDasharray={`${len} ${circ - len}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-brand-900">{value}%</div>
      </div>
    </div>
  );
}
