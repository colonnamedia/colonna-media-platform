import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, Palette, Users, Route, Globe, Search, Megaphone, Target, ArrowRight } from "lucide-react";
import CTABanner from "../components/shared/CTABanner";

const services = [
  {
    icon: Camera,
    title: "Photography",
    desc: "Professional brand photography that captures the essence of your business and elevates your visual presence.",
    items: ["Brand Photography", "Portraits & Headshots", "Studio Sessions", "On-Location Shoots", "Business Photography", "Content-Day Photography"],
    link: "/photography",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/f875a32dc_IMG_3663.jpg",
  },
  {
    icon: Palette,
    title: "Content Creation",
    desc: "Strategic content that tells your story, engages your audience, and supports your campaigns.",
    items: ["Branded Visual Content", "Social Media Assets", "Short-Form Content", "Campaign Materials", "Content Planning"],
    link: "/content-creation",
    externalLink: "https://fire-works-content-ai.base44.app",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6fa25dcb7_IMG_3665.jpg",
  },
  {
    icon: Users,
    title: "Consulting",
    desc: "Business and marketing consulting to sharpen your positioning and accelerate measurable growth.",
    items: ["Business Consulting", "Marketing Consulting", "Brand Positioning", "Growth Strategy", "Offer Strategy"],
    link: "/strategy",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/7ef16c686_IMG_3612.jpg",
  },
  {
    icon: Route,
    title: "Customer Journey Strategy",
    desc: "Audit and optimize how leads move through your business — from first touchpoint to conversion.",
    items: ["Lead Flow Audits", "Conversion Point Optimization", "Messaging Clarity", "Digital Touchpoint Mapping"],
    link: "/strategy",
    externalLink: "https://marketing-blueprint-build.base44.app/",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8ca9b37_IMG_3608.jpg",
  },
  {
    icon: Globe,
    title: "Lead-Generating Web Pages",
    desc: "High-converting landing pages and service pages designed to turn visitors into real inquiries.",
    items: ["Landing Pages", "Offer Pages", "Campaign Pages", "Lead Form Pages", "Service Business Web Pages"],
    link: "/contact",
    externalLink: "https://papaya-launch-site-flow.base44.app",
    img: null,
  },
  {
    icon: Search,
    title: "SEO",
    desc: "Local SEO support and visibility strategy to make sure the right people find your business.",
    items: ["Local SEO", "Website Visibility", "On-Page Optimization", "Content Strategy", "Lead Visibility"],
    link: "/contact",
    externalLink: "https://seo-auditor-pro-copy-7436d8be.base44.app",
    img: null,
  },
  {
    icon: Megaphone,
    title: "Ad Campaign Strategy",
    desc: "Conversion-focused ad strategy — from messaging and creative direction to landing page alignment.",
    items: ["Ad Messaging", "Campaign Structure", "Creative Direction", "Landing Page Alignment", "Funnel Strategy"],
    link: "/contact",
    img: null,
  },
  {
    icon: Target,
    title: "Lead Generation Strategy",
    desc: "End-to-end systems for attracting inquiries — offer positioning, messaging, and conversion pathways.",
    items: ["Inquiry Attraction", "Offer Positioning", "Messaging Strategy", "Conversion Pathways", "Ads + Pages + Follow-Up"],
    link: "/contact",
    img: null,
  },
];

export default function Services() {
  return (
    <div>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Our Services</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Everything You Need to <span className="italic font-light">Look Better</span> and <span className="italic font-light">Convert Better</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg">
              From photography to lead generation — every service is designed with one goal: real business growth.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 ${service.img ? "lg:grid-cols-2" : ""} gap-12 items-center`}
              >
                {service.img && i % 2 === 0 && (
                  <div className="aspect-[4/3] overflow-hidden hidden lg:block">
                    <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={service.img ? "" : "lg:max-w-2xl"}>
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link to={service.link} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors">
                      Ask About This Service <ArrowRight className="w-4 h-4" />
                    </Link>
                    {service.externalLink && (
                      <a href={service.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-primary/10 transition-colors">
                        Try It <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                {service.img && i % 2 !== 0 && (
                  <div className="aspect-[4/3] overflow-hidden hidden lg:block">
                    <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        headline="Not Sure Where to Start?"
        subtitle="Book a free consultation and we'll help you figure out exactly what your business needs."
        ctaText="Book a Call"
        ctaLink="/bookings"
      />
    </div>
  );
}