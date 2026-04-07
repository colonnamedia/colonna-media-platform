import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Route, Target, Megaphone, Globe, Search, Users } from "lucide-react";
import CTABanner from "../components/shared/CTABanner";

const services = [
  { icon: Route, title: "Customer Journey Consulting", desc: "We audit how leads discover, evaluate, and contact your business — then optimize every step for better conversion." },
  { icon: Target, title: "Offer Clarity & Positioning", desc: "Sharpen your core offer so prospects immediately understand the value you bring and why they should choose you." },
  { icon: Users, title: "Lead Generation Strategy", desc: "Build a system for attracting inquiries — from offer positioning and messaging to conversion pathways that work." },
  { icon: Globe, title: "Landing Page & Web Strategy", desc: "Strategic direction for web pages that convert — structure, copy framework, CTA placement, and user flow." },
  { icon: Megaphone, title: "Ad Campaign Strategy", desc: "From messaging and creative direction to funnel architecture — we design campaigns that drive measurable results." },
  { icon: Search, title: "SEO & Visibility", desc: "Local SEO support, content strategy, and on-page optimization direction to make sure the right people find you." },
];

export default function Strategy() {
  return (
    <div>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Strategy & Consulting</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Strategy That Drives <span className="italic font-light">Real Growth</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg leading-relaxed">
              Great visuals need great strategy behind them. We help you build the customer journey, optimize conversion points, and create systems that turn attention into action.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-border pb-12 last:border-none"
            >
              <div className="lg:col-span-1">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="lg:col-span-4">
                <h3 className="font-display text-xl font-semibold">{service.title}</h3>
              </div>
              <div className="lg:col-span-5">
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
              <div className="lg:col-span-2 flex lg:justify-end">
                <Link to="/contact" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                  Inquire <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CTABanner
        headline="Let's Map Your Growth Strategy"
        subtitle="Book a consultation and we'll walk through your customer journey, your offers, and your digital presence."
        ctaText="Book a Strategy Call"
        ctaLink="/bookings"
      />
    </div>
  );
}