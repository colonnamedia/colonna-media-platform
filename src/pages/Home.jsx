import React from "react";
import HeroSection from "../components/home/HeroSection";
import BrandIntro from "../components/home/BrandIntro";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyColonna from "../components/home/WhyColonna";
import FeaturedWork from "../components/home/FeaturedWork";
import ClientsStrip from "../components/home/ClientsStrip";
import Testimonials from "../components/home/Testimonials";
import CoreOffers from "../components/home/CoreOffers";
import ToolsSection from "../components/home/ToolsSection";
import FloatingCTA from "../components/shared/FloatingCTA";
import CalendlySection from "../components/home/CalendlySection";

const scrollToBooking = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};

export default function Home() {
  return (
    <div>
      <HeroSection />
      <BrandIntro />
      <CoreOffers />
      <CalendlySection />
      <ClientsStrip />
      <ServicesOverview />
      <WhyColonna />
      <FeaturedWork />
      <ToolsSection />
      <Testimonials />
      <FloatingCTA />


    </div>
  );
}