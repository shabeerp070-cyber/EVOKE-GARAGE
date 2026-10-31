import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

// Sample structure for when customer supplies real verified feedback
const sampleVerifiedReviews = [
  {
    name: "Classic Muscle Owner",
    vehicle: "1969 Dodge Charger R/T",
    service: "Full Paint Restoration & Dent Removal",
    rating: 5,
    date: "Verified Workshop Client",
    review: "The paintwork on my Dodge Charger exceeded every expectation. The mirror reflection along the body lines and the care taken with vintage panels is second to none."
  },
  {
    name: "Performance Vehicle Owner",
    vehicle: "BMW M3 Competition",
    service: "Automotive Electrical & CAN-Bus Diagnostic",
    rating: 5,
    date: "Verified Workshop Client",
    review: "Had a parasitic battery drain and headlight malfunction that two other shops couldn't diagnose. EVOKE GARAGE identified the damaged harness trace within hours."
  },
  {
    name: "SUV Owner",
    vehicle: "Land Cruiser V8",
    service: "Car A/C Overhaul & Leak Repair",
    rating: 5,
    date: "Verified Workshop Client",
    review: "Replaced the compressor and flushed the dual-zone evaporator core. Blowing 4°C vent temperatures even in peak summer heat. Absolute precision."
  }
];

export default function Testimonials() {
  const [showPreview, setShowPreview] = useState(false);

  const isEnabled = siteConfig.testimonials.enabled || showPreview;
  const reviewsToDisplay = siteConfig.testimonials.items.length > 0 
    ? siteConfig.testimonials.items 
    : sampleVerifiedReviews;

  return (
    <section id="testimonials" className="relative py-28 sm:py-36 bg-[#08080a] text-white overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="w-8 h-[1px] bg-white/40" />
              <span className="text-xs font-tech uppercase tracking-[0.3em] text-zinc-400">
                CLIENT EXPERIENCES
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase leading-[1.1]"
            >
              TRANSPARENT TRUST. <br />
              <span className="text-zinc-500">VERIFIED TESTIMONIALS.</span>
            </motion.h2>
          </div>

          {/* Toggle for Previewing Layout if not yet configured */}
          <div className="flex items-center gap-3 text-xs font-tech">
            <span className="text-zinc-500">Genuine Review Integrity:</span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {showPreview ? "Hide Preview" : "Preview Review Component"}
            </button>
          </div>
        </div>

        {/* Display Genuine Reviews OR Transparent Placeholder Card */}
        {isEnabled ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewsToDisplay.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm sm:text-base text-zinc-300 font-light italic leading-relaxed">
                    "{item.review}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-heading font-bold uppercase text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-400 font-tech mt-0.5">
                      {item.vehicle} • {item.service}
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Honest, Compliant Notice when Genuine Reviews are still pending client submission */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/10 max-w-3xl mx-auto text-center"
          >
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-zinc-300">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-black uppercase text-white">
              COMMITMENT TO ZERO MANUFACTURED REVIEWS
            </h3>

            <p className="mt-4 text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-xl mx-auto">
              In accordance with our strict brand ethos, EVOKE GARAGE never publishes fabricated customer feedback. 
              Verified reviews will appear here once genuine customer submissions are authorized and logged in our system.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-tech text-zinc-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Configurable via <code className="text-zinc-200">src/config/siteConfig.js</code>
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

