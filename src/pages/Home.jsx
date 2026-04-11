import React from "react";
import HeroSection from "../components/home/HeroSection";
import BrandIntro from "../components/home/BrandIntro";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyColonna from "../components/home/WhyColonna";
import FeaturedWork from "../components/home/FeaturedWork";
import CTABanner from "../components/shared/CTABanner";
import ClientsStrip from "../components/home/ClientsStrip";
import Testimonials from "../components/home/Testimonials";
import CoreOffers from "../components/home/CoreOffers";
import ToolsSection from "../components/home/ToolsSection";
import FloatingCTA from "../components/shared/FloatingCTA";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <BrandIntro />
      <CoreOffers />
      <ClientsStrip />
      <ServicesOverview />
      <WhyColonna />
      <FeaturedWork />
      <ToolsSection />
      <Testimonials />
      <FloatingCTA />
      <CTABanner
        headline="Ready to Build Something Better?"
        subtitle="Whether you need visuals, strategy, a campaign page, or a smarter customer journey — Colonna Media brings the full picture together."
        ctaText="Book a Consultation"
        ctaLink="/bookings"
        secondaryCta="Contact Us"
        secondaryLink="/contact"
      />
    </div>
  );
}