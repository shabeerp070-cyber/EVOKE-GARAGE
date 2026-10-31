import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../config/siteConfig';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('DIAGNOSTICS INITIALIZING');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete?.();
          }, 350);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 12) + 6;
        return next > 100 ? 100 : next;
      });
    }, 28);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 30) {
      setStageText('CALIBRATING ATELIER SENSORS');
    } else if (progress < 65) {
      setStageText('PREPARING CHOREOGRAPHY FEED');
    } else if (progress < 90) {
      setStageText('CHECKING SPECIFICATIONS');
    } else {
      setStageText('EVOKE GARAGE READY');
    }
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070707] text-white px-6 select-none"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Glowing Logo Emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-6"
        >
          {/* Subtle spinning halo ring */}
          <div className="absolute -inset-3 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-6 rounded-full border border-dashed border-white/5 animate-[spin_20s_linear_infinite_reverse]" />
          
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-white/15 to-white/5 p-1 ring-1 ring-white/20 shadow-[0_0_40px_rgba(255,255,255,0.12)] flex items-center justify-center backdrop-blur-md">
            <img
              src={siteConfig.brand.logoCircle}
              alt="EVOKE GARAGE Emblem"
              className="w-full h-full object-contain rounded-full brightness-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.25em] text-zinc-400 block mb-1 font-semibold">
            EST. OTTAPALAM • AUTOMOTIVE ATELIER
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-wider text-white">
            {siteConfig.brand.name}
          </h2>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-6">
          <div className="flex justify-between items-center text-xs sm:text-sm font-tech text-zinc-400 mb-2">
            <span className="tracking-widest font-medium">{stageText}</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Precision quote */}
        <p className="mt-4 text-xs sm:text-sm text-zinc-300 font-normal tracking-wide max-w-xs">
          "Engineered with precision. Restored with passion."
        </p>
      </div>

      {/* Skip button in corner */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 text-xs sm:text-sm font-tech text-zinc-400 hover:text-white uppercase tracking-widest transition-colors py-1.5 px-4 border border-white/20 rounded-full hover:border-white cursor-pointer font-semibold"
      >
        Skip Intro &rarr;
      </button>
    </motion.div>
  );
}
