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
      <ClientsStrip />
      <ServicesOverview />
      <WhyColonna />
      <FeaturedWork />
      <ToolsSection />
      <Testimonials />
      <CalendlySection />
      <FloatingCTA />

      {/* Bottom CTA */}
      <section className="py-20 bg-foreground text-background text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">Ready to Build Something Better?</h2>
          <p className="text-background/60 text-lg mb-8">Whether you need visuals, strategy, a campaign page, or a smarter customer journey — let's talk.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToBooking}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Book a Free Consultation
            </button>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-background/30 text-background px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-background/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}