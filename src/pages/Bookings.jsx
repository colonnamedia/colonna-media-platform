import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, MessageSquare, Globe, Users, Megaphone, ArrowRight } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";

const bookingOptions = [
  { icon: MessageSquare, title: "Book a Consultation", desc: "Not sure where to start? Let's talk through your business, your goals, and how we can help.", link: "/contact" },
  { icon: Camera, title: "Inquire About Photography", desc: "Ready for a photoshoot? Tell us about your vision and we'll plan the perfect session.", link: "/contact" },
  { icon: Globe, title: "Ask About a Website Project", desc: "Need a high-converting landing page or service site? Let's discuss your web goals.", link: "/contact" },
  { icon: Users, title: "Ask About Consulting", desc: "Want help with strategy, positioning, or your customer journey? We'd love to talk.", link: "/contact" },
  { icon: Megaphone, title: "Ask About Campaign Support", desc: "Looking for ad strategy, creative direction, or funnel support? Get in touch.", link: "/contact" },
];

export default function Bookings() {
  return (
    <div>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader
            eyebrow="Bookings"
            title="How Can We Help?"
            subtitle="Choose what fits your needs and we'll take it from there."
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-4">
            {bookingOptions.map((option, i) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={option.link}
                  className="group flex items-center gap-6 bg-card border border-border p-6 md:p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-500"
                >
                  <div className="w-14 h-14 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold mb-1">{option.title}</h3>
                    <p className="text-muted-foreground text-sm">{option.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Prefer Email?</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">Reach Us Directly</h2>
          <a href="mailto:Colonnamedia@gmail.com" className="text-lg text-primary hover:underline">Colonnamedia@gmail.com</a>
        </div>
      </section>
    </div>
  );
}