import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

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
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-24 lg:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Client Stories</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            Real Results from <span className="italic font-light">Real Clients</span>
          </h2>
        </div>

        {/* Slider */}
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border p-10 md:p-14 text-center"
            >
              <Quote className="w-8 h-8 text-primary/40 mx-auto mb-6" />
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-light italic">
                "{testimonials[current].quote}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[current].business}</p>
                <span className="inline-block mt-3 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1">
                  {testimonials[current].highlight}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-border"}`} />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}