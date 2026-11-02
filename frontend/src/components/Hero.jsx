import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDown, MessageSquare, Sparkles, ShoppingBag, Menu } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Hero({ onOpenBooking, onNavigateProducts, onOpenMenu }) {
  const containerRef = useRef(null);
  const heroImageRef = useRef(null);
  const contentRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBooking = () => {
    if (onOpenBooking) {
      onOpenBooking({ title: "Automotive Consultation" });
    } else {
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
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Subtle cinematic zoom on desktop hero image
      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          { scale: 1.08 },
          { scale: 1.0, duration: 2.4, ease: 'power2.out' }
        );
      }

      // Smooth entrance for desktop typography and buttons
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
      className="relative w-full bg-black text-white select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. MOBILE HERO SECTION: FULL-WIDTH LUXURY REFERENCE LAYOUT                */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full min-h-[100dvh] h-[100dvh] bg-black text-white flex flex-col justify-between items-center select-none pt-[max(16px,env(safe-area-inset-top,18px))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] px-3.5 overflow-hidden">
        
        {/* Header Row: Hamburger (left), Centered Brand + Location, Shopping Bag (right) */}
        <div className="w-full flex items-center justify-between text-white z-20 flex-shrink-0 pb-1">
          <button
            onClick={() => onOpenMenu?.()}
            className="p-2 -ml-1.5 text-white hover:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>

          <div className="flex flex-col items-center justify-center text-center px-2">
            <span className="font-orbitron font-extrabold tracking-[0.16em] text-[15.5px] sm:text-[16.5px] text-white uppercase leading-none whitespace-nowrap drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
              {siteConfig.brand.name}
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-tech text-zinc-300 tracking-[0.18em] uppercase mt-1.5 font-semibold whitespace-nowrap">
              OTTAPALAM · PALAKKAD · KERALA
            </span>
          </div>

          <button
            onClick={() => onNavigateProducts?.()}
            className="p-2 -mr-1.5 text-white hover:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
            aria-label="View Products Catalogue"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Center Stage: Independent Logo & Lowered Car Scene */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-start min-h-0 overflow-hidden mt-0.5 sm:mt-1">
          {/* Circular EVOKE GARAGE Emblem (Moved slightly down for balanced top spacing) */}
          <div className="relative z-20 flex items-center justify-center flex-shrink-0 mt-4 sm:mt-4.5">
            <img
              src="/images/evoke-garage-emblem-round.png"
              alt="EVOKE GARAGE Official Emblem"
              className="w-[106px] h-[106px] sm:w-[110px] sm:h-[110px] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              loading="eager"
            />
          </div>

          {/* Main Car/Workshop Image: Moved slightly down with preserved aspect ratio */}
          <div className="relative w-full max-w-[380px] mx-auto flex items-center justify-center flex-shrink-0 -mt-[100px] translate-y-[44px] pointer-events-none">
            <img
              src="/images/mobile-hero-car-workshop.jpg"
              alt="EVOKE GARAGE High-Performance Luxury Sports Car"
              className="w-full h-auto max-h-[49vh] sm:max-h-[51vh] object-contain object-top transform-gpu"
              loading="eager"
            />
            {/* Soft bottom vignette to dissolve into pure black */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
          </div>

          {/* Headline, Description & Action Buttons: Compact layout placed closer to bottom */}
          <div className="w-full flex flex-col items-center text-center z-10 mt-[56px] sm:mt-[58px] flex-shrink-0">
            {/* Subtle Horizontal Divider Line */}
            <div className="w-14 h-[1.5px] bg-white/75 mx-auto mb-2" />

            {/* 4-Line Centered Bold Headline */}
            <h1 className="font-heading font-black text-center text-white uppercase tracking-[0.14em] text-[1.05rem] sm:text-[1.2rem] leading-[1.22] max-w-[300px] mx-auto">
              <span className="block">ENGINEERED WITH</span>
              <span className="block">PRECISION.</span>
              <span className="block">RESTORED WITH</span>
              <span className="block">PASSION.</span>
            </h1>

            {/* Small Uppercase Description */}
            <p className="mt-1.5 text-center text-zinc-400 font-tech text-[9.5px] sm:text-[10px] tracking-[0.2em] uppercase font-medium">
              PROFESSIONAL AUTOMOTIVE CARE.
            </p>

            {/* Action Buttons: Compact gap, positioned close to bottom without large gap above */}
            <div className="w-full mt-3 px-1 flex flex-col items-center gap-2">
              {/* Button 1: PRODUCTS */}
              <button
                onClick={() => onNavigateProducts?.()}
                className="w-full max-w-[340px] !min-h-[46px] sm:!min-h-[48px] bg-white text-black font-tech font-bold text-xs uppercase tracking-wider rounded-md shadow-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] hover:bg-zinc-200 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-black stroke-[2]" />
                <span>PRODUCTS</span>
              </button>

              {/* Button 2: BOOK CONSULTATION */}
              <button
                onClick={handleBooking}
                className="w-full max-w-[340px] !min-h-[46px] sm:!min-h-[48px] bg-white text-black font-tech font-bold text-xs uppercase tracking-wider rounded-md shadow-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] hover:bg-zinc-200 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-black fill-transparent stroke-[2]" />
                <span>BOOK CONSULTATION</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP HERO SECTION: PRESERVED FULL-BLEED ATELIER EXPERIENCE          */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex relative w-full min-h-screen overflow-hidden bg-black text-white flex-col justify-end pt-28 pb-16 px-12 select-none">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img
            ref={heroImageRef}
            src="/images/evoke-workshop-hero-clean.jpg"
            alt="EVOKE GARAGE Automotive Painting Atelier"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-[center_62%] transform-gpu will-change-transform"
          />
        </div>

        {/* Editorial Content Group */}
        <div
          ref={contentRef}
          className="relative z-10 w-full flex flex-col items-start text-left max-w-3xl"
        >
          <h1
            style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)' }}
            className="font-heading font-black tracking-tight uppercase text-white leading-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-3xl"
          >
            <span className="block">ENGINEERED WITH PRECISION.</span>
            <span className="block text-zinc-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              RESTORED WITH PASSION.
            </span>
          </h1>

          <p className="mt-4 text-zinc-200 font-normal max-w-xl leading-relaxed text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Professional Automotive Care. Precision in Every Detail.
          </p>

          <div className="mt-7 flex flex-row items-center justify-start gap-4">
            {/* Button 1: PRODUCTS */}
            <button
              onClick={() => onNavigateProducts?.()}
              className="!min-h-[52px] !px-7 text-sm cursor-pointer group bg-white text-black border border-white hover:bg-zinc-200 transition-all duration-300 shadow-xl rounded-md flex items-center justify-center gap-2.5 font-tech font-bold uppercase tracking-wider active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              <span>PRODUCTS</span>
            </button>

            {/* Button 2: EXPLORE SHOWCASE */}
            <button
              onClick={() => scrollToSection('showcase')}
              className="!min-h-[52px] !px-7 text-sm cursor-pointer group shadow-xl bg-black/90 text-white border border-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm rounded-md flex items-center justify-center gap-2.5 font-tech font-bold uppercase tracking-wider active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-white group-hover:text-black transition-colors" />
              <span>EXPLORE SHOWCASE</span>
              <ArrowDown className="w-4 h-4 text-white group-hover:text-black group-hover:translate-y-1 transition-transform" />
            </button>

            {/* Button 3: BOOK CONSULTATION */}
            <button
              onClick={handleBooking}
              className="!min-h-[52px] !px-7 text-sm cursor-pointer group bg-black/90 text-white border border-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-sm shadow-xl rounded-md flex items-center justify-center gap-2.5 font-tech font-bold uppercase tracking-wider active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-white group-hover:text-black transition-colors" />
              <span>BOOK CONSULTATION</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
