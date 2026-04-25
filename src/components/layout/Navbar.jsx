import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import ColonnaLogo from "../shared/ColonnaLogo";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Clients", path: "/clients" },
  { label: "Contact", path: "/contact" },
];

const toolsDropdown = [
  { label: "Website Builder", desc: "Lead-generating web pages", href: "https://papaya-launch-site-flow.base44.app" },
  { label: "SEO Auditor", desc: "Local SEO visibility strategy", href: "https://seo-auditor-pro-copy-7436d8be.base44.app" },
  { label: "Content Creation", desc: "AI-powered content generator", href: "https://fire-works-content-ai.base44.app" },
  { label: "Customer Journey", desc: "Map & optimize your marketing blueprint", href: "https://marketing-blueprint-build.base44.app" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/">
            <ColonnaLogo light={scrolled ? false : true} />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-[#E11D48] ${location.pathname === link.path ? "text-[#E11D48]" : scrolled ? "text-black/80" : "text-white/90"}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors hover:text-[#E11D48] ${scrolled ? "text-black/80" : "text-white/90"}`}
              >
                Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-background border border-border shadow-lg z-50"
                  >
                    {toolsDropdown.map((tool) => (
                      <a
                        key={tool.label}
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setToolsOpen(false)}
                        className="flex items-start justify-between gap-2 px-5 py-4 hover:bg-secondary transition-colors group border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            <Link
              to="/bookings"
              className="bg-[#E11D48] text-white px-6 py-2.5 text-sm font-medium tracking-wide uppercase hover:bg-[#be1a3d] transition-colors"
            >
              Book a Call
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className={`lg:hidden transition-colors ${scrolled ? "text-black" : "text-white"}`}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background backdrop-blur-md border-t border-border overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium tracking-wide transition-colors ${location.pathname === link.path ? "text-primary" : "text-foreground/70"}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Tools</p>
                {toolsDropdown.map((tool) => (
                  <a
                    key={tool.label}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2.5 text-base font-medium text-foreground/70 hover:text-primary transition-colors"
                  >
                    {tool.label} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <Link
                to="/bookings"
                className="bg-primary text-primary-foreground px-6 py-3 text-sm font-medium tracking-wide uppercase text-center hover:bg-primary/90 transition-colors mt-2"
              >
                Book a Call
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}