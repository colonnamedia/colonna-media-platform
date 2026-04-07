import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Palette, Calendar, Rocket, Image, BarChart3, Layers } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";
import CTABanner from "../components/shared/CTABanner";

const offerings = [
  { icon: Palette, title: "Branded Visual Content", desc: "Custom graphics, photos, and visual assets that reflect your brand identity across every platform." },
  { icon: Calendar, title: "Content Planning", desc: "Strategic calendars and content roadmaps to keep your messaging consistent and purposeful." },
  { icon: Image, title: "Social Media Content", desc: "Scroll-stopping posts, stories, and reels that engage your audience and drive action." },
  { icon: Rocket, title: "Campaign Content", desc: "Launch-ready content for promotions, product drops, and seasonal campaigns." },
  { icon: BarChart3, title: "Business Content", desc: "Professional visuals and messaging for presentations, proposals, and internal communication." },
  { icon: Layers, title: "Media Support", desc: "Ongoing creative support for launches, events, and continuous brand presence." },
];

export default function ContentCreation() {
  return (
    <div>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Content Creation</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Content With <span className="italic font-light">Purpose</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg leading-relaxed">
              We create branded visual content, social assets, and campaign materials that tell your story with clarity and drive real engagement.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-500"
              >
                <item.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors">
              Start a Content Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTABanner
        headline="Need Content That Converts?"
        subtitle="Let's plan and create content that drives engagement and supports your business goals."
        ctaText="Let's Talk Content"
      />
    </div>
  );
}