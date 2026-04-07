import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Heart, Eye, MapPin, TrendingUp } from "lucide-react";
import SectionHeader from "../shared/SectionHeader";

const reasons = [
  { icon: Sparkles, title: "Creative + Strategic", desc: "We combine artistic vision with data-driven thinking." },
  { icon: Eye, title: "Visual + Technical", desc: "Stunning media paired with systems that actually convert." },
  { icon: TrendingUp, title: "Built for Growth", desc: "Every deliverable is designed to drive real business results." },
  { icon: Heart, title: "Personalized Service", desc: "Boutique attention — no cookie-cutter templates or generic plans." },
  { icon: MapPin, title: "Local Expertise", desc: "Deep understanding of local businesses and their unique challenges." },
  { icon: Zap, title: "Lead-Focused Thinking", desc: "From photography to web pages — everything points toward conversion." },
];

export default function WhyColonna() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why Colonna Media"
          title="What Makes Us Different"
          subtitle="We're not just another creative agency. We're a growth partner that happens to be really good at making things beautiful."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-5"
            >
              <div className="w-10 h-10 shrink-0 bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}