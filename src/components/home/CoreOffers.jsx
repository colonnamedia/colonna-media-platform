import React from "react";
import { Link } from "react-router-dom";
import { Camera, Brain, Megaphone, Globe, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const offers = [
  {
    icon: Camera,
    title: "Photography & Videography",
    description: "Build better visuals for your business, brand, campaigns, and online presence. First impressions drive decisions — make yours count.",
    cta: "Explore",
    link: "/photography",
    iconBg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "Consulting & Strategy",
    description: "Clarify your offer, customer journey, messaging, and growth direction. Strategy that ties creative work directly to business results.",
    cta: "Learn More",
    link: "/strategy",
    iconBg: "bg-secondary",
  },
  {
    icon: Megaphone,
    title: "Ad Campaign Builds",
    description: "Conversion-focused ad creative and campaign setup for Meta and Google — built to bring in real local leads.",
    cta: "Start Here",
    link: "/services",
    iconBg: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Local Website Builds",
    description: "Fast, conversion-focused websites for local businesses — built to look great and turn visitors into inquiries.",
    cta: "View Services",
    link: "/services",
    iconBg: "bg-secondary",
  },
  {
    icon: CalendarDays,
    title: "Book a Free Consultation",
    description: "Not sure where to start? Jump on a free strategy call and we'll figure out the best path forward for your business.",
    cta: "Book Now",
    link: "/bookings",
    isBooking: true,
    iconBg: "bg-primary/10",
  },
];

export default function CoreOffers() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, i) => {
            const Icon = offer.icon;
            const content = (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-8 h-full flex flex-col hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${offer.iconBg} flex items-center justify-center mb-5`}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{offer.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{offer.description}</p>
                <span className="mt-5 text-sm font-medium text-primary">{offer.cta} →</span>
              </motion.div>
            );
            return (
              <Link key={offer.title} to={offer.link}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
