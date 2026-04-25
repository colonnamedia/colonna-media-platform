import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const scrollToBooking = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Design background — no photo */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      {/* Diagonal accent line */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" style={{ left: "58%" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-32 pb-20 lg:pt-0 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Left — copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400 mb-6"
            >
              Photography &middot; Consulting &middot; Lead Generation
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] mb-6"
            >
              Creative Media.{" "}
              <span className="italic font-light text-blue-400">Smart Strategy.</span>{" "}
              Real Leads.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
            >
              Colonna Media helps businesses and professionals grow with photography, content, customer journey strategy, SEO, ad campaigns, and lead-generating web pages.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={scrollToBooking}
                className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-blue-400 transition-colors"
              >
                Book a Free Call <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                View Services
              </Link>
            </motion.div>
          </div>

          {/* Right — abstract visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[420px] h-[420px]">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-8 rounded-full border border-blue-500/20" />
              <div className="absolute inset-16 rounded-full border border-purple-500/20" />
              {/* Center glow block */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-600/30 to-purple-700/30 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-display text-4xl font-semibold text-white">CM</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">Colonna Media</p>
                  </div>
                </div>
              </div>
              {/* Floating stat chips */}
              <div className="absolute top-6 right-0 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 text-center">
                <p className="font-display text-xl font-semibold text-blue-300">50+</p>
                <p className="text-[9px] uppercase tracking-wider text-white/40">Clients</p>
              </div>
              <div className="absolute bottom-6 left-0 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 text-center">
                <p className="font-display text-xl font-semibold text-purple-300">8+</p>
                <p className="text-[9px] uppercase tracking-wider text-white/40">Services</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  );
}