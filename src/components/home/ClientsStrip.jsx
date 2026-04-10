import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const clientNames = [
  "Cardello Lighting & Electric",
  "Nemacolin",
  "Jenni G Jewelry",
  "Justin Fabus",
  "Overthrow New York",
  "Lucid Juice",
  "Burgh Book Buddies",
  "Revitalize, or Die.",
];

const highlights = [
  { stat: "8+", label: "Brands Served" },
  { stat: "3", label: "Industries" },
  { stat: "100%", label: "Pittsburgh Proud" },
];

export default function ClientsStrip() {
  return (
    <section className="py-20 border-y border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Trusted By</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold leading-snug">
              Brands That Chose to <span className="italic font-light">Grow Differently</span>
            </h2>
            <Link
              to="/clients"
              className="inline-flex items-center gap-2 mt-6 text-sm font-medium uppercase tracking-wider text-primary hover:gap-3 transition-all"
            >
              See All Clients <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
            {clientNames.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card px-5 py-4 flex items-center justify-center text-center"
              >
                <span className="text-sm font-medium text-foreground/70 leading-snug">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-10 max-w-sm">
          {highlights.map((h) => (
            <div key={h.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-primary">{h.stat}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{h.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}