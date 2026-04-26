import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, Palette, Users, Route, Globe, Search, Megaphone, Target, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import CTABanner from "../components/shared/CTABanner";

const services = [
{
  icon: Camera,
  title: "Photography",
  tag: "Creative",
  desc: "Professional brand photography that captures the essence of your business and elevates your visual presence.",
  items: ["Brand Photography", "Portraits & Headshots", "Studio Sessions", "On-Location Shoots", "Business Photography", "Content-Day Photography"],
  link: "/photography",
  img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/f875a32dc_IMG_3663.jpg",
  color: "from-blue-600 to-blue-800"
},
{
  icon: Palette,
  title: "Content Creation",
  tag: "Creative",
  desc: "Strategic content that tells your story, engages your audience, and supports your campaigns.",
  items: ["Branded Visual Content", "Social Media Assets", "Short-Form Content", "Campaign Materials", "Content Planning"],
  link: "/content-creation",
  externalLink: "https://fire-works-content-ai.base44.app",
  img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/6fa25dcb7_IMG_3665.jpg",
  color: "from-indigo-600 to-indigo-800"
},
{
  icon: Users,
  title: "Consulting",
  tag: "Strategy",
  desc: "Business and marketing consulting to sharpen your positioning and accelerate measurable growth.",
  items: ["Business Consulting", "Marketing Consulting", "Brand Positioning", "Growth Strategy", "Offer Strategy"],
  link: "/strategy",
  img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/7ef16c686_IMG_3612.jpg",
  color: "from-violet-600 to-violet-800"
},
{
  icon: Route,
  title: "Customer Journey Strategy",
  tag: "Strategy",
  desc: "Audit and optimize how leads move through your business — from first touchpoint to conversion.",
  items: ["Lead Flow Audits", "Conversion Point Optimization", "Messaging Clarity", "Digital Touchpoint Mapping"],
  link: "/strategy",
  externalLink: "https://marketing-blueprint-build.base44.app/",
  img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8ca9b37_IMG_3608.jpg",
  color: "from-sky-600 to-sky-800"
},
{
  icon: Globe,
  title: "Lead-Generating Web Pages",
  tag: "Growth",
  desc: "High-converting landing pages and service pages designed to turn visitors into real inquiries.",
  items: ["Landing Pages", "Offer Pages", "Campaign Pages", "Lead Form Pages", "Service Business Web Pages"],
  link: "/contact",
  externalLink: "https://papaya-launch-site-flow.base44.app",
  color: "from-blue-500 to-cyan-600"
},
{
  icon: Search,
  title: "SEO",
  tag: "Growth",
  desc: "Local SEO support and visibility strategy to make sure the right people find your business.",
  items: ["Local SEO", "Website Visibility", "On-Page Optimization", "Content Strategy", "Lead Visibility"],
  link: "/contact",
  externalLink: "https://seo-auditor-pro-copy-7436d8be.base44.app",
  color: "from-teal-600 to-teal-800"
},
{
  icon: Megaphone,
  title: "Ad Campaign Strategy",
  tag: "Growth",
  desc: "Conversion-focused ad strategy — from messaging and creative direction to landing page alignment.",
  items: ["Ad Messaging", "Campaign Structure", "Creative Direction", "Landing Page Alignment", "Funnel Strategy"],
  link: "/contact",
  color: "from-blue-700 to-indigo-700"
},
{
  icon: Target,
  title: "Lead Generation Strategy",
  tag: "Growth",
  desc: "End-to-end systems for attracting inquiries — offer positioning, messaging, and conversion pathways.",
  items: ["Inquiry Attraction", "Offer Positioning", "Messaging Strategy", "Conversion Pathways", "Ads + Pages + Follow-Up"],
  link: "/contact",
  color: "from-indigo-700 to-violet-700"
}];


const tagColors = {
  Creative: "bg-blue-100 text-blue-700",
  Strategy: "bg-violet-100 text-violet-700",
  Growth: "bg-sky-100 text-sky-700"
};

export default function Services() {
  const [activeTag, setActiveTag] = useState("All");
  const tags = ["All", "Creative", "Strategy", "Growth"];

  const filtered = activeTag === "All" ? services : services.filter((s) => s.tag === activeTag);

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-gradient-to-br from-background via-secondary/40 to-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-4">
              Our Services
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              
              Everything You Need to{" "}
              <span className="italic font-light text-primary">Look Better</span> and{" "}
              <span className="italic font-light text-primary">Convert Better</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg leading-relaxed">
              
              From photography to lead generation — every service is designed with one goal: real business growth.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {tags.map((tag) =>
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-5 py-2 text-sm font-semibold uppercase tracking-wider transition-all border ${
              activeTag === tag ?
              "bg-primary text-primary-foreground border-primary" :
              "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`
              }>
              
                {tag}
              </button>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  
                  {/* Top color bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${service.color}`} />

                  <div className="p-8">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 ${tagColors[service.tag]}`}>
                        {service.tag}
                      </span>
                    </div>

                    {/* Title + desc */}
                    <h2 className="font-display text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{service.desc}</p>

                    {/* Optional image */}
                    {service.img &&
                    <div className="aspect-video overflow-hidden mb-6 border border-border">
                        <img
                          src={service.img}
                          alt={service.title}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${service.title === "Consulting" ? "object-[center_20%]" : "object-cover"}`}
                        />
                      </div>
                    }

                    {/* Items */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                      {service.items.map((item) =>
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          {item}
                        </li>
                      )}
                    </ul>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <Link
                        to={service.link}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors">
                        
                        Ask About This <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {service.externalLink &&
                      <a
                        href={service.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-border text-foreground/70 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary transition-colors">
                        
                          Try the Tool <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      }
                    </div>
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      <CTABanner
        headline="Not Sure Where to Start?"
        subtitle="Book a free consultation and we'll help you figure out exactly what your business needs."
        ctaText="Book a Call"
        ctaLink="/bookings" />
      
    </div>);

}