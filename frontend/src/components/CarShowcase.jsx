import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Gauge, Flame, Disc3 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export const SHOWCASE_PHASES = [
  {
    id: "front",
    number: "01",
    startTime: 0,
    endTime: 4.5,
    title: "FRONT ARCHITECTURE",
    headline: "SCULPTED FOR PERFORMANCE.",
    kicker: "PHASE 01 // FRONT THREE-QUARTER",
    desc: "Sculpted aerodynamic nose, widebody front splitter, and atelier surface reflections under calibrated overhead honeycomb lighting.",
    glowStyle: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 70%)",
    icon: Eye,
  },
  {
    id: "rear",
    number: "02",
    startTime: 4.5,
    endTime: 6.5,
    title: "REAR CONTOUR",
    headline: "CARBON FIBRE DOWNFORCE.",
    kicker: "PHASE 02 // REAR PROFILE & WING",
    desc: "Iconic quad circular light signature, wide flared rear arches, and race-bred high-downforce GT carbon wing.",
    glowStyle: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)",
    icon: Gauge,
  },
  {
    id: "exhaust",
    number: "03",
    startTime: 6.5,
    endTime: 8.5,
    title: "EXHAUST IGNITION",
    headline: "TITANIUM BACKFIRE RESONANCE.",
    kicker: "PHASE 03 // PERFORMANCE EXHAUST",
    desc: "High-combustion anti-lag backfire, twin titanium tailpipe flame eruption, and tuned performance exhaust calibration.",
    glowStyle: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 70%)",
    icon: Flame,
  },
  {
    id: "wheel",
    number: "04",
    startTime: 8.5,
    endTime: 12.192,
    title: "FORGED FITMENT",
    headline: "BESPOKE FORGED OFFSET.",
    kicker: "PHASE 04 // STANCE & COACHWORK",
    desc: "Bespoke multi-piece deep-dish forged alloy wheel, aggressive negative offset, bolted widebody flare, and track-ready fitment.",
    glowStyle: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 70%)",
    icon: Disc3,
  }
];

const TOTAL_FRAMES = 357;
const PHASE_START_FRAMES = [0, 132, 191, 249];

const getFrameSrc = (index, isMobile) => {
  const folder = isMobile ? '/showcase-frames-mobile-webp' : '/showcase-frames-webp';
  const num = String(index + 1).padStart(3, '0');
  return `${folder}/frame_${num}.webp`;
};

export default function CarShowcase() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  const imagesRef = useRef(new Array(TOTAL_FRAMES));
  const requestedRef = useRef(new Array(TOTAL_FRAMES).fill(false));
  const lastDrawnIndexRef = useRef(-1);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef(null);
  const currentPhaseRef = useRef(0);
  const scrollTriggerInstance = useRef(null);
  const isMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  // Core render method: draws target frame or closest available loaded frame
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let img = imagesRef.current[index];

    // If target image is not loaded yet, find nearest loaded image
    if (!img || !img.complete || img.naturalWidth === 0) {
      // 1. Try last drawn image
      const lastIdx = lastDrawnIndexRef.current;
      if (lastIdx >= 0 && imagesRef.current[lastIdx]?.complete && imagesRef.current[lastIdx]?.naturalWidth > 0) {
        img = imagesRef.current[lastIdx];
      } else {
        // 2. Search backward
        for (let i = index - 1; i >= 0; i--) {
          const candidate = imagesRef.current[i];
          if (candidate && candidate.complete && candidate.naturalWidth > 0) {
            img = candidate;
            break;
          }
        }
        // 3. Search forward
        if (!img) {
          for (let i = index + 1; i < TOTAL_FRAMES; i++) {
            const candidate = imagesRef.current[i];
            if (candidate && candidate.complete && candidate.naturalWidth > 0) {
              img = candidate;
              break;
            }
          }
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0);
      lastDrawnIndexRef.current = index;
    }
  }, []);

  // Request & draw scheduling via RAF
  const scheduleDraw = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      drawFrame(targetFrameRef.current);
    });
  }, [drawFrame]);

  // Load a single frame by index
  const loadFrame = useCallback((index, isMobile, onComplete) => {
    if (index < 0 || index >= TOTAL_FRAMES) return;
    if (requestedRef.current[index]) {
      if (imagesRef.current[index]?.complete && onComplete) {
        onComplete(imagesRef.current[index]);
      }
      return;
    }
    requestedRef.current[index] = true;

    const img = new Image();
    img.decoding = 'async';
    img.src = getFrameSrc(index, isMobile);
    img.onload = () => {
      imagesRef.current[index] = img;
      if (onComplete) onComplete(img);
      // Redraw if this frame is currently targeted
      if (Math.abs(targetFrameRef.current - index) <= 1) {
        scheduleDraw();
      }
    };
    img.onerror = () => {
      // Fallback to uncompressed source frame if webp fails
      const fallbackSrc = `/showcase-frames/frame_${String(index + 9).padStart(3, '0')}.jpg`;
      img.src = fallbackSrc;
    };
  }, [scheduleDraw]);

  // Preloading lifecycle
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    isMobileRef.current = isMobile;

    // 1. Highest Priority: Load frame 0 immediately and draw it as soon as ready
    loadFrame(0, isMobile, () => {
      drawFrame(0);
    });

    // 2. High Priority: First 25 frames
    for (let i = 1; i <= 25; i++) {
      loadFrame(i, isMobile);
    }

    // 3. High Priority: Phase transition milestone frames
    PHASE_START_FRAMES.forEach(idx => loadFrame(idx, isMobile));

    // 4. Background queue for the remaining frames
    let currentLoadIndex = 26;
    const intervalId = setInterval(() => {
      if (currentLoadIndex >= TOTAL_FRAMES) {
        clearInterval(intervalId);
        return;
      }
      const batchEnd = Math.min(currentLoadIndex + 6, TOTAL_FRAMES);
      for (let i = currentLoadIndex; i < batchEnd; i++) {
        loadFrame(i, isMobile);
      }
      currentLoadIndex = batchEnd;
    }, 60);

    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      if (currentIsMobile !== isMobileRef.current) {
        isMobileRef.current = currentIsMobile;
        imagesRef.current = new Array(TOTAL_FRAMES);
        requestedRef.current = new Array(TOTAL_FRAMES).fill(false);
        loadFrame(targetFrameRef.current, currentIsMobile, () => {
          drawFrame(targetFrameRef.current);
        });
      } else {
        drawFrame(targetFrameRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [loadFrame, drawFrame]);

  // GSAP ScrollTrigger pinning and scroll-scrubbed frame coordination
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 1024;
    const scrollDistance = isMobile ? '+=180%' : '+=260%';

    const ctx = gsap.context(() => {
      scrollTriggerInstance.current = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: scrollDistance,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.05, // Instant response with silky inertial smoothing
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress));
          const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * (TOTAL_FRAMES - 1)));

          targetFrameRef.current = frameIndex;

          // Prioritize loading near current scroll position
          const isMobileDevice = isMobileRef.current;
          for (let offset = -1; offset <= 4; offset++) {
            const idx = frameIndex + offset;
            if (idx >= 0 && idx < TOTAL_FRAMES && !requestedRef.current[idx]) {
              loadFrame(idx, isMobileDevice);
            }
          }

          scheduleDraw();

          // Determine current phase from frame index
          let phase = 0;
          if (frameIndex >= 249) phase = 3;
          else if (frameIndex >= 191) phase = 2;
          else if (frameIndex >= 132) phase = 1;
          else phase = 0;

          if (phase !== currentPhaseRef.current) {
            currentPhaseRef.current = phase;
            setActivePhaseIndex(phase);

            if (glowRef.current) {
              glowRef.current.style.background = SHOWCASE_PHASES[phase].glowStyle;
            }
          }
        }
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, [loadFrame, scheduleDraw]);

  // Jump to specific phase on step click
  const handleJumpToPhase = useCallback((index) => {
    if (!scrollTriggerInstance.current) return;
    const targetFrame = PHASE_START_FRAMES[index] || 0;
    const targetProgress = targetFrame / (TOTAL_FRAMES - 1);

    const st = scrollTriggerInstance.current;
    const targetScrollY = st.start + (st.end - st.start) * targetProgress;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }, []);

  const activePhase = SHOWCASE_PHASES[activePhaseIndex];

  return (
    <section
      ref={containerRef}
      id="showcase"
      className="relative w-full h-screen overflow-hidden bg-black text-white select-none flex items-center justify-center"
    >
      {/* ========================================================================= */}
      {/* 1. SYNCHRONIZED ATMOSPHERIC AMBIENT BACKDROP LAYER                        */}
      {/* ========================================================================= */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          background: activePhase.glowStyle
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 2. THE MAIN CAR CANVAS (DOMINATING, FULL-HEIGHT, HARDWARE-ACCELERATED)    */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
        <canvas
          ref={canvasRef}
          className="relative h-full max-h-[86vh] sm:max-h-[92vh] w-auto max-w-full object-contain pointer-events-none select-none"
        />

        {/* Soft edge blending gradients to dissolve canvas boundaries into pure black */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 3. EDITORIAL TYPOGRAPHY & CHOREOGRAPHY (Forge Automotive Aesthetic)       */}
      {/* ========================================================================= */}

      {/* Top Bar: Subtle Atelier Label */}
      <div className="absolute top-6 left-6 right-6 lg:left-12 lg:right-12 z-20 flex items-center justify-between text-xs sm:text-sm font-tech tracking-[0.22em] text-[#888888] uppercase pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white font-bold">{siteConfig.brand.name}</span>
          <span className="hidden sm:inline text-[#888888]">// BESPOKE BUILD</span>
        </div>
        <div className="text-[#888888] font-medium hidden sm:block">
          SCROLL-CONTROLLED MOTION
        </div>
      </div>

      {/* Desktop / Tablet Left Editorial Caption */}
      <div className="absolute bottom-10 left-6 sm:bottom-12 sm:left-12 max-w-xl z-20 text-left pointer-events-none">
        {/* Giant Watermark Numeral */}
        <div className="text-7xl sm:text-8xl lg:text-9xl font-heading font-black text-white/[0.07] select-none leading-none -mb-6 sm:-mb-8">
          {activePhase.number}
        </div>

        {/* Subtitle Kicker */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <span className="text-xs sm:text-sm font-tech tracking-[0.22em] text-[#888888] uppercase font-bold">
            {activePhase.kicker}
          </span>
        </div>

        {/* Dramatic Headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-black tracking-tight text-white uppercase leading-[1.0] sm:leading-[0.95]">
          {activePhase.headline}
        </h2>

        {/* Description */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-zinc-200 font-normal leading-relaxed max-w-lg line-clamp-3 sm:line-clamp-none">
          {activePhase.desc}
        </p>
      </div>

      {/* Desktop Bottom-Right Phase Navigation Pills (Clean Editorial Steppers) */}
      <div className="hidden lg:flex items-center gap-2.5 absolute bottom-12 right-12 z-20">
        {SHOWCASE_PHASES.map((phase, idx) => {
          const isActive = activePhaseIndex === idx;
          return (
            <button
              key={phase.id}
              onClick={() => handleJumpToPhase(idx)}
              className={`px-5 py-2.5 rounded-full border text-xs font-tech uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-white text-black border-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                  : 'bg-black/60 text-zinc-400 border-white/20 hover:border-white hover:text-white backdrop-blur-md font-semibold'
              }`}
            >
              {phase.number} {phase.title}
            </button>
          );
        })}
      </div>

      {/* Mobile Bottom Phase Pills */}
      <div className="lg:hidden flex items-center justify-center gap-2 absolute bottom-4 inset-x-4 z-20">
        {SHOWCASE_PHASES.map((phase, idx) => {
          const isActive = activePhaseIndex === idx;
          return (
            <button
              key={phase.id}
              onClick={() => handleJumpToPhase(idx)}
              className={`flex-1 py-2 rounded-full border text-xs font-tech uppercase tracking-[0.15em] transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black border-white font-bold shadow-md'
                  : 'bg-black/80 text-zinc-400 border-white/25 backdrop-blur-md font-medium'
              }`}
            >
              {phase.number}
            </button>
          );
        })}
      </div>
    </section>
  );
}
