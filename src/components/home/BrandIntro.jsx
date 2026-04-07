import React from "react";
import { motion } from "framer-motion";

const ABOUT_IMAGE = "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/2e5689bf7_IMG_5011.jpg";

export default function BrandIntro() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">More Than Photography</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6">
              Creative Meets <span className="italic font-light">Conversion</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Colonna Media is a media and technology company that combines high-end creative work with marketing intelligence. We don't just make things look good — we make them work.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From brand photography and content creation to customer journey strategy, lead-generating web pages, SEO, and ad campaigns — every service we offer is designed to help your business attract attention, build trust, and convert.
            </p>
            <div className="flex gap-12">
              {[
                { num: "50+", label: "Clients Served" },
                { num: "8+", label: "Services Offered" },
                { num: "100%", label: "Growth Focused" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-semibold text-primary">{stat.num}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img src={ABOUT_IMAGE} alt="Colonna Media team at work" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 hidden lg:block">
              <p className="font-display text-lg font-semibold">Pittsburgh, PA</p>
              <p className="text-sm opacity-80">Colonna Media LLC</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}