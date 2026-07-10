/* eslint-disable @next/next/no-img-element */
// Brand logo built around the real DATUM BIM ENGINEERING emblem.
// `light`  -> use the sand-tinted emblem for dark HUD surfaces.
// `subtitle` overrides the small caption line (e.g. per-portal label).
// `wordmark=false` renders the emblem only (compact icon).
export function Logo({ size = 34, light = false, subtitle = "BIM Engineering", wordmark = true }) {
  const fg = light ? "#faf7ef" : "#0d2a3a";
  const accent = "#cca962"; // sand
  const sub = light ? "rgba(243,236,216,0.62)" : "#5f6733";
  const src = light ? "/brand/datum-emblem-light.png" : "/brand/datum-emblem.png";
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-lg"
        style={{
          width: size,
          height: size,
          background: light ? "rgba(204,169,98,0.10)" : "transparent",
          boxShadow: light ? "inset 0 0 0 1px rgba(204,169,98,0.28)" : "none",
        }}
      >
        <img
          src={src}
          alt="Datum BIM Engineering"
          width={Math.round(size * 0.82)}
          height={Math.round(size * 0.82)}
          style={{ objectFit: "contain" }}
        />
      </span>
      {wordmark && (
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-[0.14em]" style={{ color: fg }}>
            DATUM<span style={{ color: accent }}>·</span>OS
          </div>
          <div className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: sub }}>
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}

// Public-site wordmark: emblem + "DATUM BIM ENGINEERING" full lockup.
export function BrandLockup({ light = true, size = 40 }) {
  const fg = light ? "#faf7ef" : "#0d2a3a";
  const accent = "#cca962";
  const sub = light ? "rgba(243,236,216,0.6)" : "#5f6733";
  const src = light ? "/brand/datum-emblem-light.png" : "/brand/datum-emblem.png";
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Datum BIM Engineering" width={size} height={size} style={{ objectFit: "contain" }} />
      <div className="leading-none">
        <div className="text-[17px] font-extrabold tracking-[0.16em]" style={{ color: fg }}>
          DATUM <span style={{ color: accent }}>BIM</span>
        </div>
        <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.28em]" style={{ color: sub }}>
          Engineering
        </div>
      </div>
    </div>
  );
}
