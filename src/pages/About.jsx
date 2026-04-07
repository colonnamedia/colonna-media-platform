import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Lightbulb, TrendingUp } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";
import CTABanner from "../components/shared/CTABanner";

const TEAM_IMAGE = "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/2e5689bf7_IMG_5011.jpg";
const STREET_IMAGE = "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/20719a314_IMG_3614.jpg";

const pillars = [
  { icon: Eye, title: "Why Good Content Alone Is Not Enough", desc: "Great visuals grab attention — but without a strategy behind them, they don't convert. We bridge the gap between creative and commercial." },
  { icon: Target, title: "Why Strategy Matters", desc: "Knowing your customer journey, optimizing your touchpoints, and aligning your messaging to your offer is what turns followers into clients." },
  { icon: Lightbulb, title: "Creative Meets Conversion", desc: "We treat every photo, every page, and every campaign as a piece of a larger growth system. Nothing is decoration — everything is intentional." },
  { icon: TrendingUp, title: "What We Actually Help With", desc: "Photography. Content. Web pages that convert. SEO that gets you found. Ad campaigns that drive inquiries. Strategy that ties it all together." },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">About Us</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              We Help Businesses <span className="italic font-light">Stand Out</span> and <span className="italic font-light">Convert</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg leading-relaxed">
              Colonna Media is a Pittsburgh-based media and technology company that helps businesses and personal brands stand out with strategic content and stronger digital systems.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={STREET_IMAGE} alt="Colonna Media founder" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Our Story</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-6">
                Built on Creativity. <span className="italic font-light">Driven by Results.</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Colonna Media started as a photography studio with one mission: help businesses look their absolute best. But we quickly realized that great visuals alone weren't enough.</p>
                <p>Businesses needed more than beautiful photos — they needed strategy. They needed content that told a story, web pages that converted, and systems that turned attention into action.</p>
                <p>Today, Colonna Media is a full-service creative strategy company. We combine photography, content creation, consulting, SEO, ad campaigns, and lead generation into one cohesive growth engine for our clients.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader eyebrow="Our Philosophy" title="Why We Do Things Differently" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border border-border p-8 hover:border-primary/20 hover:shadow-lg transition-all duration-500"
              >
                <item.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        headline="Let's Talk About Your Business"
        subtitle="Whether you're starting fresh or looking to level up, we'll help you build a brand and a system that actually works."
        ctaText="Get in Touch"
      />
    </div>
  );
}