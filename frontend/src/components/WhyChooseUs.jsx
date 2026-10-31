import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ShieldCheck, Zap, Eye, Sliders, CheckCircle, Award } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

const iconMap = {
  Wrench: Wrench,
  ShieldCheck: ShieldCheck,
  Zap: Zap,
  Eye: Eye
};

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative py-28 sm:py-36 bg-[#070709] text-white overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-8 h-[1px] bg-white/40" />
            <span className="text-xs font-tech uppercase tracking-[0.3em] text-zinc-400">
              STANDARDS OF EXECUTION
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight uppercase leading-[1.08]"
          >
            PRECISION ENGINEERING. <br />
            <span className="text-zinc-500">HONEST CRAFTSMANSHIP.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-zinc-400 font-light leading-relaxed"
          >
            We operate with the rigorous precision demanded by high-performance automobiles. 
            From meticulous masking to laser chassis alignment, every procedure is governed by standard OEM tolerance protocols.
          </motion.p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {siteConfig.whyChooseUs.map((pillar, idx) => {
            const Icon = iconMap[pillar.iconName] || Wrench;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/30 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                {/* Top Number indicator */}
                <span className="absolute top-6 right-8 text-2xl font-tech font-bold text-zinc-700 group-hover:text-zinc-500 transition-colors">
                  0{idx + 1}
                </span>

                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:border-white/30 transition-all">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-heading font-black tracking-wide uppercase text-white group-hover:text-zinc-200 transition-colors">
                  {pillar.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                  {pillar.description}
                </p>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2 text-xs font-tech text-zinc-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>EVOKE WORKSHOP STANDARD</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-zinc-900/80 via-black to-zinc-900/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-white/10 p-1 flex-shrink-0 ring-1 ring-white/20">
              <img
                src={siteConfig.brand.logo}
                alt="Badge"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h4 className="text-lg font-heading font-black uppercase text-white tracking-wide">
                AUTHENTICITY & CONFIGURABLE SPECIFICATION
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1 max-w-xl">
                We believe in total transparency. Verified workshop details, official certifications, and opening schedules are customized to genuine customer specifications.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="flex-shrink-0 px-6 py-3 rounded-full bg-white text-black font-tech text-xs uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Inquire With Workshop
          </a>
        </motion.div>
      </div>
    </section>
  );
}

