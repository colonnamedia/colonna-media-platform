import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";
import CTABanner from "../components/shared/CTABanner";

const categories = ["All", "Branding", "Portraits", "Business", "Campaign", "Studio", "On-Location"];

const photos = [
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8ca9b37_IMG_3608.jpg", title: "Cardello Lighting Team", cat: "Business" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/7ef16c686_IMG_3612.jpg", cat: "Business", title: "Team Collaboration" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8e06267_IMG_3613.jpg", cat: "Portraits", title: "Professional Portrait" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/20719a314_IMG_3614.jpg", cat: "On-Location", title: "Street Style" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6b1d7fc65_IMG_3616.jpg", cat: "Business", title: "Client Session" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/71a6673c8_IMG_3657.jpg", cat: "Portraits", title: "Book Club Feature" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/68e52102f_IMG_3658.jpg", cat: "Campaign", title: "Music Performance" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/c74afedb5_IMG_3660.jpg", cat: "Studio", title: "Fashion Editorial" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/f875a32dc_IMG_3663.jpg", cat: "Studio", title: "Studio Portrait" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/9093b13b1_IMG_3664.jpg", cat: "Campaign", title: "Book Feature" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6fa25dcb7_IMG_3665.jpg", cat: "Portraits", title: "Joyful Portrait" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/1fdb0aa6c_IMG_3677.jpg", cat: "On-Location", title: "Retail Session" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6f78c5fc4_IMG_5020.JPG", cat: "On-Location", title: "Café Portrait" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/1878d50f9_IMG_3673.png", cat: "Branding", title: "Nemacolin Brand" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/aa9b81bbd_IMG_3674.png", cat: "Branding", title: "Cardello Brand" },
  { src: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/26d2d043d_IMG_3675.png", cat: "Campaign", title: "Lucid Juice Campaign" },
];

export default function Portfolio() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? photos : photos.filter((p) => p.cat === active);

  return (
    <div>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader
            eyebrow="Portfolio"
            title="Our Work Speaks for Itself"
            subtitle="A selection of photography, branding, and content work across industries and styles."
          />

          {/* Behance link */}
          <div className="flex justify-center mb-8">
            <a
              href="https://www.behance.net/colonnamedia/projects"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1769ff] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#0052cc] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Portfolio on Behance
            </a>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                  active === cat
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((photo) => (
                <motion.div
                  key={photo.src}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden break-inside-avoid"
                >
                  <img src={photo.src} alt={photo.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[10px] uppercase tracking-wider text-white/60">{photo.cat}</span>
                    <h3 className="text-sm font-semibold text-white">{photo.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <CTABanner
        headline="Like What You See?"
        subtitle="Let's create something incredible for your brand."
        ctaText="Book a Shoot"
        ctaLink="/bookings"
      />
    </div>
  );
}