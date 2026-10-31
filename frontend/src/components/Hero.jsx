import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDown, MessageSquare, Sparkles, Package } from 'lucide-react';

export default function Hero({ onOpenBooking, onNavigateProducts }) {
  const containerRef = useRef(null);
  const heroImageRef = useRef(null);
  const contentRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Subtle cinematic zoom on page entrance
      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          { scale: 1.08 },
          { scale: 1.0, duration: 2.4, ease: 'power2.out' }
        );
      }

      // Smooth entrance for typography and buttons
      if (contentRef.current && contentRef.current.children.length > 0) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out', delay: 0.15 }
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative w-full min-h-screen min-h-[100dvh] overflow-hidden bg-black text-white flex flex-col justify-end pt-20 sm:pt-28 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:pb-12 lg:pb-16 px-3.5 sm:px-8 lg:px-12 select-none"
    >
      {/* ========================================================================= */}
      {/* 1. HERO BACKGROUND IMAGE (ONLY BACKGROUND - NO OVERLAYS OR DUPLICATES)   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          ref={heroImageRef}
          src="/images/evoke-workshop-hero-clean.jpg"
          alt="EVOKE GARAGE Automotive Painting Atelier - Glossy Black Sports Car in Paint Booth"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-[center_55%] sm:object-[center_60%] lg:object-[center_62%] transform-gpu will-change-transform"
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. EDITORIAL HERO CONTENT GROUP                                           */}
      {/* Clean, balanced automotive typography & interactive call-to-action        */}
      {/* ========================================================================= */}
      <div
        ref={contentRef}
        className="hero-content-group relative z-10 w-full flex flex-col items-start text-left max-w-3xl"
      >
        {/* Main Headline */}
        <h1
          style={{ fontSize: 'clamp(1.2rem, 4.8vw, 4.5rem)' }}
          className="font-heading font-black tracking-tight uppercase text-white leading-[1.12] sm:leading-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-3xl"
        >
          <span className="block">ENGINEERED WITH PRECISION.</span>
          <span className="block text-zinc-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            RESTORED WITH PASSION.
          </span>
        </h1>

        {/* Supporting Description */}
        <p
          className="mt-2.5 sm:mt-4 text-zinc-200 font-normal max-w-xl leading-relaxed text-xs sm:text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
        >
          Professional Automotive Care. Precision in Every Detail.
        </p>

        {/* Action Buttons: Centered horizontally with equal width & spacing on mobile */}
        <div className="mt-5 sm:mt-7 self-center sm:self-start w-full max-w-[320px] sm:max-w-none mx-auto sm:mx-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
          {/* Mobile Order 2 // Desktop Order 1: EXPLORE SHOWCASE */}
          <button
            onClick={() => scrollToSection('showcase')}
            className="order-2 sm:order-1 w-full sm:w-auto !min-h-[46px] sm:!min-h-[52px] !px-4 sm:!px-7 text-xs sm:text-sm cursor-pointer group shadow-xl bg-black text-white border border-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2.5 font-tech font-bold uppercase tracking-wider active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black transition-colors" />
            <span>EXPLORE SHOWCASE</span>
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black group-hover:translate-y-1 transition-transform" />
          </button>

          {/* Mobile Order 3 // Desktop Order 2: BOOK CONSULTATION */}
          <button
            onClick={() => onOpenBooking?.()}
            className="order-3 sm:order-2 w-full sm:w-auto !min-h-[46px] sm:!min-h-[52px] !px-4 sm:!px-7 text-xs sm:text-sm cursor-pointer group bg-black/85 text-white border border-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-sm shadow-xl flex items-center justify-center gap-2 sm:gap-2.5 font-tech font-bold uppercase tracking-wider active:scale-[0.98]"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black transition-colors" />
            <span>BOOK CONSULTATION</span>
          </button>

          {/* Mobile Order 1 // Desktop Order 3: PRODUCTS */}
          <button
            onClick={() => onNavigateProducts?.()}
            className="order-1 sm:order-3 w-full sm:w-auto !min-h-[46px] sm:!min-h-[52px] !px-4 sm:!px-7 text-xs sm:text-sm cursor-pointer group bg-black/85 text-white border border-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-sm shadow-xl flex items-center justify-center gap-2 sm:gap-2.5 font-tech font-bold uppercase tracking-wider active:scale-[0.98]"
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black transition-colors" />
            <span>PRODUCTS</span>
          </button>
        </div>
      </div>
    </section>
  );
}
