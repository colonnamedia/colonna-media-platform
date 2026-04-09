import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MapPin, ArrowRight, CheckCircle } from "lucide-react";

const serviceOptions = [
  { value: "photography", label: "Photography" },
  { value: "content_creation", label: "Content Creation" },
  { value: "consulting", label: "Consulting" },
  { value: "customer_journey", label: "Customer Journey Strategy" },
  { value: "web_pages", label: "Lead-Generating Web Pages" },
  { value: "seo", label: "SEO" },
  { value: "ad_campaigns", label: "Ad Campaigns" },
  { value: "lead_generation", label: "Lead Generation Strategy" },
  { value: "other", label: "Other / Not Sure" },
];

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    business_name: "",
    service_needed: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.ContactInquiry.create(form);
    await base44.integrations.Core.SendEmail({
      to: "colonnamedia@gmail.com",
      subject: `New Contact Inquiry — ${form.name}`,
      body: `<h2>New Contact Inquiry</h2><p><strong>Name:</strong> ${form.name}</p><p><strong>Email:</strong> ${form.email}</p><p><strong>Business:</strong> ${form.business_name || "Not provided"}</p><p><strong>Service:</strong> ${form.service_needed || "Not specified"}</p><hr/><p><strong>Message:</strong><br/>${form.message || "No message provided."}</p>`,
    });
    setLoading(false);
    setSubmitted(true);
    toast({ title: "Inquiry sent!", description: "We'll be in touch soon." });
  };

  return (
    <div>
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Contact</p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
                Let's Start <span className="italic font-light">Something</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Whether you're ready to book a session, explore consulting, or just want to talk about your business — we'd love to hear from you.
              </p>

              <div className="space-y-6">
                <a href="mailto:Colonnamedia@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Colonnamedia@gmail.com</span>
                </a>
                <div className="flex items-center gap-3 text-foreground">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Pittsburgh, PA</span>
                </div>
              </div>
            </motion.div>

            {/* Right — Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              {submitted ? (
                <div className="bg-card border border-border p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">We received your inquiry and will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card border border-border p-8 md:p-10 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Your business name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Needed</Label>
                    <Select value={form.service_needed} onValueChange={(v) => setForm({ ...form, service_needed: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Project Details</Label>
                    <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project, goals, or questions..." className="min-h-[120px]" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Inquiry"} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}