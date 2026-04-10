import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    business: "Boutique Fitness Studio",
    highlight: "Brand Photography & Web Page",
    quote: "Colonna Media completely transformed how our studio looks online. Our new photos and landing page generated more leads in one month than the previous six combined.",
  },
  {
    name: "James T.",
    business: "Real Estate Professional",
    highlight: "Content Creation & SEO",
    quote: "Within weeks of working with Colonna, my listings were getting significantly more views. The content they created positions me as the go-to agent in my market.",
  },
  {
    name: "Maria L.",
    business: "Local Restaurant Owner",
    highlight: "Customer Journey Strategy",
    quote: "They mapped out exactly where we were losing customers and fixed it. Our reservation rate increased by over 40% after implementing their strategy.",
  },
  {
    name: "Derek K.",
    business: "Home Services Business",
    highlight: "Lead Generation & Ad Campaigns",
    quote: "I went from barely any online leads to being fully booked two weeks out. The ads and lead strategy they built for me paid for itself in the first week.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Client Stories</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
            Real Results from <span className="italic font-light">Real Clients</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border p-8 flex flex-col gap-5"
            >
              <Quote className="w-6 h-6 text-primary/40" />
              <p className="text-base text-foreground leading-relaxed font-light italic flex-1">
                "{t.quote}"
              </p>
              <div className="border-t border-border pt-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.business}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1">
                  {t.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}