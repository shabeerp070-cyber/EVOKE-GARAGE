import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export default function LargeStatement() {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      // Smooth parallax on background image
      if (imgRef.current && !isMobile) {
        gsap.fromTo(
          imgRef.current,
          { yPercent: -8, scale: 1.05 },
          {
            yPercent: 8,
            scale: 1.12,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      // Fade & elevate text reveal
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: isMobile ? 20 : 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, sectionRef.current);

    return () => {
      ctx.revert();
    };
  }, []);

  const { kicker, headline, subtext, stats, image } = siteConfig.largeStatement;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0C0C0C] text-[#F2F1ED] select-none border-t border-hairline py-20 sm:py-36 w-full"
    >
      {/* Background Cinematic Vehicle Image with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          ref={imgRef}
          src={image}
          alt="EVOKE GARAGE High-Performance Vehicle"
          className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-125"
          loading="lazy"
          decoding="async"
        />
        {/* Cinematic atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/60 to-[#0C0C0C]/80" />
        <div className="absolute inset-0 glow-forge-crimson pointer-events-none" />
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
      </div>

      {/* Center Oversized Typographic Statement with Responsive Fluid Scaling */}
      <div
        ref={textRef}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center w-full"
      >
        {/* Kicker Tag */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/[0.04] border border-hairline backdrop-blur-md mb-6 sm:mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] sm:text-[11px] font-tech uppercase tracking-[0.25em] sm:tracking-[0.3em] text-zinc-300">
            {kicker}
          </span>
        </div>

        {/* Oversized Headline with CSS clamp() */}
        <h2 className="text-[clamp(1.75rem,6.5vw,5.5rem)] font-heading font-black tracking-[-0.03em] uppercase leading-[0.98] sm:leading-[0.92] text-[#F2F1ED] max-w-5xl break-words">
          {headline}
        </h2>

        {/* Subtext */}
        <p className="mt-6 sm:mt-8 text-xs sm:text-lg text-zinc-300 font-light max-w-3xl mx-auto leading-relaxed px-2">
          {subtext}
        </p>

        {/* Stats Row */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl pt-6 sm:pt-8 border-t border-hairline">
          {stats.map((stat) => (
            <div key={stat.label} className="p-3.5 sm:p-4 rounded-sm bg-black/40 border border-hairline backdrop-blur-sm">
              <span className="text-[9px] sm:text-[10px] font-tech uppercase tracking-[0.22em] text-zinc-400 block mb-1">
                {stat.label}
              </span>
              <span className="text-base sm:text-xl font-heading font-black uppercase text-white tracking-wide">
                {stat.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
