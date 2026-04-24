import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Lightbulb, TrendingUp, ArrowDown } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";
import ProjectsSection from "../components/about/ProjectsSection";

const scrollToCalendly = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};

const TEAM_IMAGE = "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/2e5689bf7_IMG_5011.jpg";
const FOUNDER_IMAGE = "https://media.base44.com/images/public/69d4f3aa11b90aa126fe1431/bee9e92dd_PittsburghPunch-PGH-ColonnaMedia1of1-5.jpg";"https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/2e5689bf7_IMG_5011.jpg";
const STREET_IMAGE = "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/20719a314_IMG_3614.jpg";

const pillars = [
  { icon: Eye, title: "Why Good Content Alone Is Not Enough", desc: "Great visuals grab attention — but without a strategy behind them, they don't convert. We bridge the gap between creative and commercial." },
  { icon: Target, title: "Why Strategy Matters", desc: "Knowing your customer journey, optimizing your touchpoints, and aligning your messaging to your offer is what turns followers into clients." },
  { icon: Lightbulb, title: "Creative Meets Conversion", desc: "We treat every photo, every page, and every campaign as a piece of a larger growth system. Nothing is decoration — everything is intentional." },
  { icon: TrendingUp, title: "What We Actually Help With", desc: "Photography. Content. Web pages that convert. SEO that gets you found. Ad campaigns that drive inquiries. Strategy that ties it all together." },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">About Us</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              We Help Businesses <span className="italic font-light">Stand Out</span> and <span className="italic font-light">Convert</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg leading-relaxed mb-8">
              Colonna Media is a Pittsburgh-based media and technology company that helps businesses and personal brands stand out with strategic content and stronger digital systems.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={scrollToCalendly}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Book a Free Consultation <ArrowDown className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={FOUNDER_IMAGE} alt="Anthony Colonna — Founder, Colonna Media" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 hidden lg:block">
                <p className="font-display text-sm font-semibold">Anthony Colonna</p>
                <p className="text-xs opacity-80">Founder & Creative Director</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">The Story</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-6">
              Built on Creativity. <span className="italic font-light">Driven by Results.</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Anthony Colonna is a Pittsburgh-based photographer, strategist, and builder. What started with a camera and a passion for capturing real moments evolved into something much bigger — a full-service creative and growth company that helps businesses stand out and convert.</p>
              <p>Anthony's background spans professional photography, brand strategy, digital marketing, and software development. He doesn't just create content — he builds systems. From brand photo shoots and lead-generating web pages to custom apps and AI-powered tools, he approaches every project with the same mindset: what actually moves the needle?</p>
              <p>He's worked with boxing gyms, fitness studios, restaurants, real estate professionals, and service businesses across Pittsburgh and beyond. He's also launched several personal projects — including a sports card market platform, a boxing lesson app, and a suite of AI-powered marketing tools — all built to solve real problems he saw in the market.</p>
              <p>Colonna Media is the umbrella for it all — photography, content, consulting, web pages, ad strategy, SEO, and the growing ecosystem of tools built to support business owners who want real growth, not just good-looking content.</p>
            </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader eyebrow="Our Philosophy" title="Why We Do Things Differently" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border border-border p-8 hover:border-primary/20 hover:shadow-lg transition-all duration-500"
              >
                <item.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={scrollToCalendly}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Book a Free Consultation <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <ProjectsSection />

      {/* Calendly Booking Section */}
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
          <CalendlyEmbed />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-foreground text-background text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">Ready to Get Started?</h2>
          <p className="text-background/60 text-lg mb-8">Scroll up and grab a time on the calendar — or reach out directly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToCalendly}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Book a Consultation <ArrowDown className="w-4 h-4" />
            </button>
            <a
              href="mailto:colonnamedia@gmail.com"
              className="inline-flex items-center justify-center gap-2 border border-background/30 text-background px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-background/10 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function CalendlyEmbed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&hide_gdpr_banner=1"
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}