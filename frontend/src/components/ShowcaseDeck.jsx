import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export default function ShowcaseDeck({ onOpenBooking }) {
  const sectionRef = useRef(null);
  const pinWrapperRef = useRef(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Touch swipe support for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const scenes = [
    {
      id: "scene-1",
      number: "01",
      kicker: "SCENE 01 // COMPLETE LUXURY COUPE",
      title: "DARK STUDIO REFINEMENT",
      description: "A complete luxury car set inside our dark automotive studio. Monitored under high-CRI inspection lamps to eliminate micro-marring and bring out deep optical reflections.",
      image: "/images/showcase-1.jpg",
      tag: "STUDIO PROFILE",
      specs: ["Downdraft climate booth", "Multi-stage wet sanding", "Spectrophotometer matching"]
    },
    {
      id: "scene-2",
      number: "02",
      kicker: "SCENE 02 // SURFACE & REFLECTIONS",
      title: "PAINTWORK & BODY DETAILS",
      description: "An intimate close-up of metallic paintwork, body curves, and mirror-depth clearcoat. Restoring original bodylines and eliminating surface imperfections down to the micron.",
      image: "/images/showcase-2.jpg",
      tag: "SURFACE DETAIL",
      specs: ["Paintless Dent Removal (PDR)", "High-gloss clearcoat buffing", "Anti-corrosion metal seal"]
    },
    {
      id: "scene-3",
      number: "03",
      kicker: "SCENE 03 // FINISHED PERFORMANCE",
      title: "DRAMATIC SHOWCASE FINISH",
      description: "A professionally finished vehicle under dramatic studio lighting. Every mechanical tolerance, climate loop, and electronic circuit calibrated to peak operating standards.",
      image: "/images/showcase-3.jpg",
      tag: "FINISHED ATELIER",
      specs: ["CAN-bus telemetry", "Dual-zone climate calibration", "Laser alignment testing"]
    }
  ];

  // GSAP Pinned Scrolling for Desktop (1024px+)
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const sceneEls = gsap.utils.toArray('.desktop-scene-layer');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress < 0.33) setActiveSceneIndex(0);
            else if (progress < 0.67) setActiveSceneIndex(1);
            else setActiveSceneIndex(2);
          }
        }
      });

      // Scene 1 to Scene 2 crossfade: fade out Scene 0, fade in Scene 1
      tl.to(sceneEls[0], {
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 0.5);

      tl.to(sceneEls[1], {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 0.5);

      // Scene 2 to Scene 3 crossfade: fade out Scene 1, fade in Scene 2
      tl.to(sceneEls[1], {
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 1.5);

      tl.to(sceneEls[2], {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 1.5);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, sectionRef.current);

    return () => {
      ctx.revert();
    };
  }, []);

  // Mobile Slide Navigation
  const goToSlide = (idx) => {
    setActiveSceneIndex(idx);
  };

  const nextSlide = () => {
    setActiveSceneIndex((prev) => (prev + 1) % scenes.length);
  };

  const prevSlide = () => {
    setActiveSceneIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative bg-[#08080A] text-[#F2F1ED] overflow-hidden border-t border-hairline w-full"
    >
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

      {/* ========================================================================= */}
      {/* DESKTOP PINNED CINEMATIC 3-SCENE EXPERIENCE (1024px+)                       */}
      {/* ========================================================================= */}
      <div className="hidden lg:block h-screen w-full relative">
        {/* Persistent Desktop Top Bar */}
        <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between border-b border-hairline pb-5">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-white/40" />
            <span className="text-xs font-tech uppercase tracking-[0.3em] text-zinc-400">
              02 // THREE-SCENE CAR SHOWCASE
            </span>
          </div>

          {/* Scene Switcher Buttons */}
          <div className="flex items-center gap-3">
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`h-9 px-4 rounded-sm text-xs font-tech tracking-widest transition-all cursor-pointer border ${
                  activeSceneIndex === idx
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-white/[0.04] text-zinc-400 border-hairline hover:text-white'
                }`}
              >
                SCENE {s.number}
              </button>
            ))}
          </div>
        </div>

        {/* Stacked Scene Layers (Crossfade via GSAP ScrollTrigger) */}
        {scenes.map((scene, idx) => (
          <div
            key={scene.id}
            className={`desktop-scene-layer absolute inset-0 w-full h-full flex items-center justify-center pt-20 px-8 ${
              idx === 0 ? 'opacity-100' : 'opacity-0 scale-[1.03]'
            } transition-all duration-300 will-change-transform`}
          >
            <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-12 items-center">
              {/* Scene Visual Frame (7 cols) */}
              <div className="col-span-7">
                <div className="relative h-[520px] rounded-sm overflow-hidden border border-hairline bg-[#161616] group shadow-2xl">
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover filter brightness-[0.88] contrast-120 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

                  {/* Scene Tag Pill */}
                  <div className="absolute top-5 left-5 px-3.5 py-1.5 bg-black/80 backdrop-blur-md border border-hairline text-[10px] font-tech uppercase tracking-widest text-zinc-300">
                    {scene.tag}
                  </div>

                  {/* Active Scene Meter */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs font-tech text-zinc-400 uppercase tracking-widest">
                    <span>OTTAPALAM ATELIER // {scene.kicker}</span>
                    <span className="text-white font-bold">{scene.number} / 03</span>
                  </div>
                </div>
              </div>

              {/* Scene Narrative Frame (5 cols) */}
              <div className="col-span-5 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-3 text-zinc-500 font-tech text-xs tracking-[0.25em] uppercase">
                  <span>CINEMATIC SEQUENCE // STAGE {scene.number} OF 03</span>
                  <span className="w-12 h-[1px] bg-zinc-800" />
                </div>

                <div>
                  <span className="text-xs font-tech uppercase tracking-[0.22em] text-zinc-400 block mb-2">
                    {scene.kicker}
                  </span>
                  <h3 className="text-3xl xl:text-4xl font-heading font-black tracking-tight text-[#F2F1ED] uppercase leading-tight">
                    {scene.title}
                  </h3>
                </div>

                <p className="text-base text-zinc-300 font-light leading-relaxed">
                  {scene.description}
                </p>

                {/* Assurance Specs */}
                <div className="space-y-2.5 border-t border-hairline pt-6">
                  <span className="text-[10px] font-tech uppercase tracking-[0.25em] text-zinc-500 block mb-1">
                    PROTOCOL SPECIFICATIONS
                  </span>
                  {scene.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-3 text-xs text-zinc-300 font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenBooking?.()}
                    className="btn-forge-primary cursor-pointer"
                  >
                    <span>CONSULT WITH SPECIALISTS</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE TOUCH-OPTIMIZED 3-SCENE PRESENTATION (< 1024px)                     */}
      {/* ========================================================================= */}
      <div
        className="block lg:hidden py-16 sm:py-24 px-4 sm:px-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-xl mx-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8 border-b border-hairline pb-4">
            <div>
              <span className="text-[10px] font-tech uppercase tracking-[0.25em] text-zinc-400 block mb-1">
                02 // CAR SHOWCASE
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-black uppercase text-white tracking-wide">
                THREE-SCENE SHOWCASE
              </h2>
            </div>

            {/* Scene Selector */}
            <div className="flex items-center gap-1.5">
              {scenes.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={`h-9 px-3 rounded-sm text-xs font-tech tracking-wider cursor-pointer border ${
                    activeSceneIndex === idx
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-white/[0.04] text-zinc-400 border-hairline'
                  }`}
                >
                  {s.number}
                </button>
              ))}
            </div>
          </div>

          {/* Active Mobile Scene Card */}
          <div className="space-y-6">
            <div className="relative h-[260px] sm:h-[340px] rounded-sm overflow-hidden border border-hairline bg-[#161616]">
              <img
                src={scenes[activeSceneIndex].image}
                alt={scenes[activeSceneIndex].title}
                className="w-full h-full object-cover filter brightness-[0.88] contrast-120"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

              <span className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-hairline text-[9px] font-tech uppercase tracking-widest text-zinc-300">
                {scenes[activeSceneIndex].tag}
              </span>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${((activeSceneIndex + 1) / scenes.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-widest block mb-1">
                  {scenes[activeSceneIndex].kicker}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-black uppercase text-white tracking-wide">
                  {scenes[activeSceneIndex].title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                {scenes[activeSceneIndex].description}
              </p>

              <div className="space-y-2 border-t border-hairline pt-4">
                {scenes[activeSceneIndex].specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2.5 text-xs text-zinc-300 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onOpenBooking?.()}
                  className="btn-forge-primary flex-1 !min-h-[46px] text-xs justify-center cursor-pointer"
                >
                  <span>CONSULT SPECIALISTS</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    className="w-11 h-11 rounded-sm border border-hairline bg-white/[0.04] flex items-center justify-center text-zinc-300 active:bg-white/10 cursor-pointer"
                    aria-label="Previous scene"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-11 h-11 rounded-sm border border-hairline bg-white/[0.04] flex items-center justify-center text-zinc-300 active:bg-white/10 cursor-pointer"
                    aria-label="Next scene"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
