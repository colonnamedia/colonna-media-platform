import React from "react";

export default function ColonnaLogo({ light = false, size = "md" }) {
  const textClass = size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-2.5">
      {/* Roman Column SVG */}
      <svg
        width="22"
        height="32"
        viewBox="0 0 22 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Capital (top) */}
        <rect x="0" y="0" width="22" height="3" rx="0.5" fill="#B8945A" />
        <rect x="2" y="3" width="18" height="1.5" rx="0.5" fill="#B8945A" />
        {/* Shaft */}
        <rect x="4" y="4.5" width="3" height="20" fill={light ? "white" : "#1a1a1a"} opacity="0.85" />
        <rect x="9.5" y="4.5" width="3" height="20" fill={light ? "white" : "#1a1a1a"} opacity="0.85" />
        <rect x="15" y="4.5" width="3" height="20" fill={light ? "white" : "#1a1a1a"} opacity="0.85" />
        {/* Base */}
        <rect x="2" y="24.5" width="18" height="1.5" rx="0.5" fill="#B8945A" />
        <rect x="0" y="26" width="22" height="3" rx="0.5" fill="#B8945A" />
        {/* Stylobate */}
        <rect x="0" y="29" width="22" height="3" rx="0.5" fill={light ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.15)"} />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-display ${textClass} font-semibold tracking-[0.04em] ${light ? "text-white" : "text-foreground"}`}>
          Colonna
        </span>
        <span className={`font-display text-xs font-light italic tracking-[0.3em] uppercase ${light ? "text-primary" : "text-primary"} -mt-0.5`}>
          Media
        </span>
      </div>
    </div>
  );
}