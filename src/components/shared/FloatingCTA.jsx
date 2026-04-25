import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const scrollToBooking = () => {
  if (window.location.pathname === "/") {
    document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.href = "/#book-consultation";
  }
};

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={scrollToBooking}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider shadow-lg hover:bg-blue-400 transition-colors"
          >
            Book a Free Call <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}