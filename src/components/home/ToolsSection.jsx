import React from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Website Builder",
    tag: "Web Pages",
    description:
      "Plan and launch lead-generating web pages designed to convert visitors into inquiries — fast and focused.",
    href: "https://papaya-launch-site-flow.base44.app",
    color: "border-t-amber-400",
  },
  {
    title: "SEO Auditor",
    tag: "SEO & Visibility",
    description:
      "Audit your local SEO presence, identify visibility gaps, and get a strategy to rank where your customers are searching.",
    href: "https://seo-auditor-pro-copy-7436d8be.base44.app",
    color: "border-t-stone-400",
  },
  {
    title: "Content Creation AI",
    tag: "Content",
    description:
      "Generate on-brand, conversion-focused content for social media, campaigns, and web pages — powered by AI.",
    href: "https://fire-works-content-ai.base44.app",
    color: "border-t-amber-400",
  },
  {
    title: "Marketing Blueprint",
    tag: "Customer Journey",
    description:
      "Map your customer journey, identify where leads drop off, and build a smarter path from awareness to conversion.",
    href: "https://marketing-blueprint-build.base44.app",
    color: "border-t-stone-400",
  },
];

export default function ToolsSection() {
  return (
    <section id="tools" className="py-24 lg:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">The Colonna Ecosystem</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight">
            Tools That Help <span className="italic font-light">Businesses Grow</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Colonna Media connects businesses to specialized tools designed to support lead generation, SEO, content creation, and digital growth — all built to work together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              className={`group flex flex-col bg-background border border-border border-t-4 ${tool.color} p-8 hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary bg-primary/10 px-3 py-1">
                  {tool.tag}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.description}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary group-hover:gap-3 transition-all">
                Open Tool <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}