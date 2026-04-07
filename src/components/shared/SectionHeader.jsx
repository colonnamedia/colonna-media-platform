import React from "react";
import { motion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, subtitle, align = "center", light = false }) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <div className={`${alignClass} mb-12 lg:mb-16`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-xs font-semibold uppercase tracking-[0.2em] mb-4 ${light ? "text-background/50" : "text-primary"}`}
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className={`font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight ${light ? "text-background" : "text-foreground"}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`mt-4 text-lg max-w-2xl ${align === "center" ? "mx-auto" : ""} ${light ? "text-background/60" : "text-muted-foreground"}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}