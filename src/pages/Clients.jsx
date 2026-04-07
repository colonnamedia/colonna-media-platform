import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";
import CTABanner from "../components/shared/CTABanner";

const clients = [
  {
    name: "Cardello Lighting & Electric Supply",
    tags: ["Photography", "Branding", "Business"],
    desc: "Brand photography and visual content for a premier lighting showroom — capturing products, people, and the showroom experience.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/aa9b81bbd_IMG_3674.png",
  },
  {
    name: "Nemacolin",
    tags: ["Photography", "Campaign"],
    desc: "Event and lifestyle photography for one of Pennsylvania's most iconic luxury resort destinations.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/1878d50f9_IMG_3673.png",
  },
  {
    name: "Jenni G Jewelry",
    tags: ["Branding", "Content"],
    desc: "Brand photography and content creation for a growing jewelry brand — authentic, joyful, and on-brand.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/535ff1389_IMG_3667.png",
  },
  {
    name: "Justin Fabus",
    tags: ["Photography", "Campaign"],
    desc: "Action and lifestyle photography for a fitness professional — energy, movement, and personality.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/86e44a60c_IMG_3678.png",
  },
  {
    name: "Overthrow New York",
    tags: ["Photography", "Branding"],
    desc: "Street-style and editorial photography for New York's underground boxing gym brand.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/b702f5e94_IMG_3680.png",
  },
  {
    name: "Lucid Juice",
    tags: ["Branding", "Campaign", "Content"],
    desc: "Visual identity and campaign content for an emerging juice and wellness brand.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/26d2d043d_IMG_3675.png",
  },
  {
    name: "Burgh Book Buddies",
    tags: ["Content", "Photography"],
    desc: "Creative portrait and branded content for a Pittsburgh-based book community.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/0c8d64c6c_IMG_3672.png",
  },
  {
    name: "Revitalize, or Die.",
    tags: ["Branding", "Strategy"],
    desc: "Brand photography and visual direction for a creative consulting and revitalization brand.",
    img: "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/56733b31f_IMG_3671.png",
  },
];

export default function Clients() {
  return (
    <div>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader
            eyebrow="Clients"
            title="Brands We've Helped Grow"
            subtitle="A selection of businesses and personal brands we've partnered with on photography, content, and strategy."
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clients.map((client, i) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={client.img} alt={client.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {client.tags.map((tag) => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider font-medium text-primary bg-primary/10 px-2 py-1">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{client.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{client.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        headline="Want to Be Our Next Success Story?"
        subtitle="Let's discuss your brand, your goals, and how we can help."
        ctaText="Start a Conversation"
        secondaryCta="View Portfolio"
        secondaryLink="/portfolio"
      />
    </div>
  );
}