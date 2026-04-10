import React from "react";

export default function ColonnaLogo({ light = false, size = "md" }) {
  const textClass = size === "lg" ? "text-3xl" : "text-2xl";
  const shaft = light ? "rgba(255,255,255,0.92)" : "#2a2520";
  const gold = "#B8945A";
  const shadow = light ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)";

  return (
    <div className="flex items-center gap-2.5">
      {/* Roman Column SVG — solid stone look */}
      <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        {/* Abacus — flat top slab */}
        <rect x="0" y="0" width="24" height="3.5" rx="0.5" fill={gold} />
        {/* Echinus — curved cap, tapers inward */}
        <path d="M1 3.5 Q2 7 5 7.5 L19 7.5 Q22 7 23 3.5 Z" fill={gold} />
        {/* Necking ring */}
        <rect x="5" y="7.5" width="14" height="1.5" rx="0.3" fill={gold} opacity="0.7" />
        {/* Shaft — solid, slightly tapered (entasis) */}
        <path d="M5.5 9 Q4.8 18 5 28 L19 28 Q19.2 18 18.5 9 Z" fill={shaft} />
        {/* Flute highlights on shaft */}
        <line x1="8" y1="9.5" x2="7.8" y2="27.5" stroke={shadow} strokeWidth="0.8" />
        <line x1="11.5" y1="9" x2="11.5" y2="28" stroke={shadow} strokeWidth="0.8" />
        <line x1="15" y1="9.5" x2="15.2" y2="27.5" stroke={shadow} strokeWidth="0.8" />
        {/* Base torus (top ring) */}
        <rect x="4.5" y="28" width="15" height="1.5" rx="0.3" fill={gold} opacity="0.8" />
        {/* Plinth — base slab */}
        <rect x="2" y="29.5" width="20" height="3" rx="0.4" fill={gold} />
        {/* Stylobate */}
        <rect x="0" y="32.5" width="24" height="3.5" rx="0.5" fill={gold} opacity="0.55" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-display ${textClass} font-semibold tracking-[0.04em] ${light ? "text-white" : "text-foreground"}`}>
          Colonna
        </span>
        <span className="font-display text-xs font-light italic tracking-[0.3em] uppercase text-primary -mt-0.5">
          Media
        </span>
      </div>
    </div>
  );
}