import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTABanner({
  headline = "Let's Build Something That Converts",
  subtitle = "Whether you need a photoshoot, a high-converting landing page, or a full growth strategy — we're ready.",
  ctaText = "Start a Project",
  ctaLink = "/contact",
  secondaryCta,
  secondaryLink = "/bookings"
}) {
  return (
    <section className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight"
        >
          {headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-background/60 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={ctaLink}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors"
          >
            {ctaText} <ArrowRight className="w-4 h-4" />
          </Link>
          {secondaryCta && (
            <Link
              to={secondaryLink}
              className="inline-flex items-center gap-2 border border-background/30 text-background px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-background/10 transition-colors"
            >
              {secondaryCta}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}