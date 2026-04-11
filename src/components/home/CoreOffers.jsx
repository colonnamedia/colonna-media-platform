import React from "react";
import { Link } from "react-router-dom";
import { Camera, Brain, Globe, Wrench, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const offers = [
  {
    icon: Camera,
    title: "Photography & Content",
    description:
      "Build better visuals for your business, brand, campaigns, and online presence. First impressions drive decisions — make yours count.",
    cta: "Explore",
    link: "/photography",
    accent: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    icon: Brain,
    title: "Consulting & Strategy",
    description:
      "Clarify your offer, customer journey, messaging, and growth direction. Strategy that ties creative work directly to business results.",
    cta: "Learn More",
    link: "/strategy",
    accent: "bg-stone-50 border-stone-200",
    iconBg: "bg-stone-100",
  },
  {
    icon: Globe,
    title: "Lead-Generating Pages",
    description:
      "Launch focused web pages designed to turn visitors into leads — built for conversion, not just aesthetics.",
    cta: "Start Here",
    link: "/services",
    accent: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    icon: Wrench,
    title: "Tools & Growth Systems",
    description:
      "Explore the specialized tools, business systems, and supporting platforms connected to Colonna Media.",
    cta: "View Tools",
    link: "#tools",
    accent: "bg-stone-50 border-stone-200",
    iconBg: "bg-stone-100",
  },
];

export default function CoreOffers() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Where Do You Start?</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight">
            Find Your <span className="italic font-light">Starting Point</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you need visuals, strategy, a campaign page, or smarter systems — pick the path that fits where you are right now.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {offers.map((offer, i) => {
            const Icon = offer.icon;
            const isAnchor = offer.link.startsWith("#");
            const cardContent = (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`group flex flex-col border rounded-none p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${offer.accent}`}
              >
                <div className={`w-12 h-12 ${offer.iconBg} flex items-center justify-center mb-6`}>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {offer.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{offer.description}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary group-hover:gap-3 transition-all">
                  {offer.cta} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );

            return isAnchor ? (
              <a key={offer.title} href={offer.link}>{cardContent}</a>
            ) : (
              <Link key={offer.title} to={offer.link}>{cardContent}</Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}