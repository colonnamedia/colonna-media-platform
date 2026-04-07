import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span className="font-display text-2xl font-semibold">Colonna</span>
              <span className="font-display text-2xl font-light italic opacity-70"> Media</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed">
              Creative media, smart strategy, and conversion-focused digital growth. Based in Pittsburgh, PA.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-6 text-background/40">Services</h4>
            <div className="flex flex-col gap-3">
              {["Photography", "Content Creation", "Consulting", "Lead-Gen Web Pages", "SEO", "Ad Campaigns"].map((s) => (
                <Link key={s} to="/services" className="text-sm text-background/60 hover:text-background transition-colors">{s}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-6 text-background/40">Company</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "About", path: "/about" },
                { label: "Portfolio", path: "/portfolio" },
                { label: "Clients", path: "/clients" },
                { label: "Bookings", path: "/bookings" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-sm text-background/60 hover:text-background transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-6 text-background/40">Get in Touch</h4>
            <div className="flex flex-col gap-4">
              <a href="mailto:Colonnamedia@gmail.com" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors">
                <Mail className="w-4 h-4" /> Colonnamedia@gmail.com
              </a>
              <div className="flex items-center gap-2 text-sm text-background/60">
                <MapPin className="w-4 h-4" /> Pittsburgh, PA
              </div>
              <Link to="/contact" className="inline-flex items-center gap-1 text-sm font-medium text-background hover:text-primary transition-colors mt-2">
                Start a Project <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/40">&copy; {new Date().getFullYear()} Colonna Media LLC. All rights reserved.</p>
          <p className="text-xs text-background/40">Creative Media &middot; Strategy &middot; Lead Generation</p>
        </div>
      </div>
    </footer>
  );
}