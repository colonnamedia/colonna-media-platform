import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";

const scrollToBooking = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};

const tools = [
  {
    title: "Website Builder",
    tag: "Web Pages",
    description: "Plan and launch lead-generating web pages designed to convert visitors into inquiries — fast and focused.",
    href: "https://papaya-launch-site-flow.base44.app",
  },
  {
    title: "SEO Auditor",
    tag: "SEO & Visibility",
    description: "Audit your local SEO presence, identify visibility gaps, and get a strategy to rank where your customers are searching.",
    href: "https://seo-auditor-pro-copy-7436d8be.base44.app",
  },
  {
    title: "Content Creation AI",
    tag: "Content",
    description: "Generate on-brand, conversion-focused content for social media, campaigns, and web pages — powered by AI.",
    href: "https://fire-works-content-ai.base44.app",
  },
  {
    title: "Marketing Blueprint",
    tag: "Customer Journey",
    description: "Map your customer journey, identify where leads drop off, and build a smarter path from awareness to conversion.",
    href: "https://marketing-blueprint-build.base44.app",
  },
];

export default function BrandIntro() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Blue/purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#1a1060] to-[#302b63]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/25 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-4"
          >
            The Colonna Ecosystem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl md:text-5xl font-semibold leading-tight text-white mb-4"
          >
            Tools That Help{" "}
            <span className="italic font-light text-blue-300">Businesses Grow</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Colonna Media connects businesses to specialized tools designed to support lead generation, SEO, content creation, and digital growth — all built to work together.
          </motion.p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {tools.map((tool, i) => (
            <motion.a
              key={tool.title}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group flex flex-col p-6 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400 bg-blue-400/10 px-3 py-1">
                  {tool.tag}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed flex-1">{tool.description}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 group-hover:gap-3 transition-all">
                Open Tool <ArrowRight className="w-3 h-3" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative border border-blue-400/20 bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-10 text-center backdrop-blur-sm"
        >
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-3">Free · No Pressure</p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            Not Sure Where to Start?
          </h3>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-8">
            Book a free 30-minute strategy call. We'll look at your current situation, identify the gaps, and map out exactly what would make the biggest impact for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToBooking}
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-blue-400 transition-colors"
            >
              Book Your Free Call <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/services"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              See All Services
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-10 mt-10 pt-8 border-t border-white/10">
            {[
              { num: "50+", label: "Clients Served" },
              { num: "8+", label: "Services Offered" },
              { num: "100%", label: "Growth Focused" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-semibold text-blue-300">{stat.num}</p>
                <p className="text-xs uppercase tracking-wider text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}