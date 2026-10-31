import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ShieldCheck, Flame, Gauge, Cpu, Wrench, ThermometerSnowflake, Activity } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export default function ServicesShowcase({ onSelectService }) {
  const containerRef = useRef(null);
  const disciplineRefs = useRef([]);

  const [paint, dent, ac, elec] = siteConfig.services;

  useEffect(() => {
    if (!containerRef.current) return;
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      disciplineRefs.current.filter(Boolean).forEach((el, index) => {
        const img = el.querySelector('.service-img');
        const text = el.querySelector('.service-text');
        const badge = el.querySelector('.service-badge');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        });

        if (img) {
          tl.fromTo(
            img,
            { scale: 1.1 },
            { scale: 1.0, duration: 1.2, ease: 'power2.out' }
          );
        }

        if (text) {
          tl.fromTo(
            text,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
            '-=0.8'
          );
        }

        if (badge) {
          tl.fromTo(
            badge,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
            '-=0.6'
          );
        }
      });
    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} id="services" className="scroll-mt-24 sm:scroll-mt-32 w-full">
      {/* ========================================================================= */}
      {/* 1. SERVICES INTRO HEADER & DISCIPLINE 01: CAR PAINTING (CLEAN WHITE)      */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-white text-black overflow-hidden border-t border-black/10 w-full">
        <div className="absolute inset-0 bg-grain-dark opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="mb-16 sm:mb-24 border-b border-black/10 pb-8 sm:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <span className="w-6 sm:w-8 h-[1px] bg-black" />
                <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#888888] font-bold">
                  02 // CORE DISCIPLINES
                </span>
              </div>

              <h2 className="text-[clamp(1.85rem,5.5vw,4.5rem)] font-heading font-black tracking-tight uppercase leading-[1.05] sm:leading-[0.96] text-black">
                TECHNICAL EXCELLENCE. <br className="hidden sm:inline" />
                <span className="text-[#888888]">FOUR MASTER DISCIPLINES.</span>
              </h2>
            </div>

            <p className="text-zinc-700 text-sm sm:text-base font-tech uppercase tracking-[0.16em] max-w-md font-normal leading-relaxed">
              Engineered to exacting standards in our Ottapalam atelier. Each discipline operates under dedicated cleanroom and diagnostic protocols.
            </p>
          </div>

          {/* DISCIPLINE 01: CAR PAINTING */}
          <div
            ref={(el) => (disciplineRefs.current[0] = el)}
            id="paint"
            className="relative group"
          >
            <div className="flex items-center gap-3 text-[#888888] font-tech text-xs sm:text-sm tracking-[0.25em] mb-4 uppercase font-bold">
              <span>DISCIPLINE 01 // DOWN-DRAFT PAINT ATELIER</span>
              <span className="w-12 h-[1px] bg-zinc-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Visual Frame */}
              <div className="lg:col-span-7 relative">
                <div id="service-paint-frame" className="relative h-[280px] sm:h-[420px] md:h-[480px] rounded-xl overflow-hidden border border-black/10 bg-[#FAFAFA] shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                  <img
                    src={paint.image}
                    alt="Car Painting & Paint Restoration at EVOKE GARAGE"
                    className="service-img w-full h-full object-cover object-center will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  <div className="service-badge absolute top-4 left-4 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-tech uppercase tracking-widest text-white rounded-none font-bold">
                    DOWNDRAFT CLEANROOM ATELIER
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs sm:text-sm font-tech text-white uppercase tracking-widest font-semibold">
                    <span>SPECTROPHOTOMETER FORMULATION</span>
                    <span className="text-white font-bold">100% HAND REFINED</span>
                  </div>
                </div>
              </div>

              {/* Narrative Content */}
              <div className="service-text lg:col-span-5 flex flex-col justify-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-black text-white text-xs sm:text-sm font-tech uppercase tracking-widest w-max font-bold">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>OEM COLOR ACCURACY AUDIT</span>
                </div>

                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-black uppercase leading-tight">
                  01 — CAR PAINTING
                </h3>
                <p className="text-base sm:text-lg font-semibold text-zinc-900 leading-snug">
                  {paint.shortDescription}
                </p>
                <p className="text-sm sm:text-base text-zinc-700 font-normal leading-relaxed">
                  {paint.fullDescription}
                </p>

                <div className="space-y-2.5 border-t border-black/10 pt-5">
                  {paint.specs.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm sm:text-base text-zinc-800 font-normal">
                      <span className="w-2 h-2 rounded-full bg-black flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectService?.(paint)}
                    className="btn-forge-on-white w-full sm:w-auto text-xs sm:text-sm font-bold tracking-wider"
                  >
                    <span>INQUIRE ABOUT CAR PAINTING</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DISCIPLINE 02: DENTING & BODY REPAIR (DEEP BLACK)                      */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-black text-white overflow-hidden border-t border-white/10 w-full">
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            ref={(el) => (disciplineRefs.current[1] = el)}
            id="denting"
            className="relative group"
          >
            <div className="flex items-center gap-3 text-[#888888] font-tech text-xs sm:text-sm tracking-[0.25em] mb-4 uppercase font-bold">
              <span>DISCIPLINE 02 // SURGICAL METAL COACHCRAFT</span>
              <span className="w-12 h-[1px] bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Narrative Content (Left on Desktop) */}
              <div className="service-text lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-white text-black text-xs sm:text-sm font-tech uppercase tracking-widest w-max font-bold">
                  <Wrench className="w-4 h-4 text-black" />
                  <span>CHASSIS BENCH ALIGNMENT</span>
                </div>

                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
                  02 — DENTING & BODY REPAIR
                </h3>
                <p className="text-base sm:text-lg font-semibold text-zinc-100 leading-snug">
                  {dent.shortDescription}
                </p>
                <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
                  {dent.fullDescription}
                </p>

                <div className="space-y-2.5 border-t border-white/10 pt-5">
                  {dent.specs.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm sm:text-base text-zinc-200 font-normal">
                      <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectService?.(dent)}
                    className="btn-forge-primary w-full sm:w-auto text-xs sm:text-sm font-bold tracking-wider"
                  >
                    <span>INQUIRE ABOUT DENT REPAIR</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Frame (Right on Desktop) */}
              <div className="lg:col-span-7 order-1 lg:order-2 relative">
                <div className="relative h-[280px] sm:h-[420px] md:h-[480px] rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
                  <img
                    src={dent.image}
                    alt="Denting & Body Repair at EVOKE GARAGE"
                    className="service-img w-full h-full object-cover object-center will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

                  <div className="service-badge absolute top-4 left-4 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-tech uppercase tracking-widest text-white rounded-none font-bold">
                    PDR & HYDRAULIC JIG BENCH
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs sm:text-sm font-tech text-white uppercase tracking-widest font-semibold">
                    <span>METALLIC PANEL TRUE RECOVERY</span>
                    <span className="text-white font-bold">MICRON FLUSH FITMENT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DISCIPLINE 03: CAR A/C WORK (CLEAN WHITE)                              */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-white text-black overflow-hidden border-t border-black/10 w-full">
        <div className="absolute inset-0 bg-grain-dark opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            ref={(el) => (disciplineRefs.current[2] = el)}
            id="ac"
            className="relative group"
          >
            <div className="flex items-center gap-3 text-[#888888] font-tech text-xs sm:text-sm tracking-[0.25em] mb-4 uppercase font-bold">
              <span>DISCIPLINE 03 // CLIMATE TELEMETRY & REFRIGERATION</span>
              <span className="w-12 h-[1px] bg-zinc-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Visual Frame */}
              <div className="lg:col-span-7 relative">
                <div className="relative h-[280px] sm:h-[420px] md:h-[480px] rounded-xl overflow-hidden border border-black/10 bg-[#FAFAFA] shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                  <img
                    src={ac.image}
                    alt="Car A/C Service & Climate Calibration at EVOKE GARAGE"
                    className="service-img w-full h-full object-cover object-center will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  <div className="service-badge absolute top-4 left-4 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-tech uppercase tracking-widest text-white rounded-none font-bold">
                    AUTOMATED REFRIGERANT STATION
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs sm:text-sm font-tech text-white uppercase tracking-widest font-semibold">
                    <span>R134a / R1234yf PURITY RECOVERY</span>
                    <span className="text-white font-bold">VENT TEMP: 4.2°C TARGET</span>
                  </div>
                </div>
              </div>

              {/* Narrative Content */}
              <div className="service-text lg:col-span-5 flex flex-col justify-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-black text-white text-xs sm:text-sm font-tech uppercase tracking-widest w-max font-bold">
                  <ThermometerSnowflake className="w-4 h-4 text-white" />
                  <span>DUAL-ZONE THERMODYNAMIC TEST</span>
                </div>

                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-black uppercase leading-tight">
                  03 — CAR A/C WORK
                </h3>
                <p className="text-base sm:text-lg font-semibold text-zinc-900 leading-snug">
                  {ac.shortDescription}
                </p>
                <p className="text-sm sm:text-base text-zinc-700 font-normal leading-relaxed">
                  {ac.fullDescription}
                </p>

                <div className="space-y-2.5 border-t border-black/10 pt-5">
                  {ac.specs.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm sm:text-base text-zinc-800 font-normal">
                      <span className="w-2 h-2 rounded-full bg-black flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectService?.(ac)}
                    className="btn-forge-on-white w-full sm:w-auto text-xs sm:text-sm font-bold tracking-wider"
                  >
                    <span>INQUIRE ABOUT CAR A/C</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DISCIPLINE 04: AUTOMOTIVE ELECTRICAL WORK (DEEP BLACK)                 */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-black text-white overflow-hidden border-t border-white/10 w-full">
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            ref={(el) => (disciplineRefs.current[3] = el)}
            id="electrical"
            className="relative group"
          >
            <div className="flex items-center gap-3 text-[#888888] font-tech text-xs sm:text-sm tracking-[0.25em] mb-4 uppercase font-bold">
              <span>DISCIPLINE 04 // COMPUTERIZED CAN-BUS TELEMETRY</span>
              <span className="w-12 h-[1px] bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Narrative Content (Left on Desktop) */}
              <div className="service-text lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-white text-black text-xs sm:text-sm font-tech uppercase tracking-widest w-max font-bold">
                  <Cpu className="w-4 h-4 text-black" />
                  <span>CAN-BUS OSCILLOSCOPE TRACING</span>
                </div>

                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
                  04 — AUTOMOTIVE ELECTRICAL WORK
                </h3>
                <p className="text-base sm:text-lg font-semibold text-zinc-100 leading-snug">
                  {elec.shortDescription}
                </p>
                <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
                  {elec.fullDescription}
                </p>

                <div className="space-y-2.5 border-t border-white/10 pt-5">
                  {elec.specs.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm sm:text-base text-zinc-200 font-normal">
                      <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectService?.(elec)}
                    className="btn-forge-primary w-full sm:w-auto text-xs sm:text-sm font-bold tracking-wider"
                  >
                    <span>INQUIRE ABOUT ELECTRICAL</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Frame (Right on Desktop) */}
              <div className="lg:col-span-7 order-1 lg:order-2 relative">
                <div className="relative h-[280px] sm:h-[420px] md:h-[480px] rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
                  <img
                    src={elec.image}
                    alt="Automotive Electrical Work & Diagnostics at EVOKE GARAGE"
                    className="service-img w-full h-full object-cover object-center will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

                  <div className="service-badge absolute top-4 left-4 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-tech uppercase tracking-widest text-white rounded-none font-bold">
                    CAN-BUS DIGITAL SCANNER TERMINAL
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs sm:text-sm font-tech text-white uppercase tracking-widest font-semibold">
                    <span>LIVE SENSOR TELEMETRY & ECM HARNESS</span>
                    <span className="text-white font-bold">0 FAULT TOLERANCE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
