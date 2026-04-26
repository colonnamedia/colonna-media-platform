import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const projects = [
{
  name: "Cuz Cards — Card Market Index",
  role: "Founder & Developer",
  description:
  "A sports card market intelligence platform that tracks pricing trends, market data, and collectible card valuations. Built to give collectors and investors a smarter edge in the hobby.",
  link: "https://card-market-index.com",
  linkLabel: "card-market-index.com",
  tag: "Personal Project",
  img: "https://media.base44.com/images/public/69d4f3aa11b90aa126fe1431/fb11ea752_030FC343-F51F-4B3D-A7D8-3400C1854B51.png"
},
{
  name: "Apex Boxing Lesson App",
  role: "Founder & Developer",
  description:
  "A web app designed to teach boxing fundamentals — built for students learning the basics and coaches looking for a structured way to teach technique. Covers stance, footwork, combinations, and coaching cues in a clean, accessible format.",
  tag: "In Development",
  img: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&q=80"
},
{
  name: "Punch Gym — Pittsburgh Punch",
  role: "Creative Director & Strategist",
  description:
  "Full brand photography, content strategy, and digital growth support for Pittsburgh Punch, one of Pittsburgh's premier boxing gyms. Covered visual identity, social content, and lead generation.",
  tag: "Client Project",
  img: "https://media.base44.com/images/public/69d4f3aa11b90aa126fe1431/bee9e92dd_PittsburghPunch-PGH-ColonnaMedia1of1-5.jpg"
},
{
  name: "Fire Works — Content AI",
  role: "Developer & Product Lead",
  description:
  "An AI-powered content creation tool that generates on-brand social media content, campaign copy, and web page text. Built as part of the Colonna Media ecosystem to help businesses scale their content output.",
  link: "https://fire-works-content-ai.base44.app",
  linkLabel: "fire-works-content-ai.base44.app",
  tag: "Personal Project",
  img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80"
},
{
  name: "Marketing Blueprint Builder",
  role: "Developer & Product Lead",
  description:
  "A strategic planning tool that guides business owners through mapping their customer journey, identifying conversion gaps, and building a clear path from awareness to booked client.",
  link: "https://marketing-blueprint-build.base44.app",
  linkLabel: "marketing-blueprint-build.base44.app",
  tag: "Personal Project",
  img: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800&q=80"
},
{
  name: "Lead-Generating Website Builder",
  role: "Developer & Product Lead",
  description:
  "A focused web page builder designed specifically for service businesses. Helps owners launch high-converting landing pages and service pages without needing a developer.",
  link: "https://papaya-launch-site-flow.base44.app",
  linkLabel: "papaya-launch-site-flow.base44.app",
  tag: "Personal Project",
  img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80"
}];


const tagColors = {
  "Personal Project": "bg-blue-100 text-blue-700",
  "Client Project": "bg-violet-100 text-violet-700",
  "In Development": "bg-amber-100 text-amber-700"
};

export default function ProjectsSection() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Work & Projects</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight max-w-2xl">
            Things Built, <span className="italic font-light">Launched & Led</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            A mix of client work, personal projects, and tools built to solve real problems — from boxing gyms to card markets to AI content platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) =>
          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="group bg-card border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden">
            
              {/* Image */}
              <div className="aspect-video overflow-hidden">
                <img
                src={project.img}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              </div>

              <div className="p-6 flex flex-col flex-1">
                {/* Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 ${tagColors[project.tag]}`}>
                    {project.tag}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-display text-xl font-semibold mb-1 group-hover:text-primary transition-colors leading-snug">
                  {project.name}
                </h3>

                {/* Role */}
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">{project.role}</p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{project.description}</p>

                {/* Link */}
                {project.link &&
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
                
                    <ExternalLink className="w-3.5 h-3.5" />
                    {project.linkLabel}
                  </a>
              }
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}