import React from "react";

export default function ColonnaLogo({ light = false, size = "md" }) {
  const textClass = size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-1">
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