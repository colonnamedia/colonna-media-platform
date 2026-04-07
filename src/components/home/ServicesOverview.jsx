import React from "react";
import { Camera, Palette, Users, Route, Globe, Search, Megaphone, Target } from "lucide-react";
import SectionHeader from "../shared/SectionHeader";
import ServiceCard from "../shared/ServiceCard";

const services = [
  { icon: Camera, title: "Photography", description: "Brand photography, portraits, headshots, studio and on-location sessions designed to elevate your visual identity." },
  { icon: Palette, title: "Content Creation", description: "Branded visual content, social media assets, and campaign materials that tell your story with clarity." },
  { icon: Users, title: "Consulting", description: "Business and marketing consulting to sharpen your positioning, clarify your offers, and accelerate growth." },
  { icon: Route, title: "Customer Journey Strategy", description: "Audit and optimize how leads move through your business — from first impression to conversion." },
  { icon: Globe, title: "Lead-Gen Web Pages", description: "High-converting landing pages, offer pages, and service pages designed to turn visitors into inquiries." },
  { icon: Search, title: "SEO", description: "Local SEO, on-page optimization, and content visibility strategy to make sure the right people find you." },
  { icon: Megaphone, title: "Ad Campaigns", description: "Conversion-focused ad messaging, creative direction, and funnel strategy that drives measurable results." },
  { icon: Target, title: "Lead Generation", description: "End-to-end lead generation strategy — from offer positioning and messaging to conversion pathways." },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader
          eyebrow="What We Do"
          title="Services Built for Growth"
          subtitle="Every service is designed to help your business look better, communicate better, and convert better."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.title} {...service} delay={i} link="/services" />
          ))}
        </div>
      </div>
    </section>
  );
}