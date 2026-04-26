import React from "react";
import { Link } from "react-router-dom";
import { Camera, Brain, Globe, Wrench, ArrowRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const scrollToBooking = () => {
  document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
};

const offers = [
{
  icon: Camera,
  title: "Photography & Content",
  description:
  "Build better visuals for your business, brand, campaigns, and online presence. First impressions drive decisions — make yours count.",
  cta: "Explore",
  link: "/photography",
  accent: "bg-amber-50 border-amber-200",
  iconBg: "bg-amber-100"
},
{
  icon: Brain,
  title: "Consulting & Strategy",
  description:
  "Clarify your offer, customer journey, messaging, and growth direction. Strategy that ties creative work directly to business results.",
  cta: "Learn More",
  link: "/strategy",
  accent: "bg-stone-50 border-stone-200",
  iconBg: "bg-stone-100"
},
{
  icon: Globe,
  title: "Lead-Generating Pages",
  description:
  "Launch focused web pages designed to turn visitors into leads — built for conversion, not just aesthetics.",
  cta: "Start Here",
  link: "/services",
  accent: "bg-amber-50 border-amber-200",
  iconBg: "bg-amber-100"
},
{
  icon: Wrench,
  title: "Tools & Growth Systems",
  description:
  "Explore the specialized tools, business systems, and supporting platforms connected to Colonna Media.",
  cta: "View Tools",
  link: "#tools",
  accent: "bg-stone-50 border-stone-200",
  iconBg: "bg-stone-100"
},
{
  icon: CalendarDays,
  title: "Book a Free Consultation",
  description:
  "Not sure where to start? Jump on a free strategy call and we'll figure out the best path forward for your business.",
  cta: "Book Now",
  link: "#book",
  isBooking: true,
  accent: "bg-primary/5 border-primary/20",
  iconBg: "bg-primary/10"
}];


export default function CoreOffers() {
  return (
    <section className="bg-background lg:py-12 hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">



      </div>
    </section>);

}