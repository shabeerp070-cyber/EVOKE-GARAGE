import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function WhatsAppButton({ onOpenBooking }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    const isConfigured =
      siteConfig.contact.whatsappNumber &&
      !siteConfig.contact.whatsappNumber.includes('0000000000');

    if (isConfigured) {
      window.open(
        `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(
          siteConfig.contact.whatsappDefaultMessage
        )}`,
        '_blank'
      );
    } else {
      onOpenBooking?.({ title: "Direct WhatsApp Inquiry" });
    }
  };

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
      {/* Tooltip speech bubble (Desktop only) */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-black border border-white/20 text-xs sm:text-sm text-white font-tech shadow-2xl backdrop-blur-md font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Chat directly with EVOKE technicians</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Floating Button - Monochrome Atelier Styling with Inverted Hover */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleClick}
        aria-label="Direct WhatsApp Contact"
        className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black text-white border border-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer group shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-white/20 animate-ping pointer-events-none" />

        <MessageSquare className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white group-hover:text-black transition-colors" />

        {/* Small active badge */}
        <span className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-black rounded-full border border-white flex items-center justify-center">
          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-white" />
        </span>
      </motion.button>
    </div>
  );
}
