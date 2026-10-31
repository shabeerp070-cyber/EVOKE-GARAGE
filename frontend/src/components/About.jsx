import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const maskImgWrapperRef = useRef(null);
  const maskImgRef = useRef(null);
  const pillarsRef = useRef([]);
  const pillarsContainerRef = useRef(null);

  const pillars = [
    {
      index: "01",
      title: "HERITAGE & FORM",
      desc: "Preserving authentic vehicle character, classic muscle proportion, and razor-sharp bodylines.",
      metric: "100% HAND PREPPED"
    },
    {
      index: "02",
      title: "SURGICAL COACHCRAFT",
      desc: "Paintless dent removal, hydraulic bench chassis alignment, and downdraft clearcoat perfection.",
      metric: "MICRON ACCURACY"
    },
    {
      index: "03",
      title: "CLIMATE & TELEMETRY",
      desc: "Computerized CAN-bus diagnostics, precision sensor calibration, and dual-zone refrigerant recovery.",
      metric: "OEM SPECIFICATION"
    }
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // 1. Animated Mask Reveal on Editorial Atelier Image
      if (maskImgWrapperRef.current) {
        gsap.fromTo(
          maskImgWrapperRef.current,
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1.4,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: maskImgWrapperRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Counter scale on inner image during mask open (preserving original colors)
        if (maskImgRef.current) {
          gsap.fromTo(
            maskImgRef.current,
            { scale: 1.25 },
            {
              scale: 1.0,
              duration: 1.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: maskImgWrapperRef.current,
                start: 'top 85%',
              },
            }
          );
        }
      }

      // 2. Headline Split Text Slide-Up
      if (headlineRef.current && headlineRef.current.children.length > 0) {
        gsap.fromTo(
          headlineRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      // 3. Staggered Pillars Entrance (Preserving 100% solid opacity for readability during car drift)
      pillarsRef.current.filter(Boolean).forEach((el, index) => {
        gsap.fromTo(
          el,
          { y: 24 },
          {
            y: 0,
            duration: 0.6,
            delay: index * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
            },
          }
        );
      });

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="about"
      className="scroll-mt-24 sm:scroll-mt-32 relative py-24 sm:py-36 bg-white text-black overflow-hidden border-t border-black/10 w-full"
    >
      <div className="absolute inset-0 bg-grain-dark opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Scene Kicker */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <span className="w-6 sm:w-8 h-[1px] bg-black" />
          <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#888888] font-bold">
            01 // ATELIER MANIFESTO
          </span>
        </div>

        {/* Oversized Editorial Typography - Black on White */}
        <div ref={headlineRef} className="max-w-5xl mb-14 sm:mb-20">
          <h2 className="text-[clamp(1.85rem,5.5vw,4.5rem)] font-heading font-black tracking-[-0.02em] uppercase leading-[1.05] sm:leading-[0.96] text-black">
            WE REJECT SHORTCUTS. <br />
            <span className="text-[#888888]">WE ENGINEER PRESENCE.</span>
          </h2>
          <p className="mt-6 sm:mt-8 text-base sm:text-xl text-zinc-800 font-normal leading-relaxed max-w-3xl">
            At EVOKE GARAGE in Ottapalam, every panel is prepped by hand, every metallic clearcoat cured under climate-controlled downdraft airflow, and every electronic circuit calibrated to peak operating tolerances. We built an automotive studio for drivers who demand surgical perfection.
          </p>
        </div>

        {/* Main Editorial Image with Mask Wipe Reveal - Original Colors Preserved */}
        <div className="mb-20 sm:mb-28">
          <div
            ref={maskImgWrapperRef}
            className="relative h-[320px] sm:h-[500px] lg:h-[600px] w-full rounded-xl overflow-hidden border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
          >
            <img
              ref={maskImgRef}
              src="/images/car_body_polishing_craft.jpg"
              alt="Artisanal Automotive Paint Polishing at EVOKE GARAGE"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
            {/* Soft Contrast Gradient for Telemetry Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Viewfinder Telemetry Callouts inside Image */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-tech text-white uppercase tracking-[0.22em] font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>HAND BUFFING & REFLECTION AUDIT</span>
            </div>

            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-tech text-white uppercase tracking-wider">
              <span>DOWN-DRAFT CLEANROOM • OTTAPALAM</span>
              <span className="text-white font-bold">OPTICAL CLARITY PROTOCOL // 100% HAND REFINED</span>
            </div>
          </div>
        </div>

        {/* Three Pillars Section */}
        <div 
          ref={pillarsContainerRef}
          id="about-pillars"
          className="relative pt-4 sm:pt-6 border-t border-black/10"
        >
          {/* Three Pillars Grid - Minimal Black-and-White Cards with Elegant Borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-8 relative z-10">
            {pillars.map((pillar, idx) => (
              <div
                key={pillar.index}
                ref={(el) => (pillarsRef.current[idx] = el)}
                className="p-4 sm:p-8 rounded-lg sm:rounded-xl bg-[#FAFAFA] sm:bg-white border border-black/10 hover:border-black/30 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-lg relative z-10"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-black/10">
                  <span className="text-xs sm:text-sm font-tech font-bold text-black tracking-widest">
                    {pillar.index}
                  </span>
                  <span className="text-[10px] sm:text-xs font-tech text-[#888888] uppercase tracking-widest font-bold">
                    {pillar.metric}
                  </span>
                </div>
                <h3 className="text-base sm:text-2xl font-heading font-black text-black uppercase tracking-tight leading-snug">
                  {pillar.title}
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-base text-zinc-700 font-normal leading-normal sm:leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
