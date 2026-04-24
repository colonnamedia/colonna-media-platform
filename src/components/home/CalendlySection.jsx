import React, { useEffect } from "react";

export default function CalendlySection() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <section id="book-consultation" className="py-24 lg:py-32 bg-secondary/50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Free Consultation</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4">
            Book a Strategy Call
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pick a time that works for you. We'll talk through your business, your goals, and what it would take to grow.
          </p>
        </div>
        <div
          className="calendly-inline-widget"
          data-url="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&hide_gdpr_banner=1"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    </section>
  );
}