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

      {/* Team collaboration image strip */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        <img
          src="https://media.base44.com/images/public/69d4f3aa11b90aa126fe1431/3fb85829c_generated_image.png"
          alt="Small business team collaborating"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

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