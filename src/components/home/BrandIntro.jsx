import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
const scrollToBooking = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};
export default function BrandIntro() {
  return (
    <section className="relative py-24 lg:py-32 bg-secondary/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4"
        >
          Pittsburgh, PA
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-6"
        >
          Local Marketing, <span className="italic font-light">Done Right</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10"
        >
          We work hands-on with Pittsburgh-area businesses — photography, video, consulting, ad campaigns, and websites built to bring in real local leads, not just look good.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
        >
          <button
            onClick={scrollToBooking}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors"
          >
            Book a Free Call <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="/services"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground/80 px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-background transition-colors"
          >
            See All Services
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-10 pt-8 border-t border-border"
        >
          {[
            { num: "50+", label: "Clients Served" },
            { num: "5+", label: "Local Services" },
            { num: "100%", label: "Growth Focused" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-primary">{stat.num}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
