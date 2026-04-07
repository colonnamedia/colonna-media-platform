import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../shared/SectionHeader";

const featured = [
  { img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8ca9b37_IMG_3608.jpg", title: "Cardello Lighting", tag: "Branding" },
  { img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/68e52102f_IMG_3658.jpg", title: "Violin Performance", tag: "Event" },
  { img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/f875a32dc_IMG_3663.jpg", title: "Studio Portrait", tag: "Portrait" },
  { img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/9093b13b1_IMG_3664.jpg", title: "Book Club Campaign", tag: "Content" },
];

export default function FeaturedWork() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Featured Work</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              See Our <span className="italic font-light">Impact</span>
            </h2>
          </div>
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all mt-4 md:mt-0">
            View Full Portfolio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/3] overflow-hidden cursor-pointer"
            >
              <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-xs uppercase tracking-wider text-white/70">{item.tag}</span>
                <h3 className="font-display text-xl font-semibold text-white mt-1">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}