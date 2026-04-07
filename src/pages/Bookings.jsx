import React from "react";
import { motion } from "framer-motion";
import BookingCalendar from "../components/bookings/BookingCalendar";
import SectionHeader from "../components/shared/SectionHeader";

export default function Bookings() {
  return (
    <div>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader
            eyebrow="Bookings"
            title="Schedule a Consultation"
            subtitle="Pick a date and time that works for you. We'll confirm within 24 hours."
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BookingCalendar />
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-secondary/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Prefer Email?</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">Reach Us Directly</h2>
          <a href="mailto:colonnamedia@gmail.com" className="text-lg text-primary hover:underline">colonnamedia@gmail.com</a>
        </div>
      </section>
    </div>
  );
}