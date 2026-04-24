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

        <div
          className="calendly-inline-widget"
          data-url="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&hide_gdpr_banner=1"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    </section>
  );
}