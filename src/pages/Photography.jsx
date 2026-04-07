import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CTABanner from "../components/shared/CTABanner";

const photos = [
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8e06267_IMG_3613.jpg",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/f875a32dc_IMG_3663.jpg",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6fa25dcb7_IMG_3665.jpg",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/c74afedb5_IMG_3660.jpg",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/20719a314_IMG_3614.jpg",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/1fdb0aa6c_IMG_3677.jpg",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6f78c5fc4_IMG_5020.JPG",
  "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/71a6673c8_IMG_3657.jpg",
];

const offerings = [
  { title: "Brand Photography", desc: "Visual storytelling for your business identity." },
  { title: "Headshots & Portraits", desc: "Professional images for your team and personal brand." },
  { title: "Studio Sessions", desc: "Controlled lighting and backdrop for polished results." },
  { title: "On-Location Shoots", desc: "Real-world settings that bring authenticity to your visuals." },
  { title: "Business Photography", desc: "Product, space, and workplace imagery that builds trust." },
  { title: "Content-Day Photography", desc: "Bulk content creation for months of social media and marketing." },
];

export default function Photography() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Photography</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Images That Tell Your <span className="italic font-light">Story</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg leading-relaxed">
              From studio portraits to on-location brand shoots — we create photography that elevates your business and makes your audience take notice.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {photos.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden break-inside-avoid"
              >
                <img src={src} alt="Colonna Media photography" className="w-full object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-24 lg:py-32 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">What We Offer</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">Photography for Every Business Need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-500"
              >
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/bookings" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors">
              Book a Shoot <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTABanner
        headline="Ready for Photos That Actually Work?"
        subtitle="Let's create visuals that build trust, tell your story, and drive your business forward."
        ctaText="Book a Shoot"
        ctaLink="/bookings"
      />
    </div>
  );
}