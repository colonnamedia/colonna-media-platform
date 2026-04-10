import React from "react";
import { Camera, Palette, Users, Route, Globe, Search, Megaphone, Target } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../shared/SectionHeader";

const services = [
  { icon: Camera, title: "Photography", description: "Brand photography, portraits, headshots, studio and on-location sessions designed to elevate your visual identity." },
  { icon: Palette, title: "Content Creation", description: "Branded visual content, social media assets, and campaign materials that tell your story with clarity." },
  { icon: Users, title: "Consulting", description: "Business and marketing consulting to sharpen your positioning, clarify your offers, and accelerate growth." },
  { icon: Route, title: "Customer Journey Strategy", description: "Audit and optimize how leads move through your business — from first impression to conversion." },
  { icon: Globe, title: "Lead-Gen Web Pages", description: "High-converting landing pages, offer pages, and service pages designed to turn visitors into inquiries." },
  { icon: Search, title: "SEO", description: "Local SEO, on-page optimization, and content visibility strategy to make sure the right people find you." },
  { icon: Megaphone, title: "Ad Campaigns", description: "Conversion-focused ad messaging, creative direction, and funnel strategy that drives measurable results." },
  { icon: Target, title: "Lead Generation", description: "End-to-end lead generation strategy — from offer positioning and messaging to conversion pathways." },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader
          eyebrow="What We Do"
          title="Services Built for Growth"
          subtitle="Every service is designed to help your business look better, communicate better, and convert better."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden border-r border-b border-border last:border-r-0 p-8 hover:bg-foreground transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-5 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-background transition-colors">{service.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-background/60 leading-relaxed transition-colors">{service.description}</p>
                <div className="mt-4 w-6 h-0.5 bg-primary group-hover:w-10 transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}