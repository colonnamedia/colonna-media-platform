import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ServiceCard({ icon: Icon, title, description, link = "/contact", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.08 }}
      className="group bg-card border border-border p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-500"
    >
      {Icon && (
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{description}</p>
      <Link
        to={link}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
      >
        Learn More <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}