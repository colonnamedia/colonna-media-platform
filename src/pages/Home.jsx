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

      {/* Team collaboration image with title */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">How We Work</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              Built Around <span className="italic font-light">Your Business</span>
            </h2>
          </div>
          <div className="relative w-full h-72 md:h-[480px] overflow-hidden">
            <img
              src="https://media.base44.com/images/public/69d4f3aa11b90aa126fe1431/3fb85829c_generated_image.png"
              alt="Small business team collaborating"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
        </div>
      </section>

      <FeaturedWork />
      <ToolsSection />
      <Testimonials />
      <FloatingCTA />


    </div>
  );
}