import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const scrollToBooking = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Geometric line decorations */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <line x1="75%" y1="5%" x2="95%" y2="18%" stroke="#333" strokeWidth="1"/>
        <line x1="82%" y1="3%" x2="98%" y2="12%" stroke="#333" strokeWidth="1"/>
        <line x1="5%" y1="78%" x2="20%" y2="95%" stroke="#333" strokeWidth="1"/>
        <line x1="3%" y1="85%" x2="14%" y2="98%" stroke="#333" strokeWidth="1"/>
        <line x1="38%" y1="88%" x2="58%" y2="98%" stroke="#333" strokeWidth="1"/>
        <line x1="44%" y1="92%" x2="62%" y2="100%" stroke="#333" strokeWidth="1"/>
        <line x1="2%" y1="8%" x2="18%" y2="22%" stroke="#2a2a2a" strokeWidth="1"/>
        <line x1="88%" y1="55%" x2="100%" y2="68%" stroke="#2a2a2a" strokeWidth="1"/>
        <line x1="92%" y1="52%" x2="100%" y2="60%" stroke="#2a2a2a" strokeWidth="1"/>
      </svg>

      {/* Red accent bar on left edge */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#E11D48]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-32 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold tracking-wide text-[#E11D48] mb-6"
          >
            Photography · Consulting · Lead Generation
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-5xl md:text-6xl lg:text-8xl font-semibold text-white leading-[1.05] mb-6"
          >
            Creative Media. Smart Strategy. Real Leads.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
          >
            Colonna Media helps businesses and professionals grow with photography, content, customer journey strategy, SEO, ad campaigns, and lead-generating web pages.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <button
              onClick={scrollToBooking}
              className="inline-flex items-center justify-center gap-2 bg-[#E11D48] text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-[#be1a3d] transition-colors"
            >
              Book a Consultation <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 text-white border-b border-white/40 pb-0.5 text-sm font-medium uppercase tracking-wider hover:border-white transition-colors py-4"
            >
              View Services
            </Link>
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