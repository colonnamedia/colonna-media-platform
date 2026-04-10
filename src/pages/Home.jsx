import React from "react";
import HeroSection from "../components/home/HeroSection";
import BrandIntro from "../components/home/BrandIntro";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyColonna from "../components/home/WhyColonna";
import FeaturedWork from "../components/home/FeaturedWork";
import CTABanner from "../components/shared/CTABanner";
import ClientsStrip from "../components/home/ClientsStrip";
import Testimonials from "../components/home/Testimonials";
import FloatingCTA from "../components/shared/FloatingCTA";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <BrandIntro />
      <ClientsStrip />
      <Testimonials />
      <ServicesOverview />
      <WhyColonna />
      <FeaturedWork />
      <FloatingCTA />
      <CTABanner
        headline="Ready to Grow Your Brand?"
        subtitle="From first impression to conversion — let's create media that moves people to act."
        ctaText="Start a Project"
        ctaLink="/contact"
        secondaryCta="Book a Call"
        secondaryLink="/bookings"
      />
    </div>
  );
}