import React from "react";
import { motion } from "framer-motion";
import { Zap, Map, Megaphone, Globe, ArrowUpRight } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";

const projects = [
  {
    icon: Zap,
    title: "Fire-Works",
    tag: "Lead Funnel Systems",
    description: "A full lead funnel platform — landing pages, lead capture, email notifications, lead dashboards, and analytics for businesses that want a complete system, not just a website.",
    link: "https://www.fireworks-eco.com/",
  },
  {
    icon: Globe,
    title: "Website Builder",
    tag: "Pro Website Builds",
    description: "Professional website builds for businesses that want a polished, conversion-ready site without the lead funnel system attached.",
    link: "https://fireworks-websitebuilder.com",
  },
  {
    icon: Megaphone,
    title: "Campaign Builder",
    tag: "AI Ad Campaign Generator",
    description: "A self-serve tool that helps businesses generate ad headlines, body copy, and calls-to-action with AI — no campaign management required.",
    link: "https://www.fireworks-campaignbuilder.com/",
  },
  {
    icon: Map,
    title: "Blueprint Builder",
    tag: "90-Day Business Roadmap",
    description: "A guided tool that lays out a 90-day marketing roadmap for startups and growing businesses — what to focus on first, second, and beyond.",
    link: "https://www.fireworks-businessblueprint.com/",
  },
];

export default function WhatWeBuilt() {
  return (
    <div>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader
            eyebrow="Beyond Local Services"
            title="What We've Built"
            subtitle="Colonna Media is also the team behind Fire-Works — a set of tools and platforms for businesses that want to grow on their own."
          />
        </div>
      </section>
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.a
                key={p.title}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-8 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{p.tag}</p>
                <h3 className="font-display text-xl font-semibold mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                <span className="mt-5 text-sm font-medium inline-flex items-center gap-1">
                  Visit Site <ArrowUpRight className="w-4 h-4" />
                </span>
              </motion.a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
