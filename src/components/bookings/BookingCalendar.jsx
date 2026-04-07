import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM",
  "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM",
];

const serviceOptions = [
  { value: "photography", label: "Photography Session" },
  { value: "content_creation", label: "Content Creation" },
  { value: "consulting", label: "Business Consulting" },
  { value: "customer_journey", label: "Customer Journey Strategy" },
  { value: "web_pages", label: "Lead-Gen Web Pages" },
  { value: "seo", label: "SEO Strategy" },
  { value: "ad_campaigns", label: "Ad Campaign Planning" },
  { value: "lead_generation", label: "Lead Generation Strategy" },
  { value: "other", label: "General Consultation" },
];

export default function BookingCalendar() {
  const [step, setStep] = useState(1); // 1: pick date, 2: pick time, 3: fill form, 4: confirmed
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    service_needed: "",
    message: "",
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dateStr = format(selectedDate, "EEEE, MMMM d, yyyy");
    const fullMessage = `📅 Requested Date: ${dateStr} at ${selectedTime}\n🗂️ Service: ${serviceOptions.find(s => s.value === form.service_needed)?.label || "Not specified"}\n\n${form.message}`;
    
    await base44.entities.ContactInquiry.create({
      name: form.name,
      email: form.email,
      business_name: form.business_name,
      service_needed: form.service_needed,
      message: fullMessage,
      status: "new",
    });

    await base44.integrations.Core.SendEmail({
      to: "colonnamedia@gmail.com",
      subject: `📅 New Booking Request — ${form.name} | ${dateStr} at ${selectedTime}`,
      body: `
<h2>New Booking Request</h2>
<p><strong>Name:</strong> ${form.name}</p>
<p><strong>Email:</strong> ${form.email}</p>
<p><strong>Phone:</strong> ${form.phone || "Not provided"}</p>
<p><strong>Business:</strong> ${form.business_name || "Not provided"}</p>
<p><strong>Service:</strong> ${serviceOptions.find(s => s.value === form.service_needed)?.label || "Not specified"}</p>
<p><strong>Requested Date:</strong> ${dateStr}</p>
<p><strong>Requested Time:</strong> ${selectedTime}</p>
<hr/>
<p><strong>Message:</strong><br/>${form.message || "No additional details provided."}</p>
      `.trim(),
    });

    setLoading(false);
    setStep(4);
  };

  return (
    <div className="bg-card border border-border p-6 md:p-10">
      {/* Step indicator */}
      {step < 4 && (
        <div className="flex items-center gap-2 mb-8">
          {["Date", "Time", "Details"].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${step > i + 1 ? "text-primary" : step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                {label}
              </div>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Calendar */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-display text-xl font-semibold mb-6">Select a Date</h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                className="rounded-none border border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">Available Monday – Friday</p>
          </motion.div>
        )}

        {/* Step 2: Time slots */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">Select a Time</h3>
              <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground underline">← Change date</button>
            </div>
            <p className="text-sm text-primary font-medium mb-4">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="flex items-center justify-center gap-1.5 border border-border p-3 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                >
                  <Clock className="w-3 h-3" />
                  {time}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">All times are Eastern Time (ET). We'll confirm your appointment within 24 hours.</p>
          </motion.div>
        )}

        {/* Step 3: Form */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">Your Details</h3>
              <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:text-foreground underline">← Change time</button>
            </div>
            <div className="bg-secondary/50 p-4 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{selectedTime} ET</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Your business" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service of Interest *</Label>
                <Select required value={form.service_needed} onValueChange={(v) => setForm({ ...form, service_needed: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tell us about your project</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What are your goals? What would you like to accomplish?" className="min-h-[100px]" />
              </div>
              <button
                type="submit"
                disabled={loading || !form.service_needed}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Booking..." : "Request Appointment"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 4: Confirmed */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <CheckCircle className="w-14 h-14 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl font-semibold mb-2">Request Sent!</h3>
            <p className="text-muted-foreground mb-4">
              We received your booking request for <strong>{selectedDate && format(selectedDate, "MMMM d")}</strong> at <strong>{selectedTime}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">We'll confirm your appointment at <strong>colonnamedia@gmail.com</strong> within 24 hours.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}