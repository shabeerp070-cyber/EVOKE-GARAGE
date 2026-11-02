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

// Backbone anchor frames every 6th index to guarantee seamless nearest-frame fallback everywhere
const BACKBONE_STEP = 6;
const BACKBONE_INDICES = new Set();
for (let i = 0; i < TOTAL_FRAMES; i += BACKBONE_STEP) {
  BACKBONE_INDICES.add(i);
}
BACKBONE_INDICES.add(TOTAL_FRAMES - 1);
PHASE_START_FRAMES.forEach(idx => BACKBONE_INDICES.add(idx));

const MAX_CONCURRENT_REQUESTS = 4;
const MAX_CACHE_SIZE = 70;

const getFrameSrc = (index, isMobile) => {
  const folder = isMobile ? '/showcase-frames-mobile-webp' : '/showcase-frames-webp';
  const num = String(index + 1).padStart(3, '0');
  return `${folder}/frame_${num}.webp`;
};

export default function CarShowcase() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  // High-performance image cache & request control
  const cacheRef = useRef(new Map());
  const requestedSetRef = useRef(new Set());
  const activeRequestsRef = useRef(0);
  const queueRef = useRef([]);

  const targetFrameRef = useRef(0);
  const renderedFrameRef = useRef(-1);
  const lastDrawnImgRef = useRef(null);
  const scrollDirectionRef = useRef(1); // 1 = down, -1 = up
  const isMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const currentPhaseRef = useRef(0);
  const scrollTriggerInstance = useRef(null);
  const rafIdRef = useRef(null);
  const isVisibleRef = useRef(false);

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  // Helper to find closest available loaded frame in cache
  const findClosestLoadedImage = useCallback((index) => {
    const cache = cacheRef.current;
    if (cache.has(index)) {
      const img = cache.get(index);
      if (img && img.complete && img.naturalWidth > 0) return img;
    }

    // Bidirectional search outward
    for (let offset = 1; offset < 30; offset++) {
      const prevIdx = index - offset;
      if (prevIdx >= 0 && cache.has(prevIdx)) {
        const img = cache.get(prevIdx);
        if (img && img.complete && img.naturalWidth > 0) return img;
      }
      const nextIdx = index + offset;
      if (nextIdx < TOTAL_FRAMES && cache.has(nextIdx)) {
        const img = cache.get(nextIdx);
        if (img && img.complete && img.naturalWidth > 0) return img;
      }
    }

    return lastDrawnImgRef.current;
  }, []);

  // Hardware-accelerated canvas paint (direct Blit without re-allocating context or buffers)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const targetIdx = targetFrameRef.current;
    const img = findClosestLoadedImage(targetIdx);

    if (img && img.complete && img.naturalWidth > 0) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      renderedFrameRef.current = targetIdx;
      lastDrawnImgRef.current = img;
    }
  }, [findClosestLoadedImage]);

  // Pump queue with concurrency limiting
  const processQueue = useCallback(() => {
    const queue = queueRef.current;
    const cache = cacheRef.current;
    const isMobile = isMobileRef.current;

    while (activeRequestsRef.current < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
      const index = queue.shift();
      if (cache.has(index)) continue;

      activeRequestsRef.current++;
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameSrc(index, isMobile);

      img.onload = () => {
        activeRequestsRef.current--;
        cache.set(index, img);

        // Immediate repaint if target frame is close to this newly loaded image
        if (Math.abs(targetFrameRef.current - index) <= 2) {
          renderCanvas();
        }

        processQueue();
      };

      img.onerror = () => {
        activeRequestsRef.current--;
        // Robust fallback to uncompressed JPG if WebP fails
        const fallback = new Image();
        fallback.decoding = 'async';
        fallback.src = `/showcase-frames/frame_${String(index + 9).padStart(3, '0')}.jpg`;
        fallback.onload = () => {
          cache.set(index, fallback);
          if (Math.abs(targetFrameRef.current - index) <= 2) {
            renderCanvas();
          }
        };
        processQueue();
      };
    }
  }, [renderCanvas]);

  // Request a frame with optional unshift priority
  const requestFrame = useCallback((index, highPriority = false) => {
    if (index < 0 || index >= TOTAL_FRAMES) return;
    if (requestedSetRef.current.has(index)) return;

    requestedSetRef.current.add(index);
    if (highPriority) {
      queueRef.current.unshift(index);
    } else {
      queueRef.current.push(index);
    }
    processQueue();
  }, [processQueue]);

  // Sliding-window memory eviction (prevents mobile memory pressure & context loss)
  const evictExcessFrames = useCallback((currentCenter) => {
    const cache = cacheRef.current;
    if (cache.size <= MAX_CACHE_SIZE) return;

    // Collect candidates that are not backbone anchors and far from currentCenter
    for (const [idx, img] of cache.entries()) {
      if (BACKBONE_INDICES.has(idx)) continue; // Never evict anchor frames
      if (Math.abs(idx - currentCenter) > 28) {
        img.onload = null;
        img.onerror = null;
        img.src = '';
        cache.delete(idx);
        requestedSetRef.current.delete(idx);
      }
    }
  }, []);

  // Directional lookahead prioritization based on scrolling
  const prioritizeWindow = useCallback((centerIdx, direction) => {
    const queue = queueRef.current;
    const requested = requestedSetRef.current;

    // Build directional window:
    // When scrolling down (dir = 1): lookahead forward [+1 .. +14], backward [-2 .. -1]
    // When scrolling up (dir = -1): lookahead backward [-1 .. -14], forward [+1 .. +2]
    const prioritized = [];

    // Target frame itself first
    if (!requested.has(centerIdx)) prioritized.push(centerIdx);

    if (direction >= 0) {
      // Forward bias
      for (let offset = 1; offset <= 14; offset++) {
        const fwd = centerIdx + offset;
        if (fwd < TOTAL_FRAMES && !requested.has(fwd)) prioritized.push(fwd);
        if (offset <= 3) {
          const bwd = centerIdx - offset;
          if (bwd >= 0 && !requested.has(bwd)) prioritized.push(bwd);
        }
      }
    } else {
      // Backward bias
      for (let offset = 1; offset <= 14; offset++) {
        const bwd = centerIdx - offset;
        if (bwd >= 0 && !requested.has(bwd)) prioritized.push(bwd);
        if (offset <= 3) {
          const fwd = centerIdx + offset;
          if (fwd < TOTAL_FRAMES && !requested.has(fwd)) prioritized.push(fwd);
        }
      }
    }

    if (prioritized.length > 0) {
      prioritized.forEach(idx => requested.add(idx));
      // Put at head of queue
      queueRef.current = [...prioritized, ...queue];
      processQueue();
    }

    // Keep memory bounded
    evictExcessFrames(centerIdx);
  }, [processQueue, evictExcessFrames]);

  // Continuous RAF synchronization loop (smooth 60fps+ rendering synced with VSync)
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;
      if (renderedFrameRef.current !== targetFrameRef.current) {
        renderCanvas();
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [renderCanvas]);

  // Initial Preloader Lifecycle
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    isMobileRef.current = isMobile;

    // 1. Critical Priority: Frame 0 and immediate surrounding frames
    for (let i = 0; i <= 6; i++) {
      requestFrame(i, true);
    }

    // 2. Background Priority: Staggered backbone anchor frames (every 6th frame)
    let backboneArray = Array.from(BACKBONE_INDICES).filter(idx => idx > 6);
    let bIndex = 0;

    const intervalId = setInterval(() => {
      if (bIndex >= backboneArray.length) {
        clearInterval(intervalId);
        return;
      }
      // Load 2 backbone frames per tick to avoid saturating network
      for (let k = 0; k < 2 && bIndex < backboneArray.length; k++, bIndex++) {
        requestFrame(backboneArray[bIndex], false);
      }
    }, 45);

    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      if (currentIsMobile !== isMobileRef.current) {
        isMobileRef.current = currentIsMobile;
        // Clear non-anchors and reload current frame in new resolution
        cacheRef.current.clear();
        requestedSetRef.current.clear();
        queueRef.current = [];
        requestFrame(targetFrameRef.current, true);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, [requestFrame]);

  // GSAP ScrollTrigger pinning and bidirectional scroll scrub
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
        scrub: true, // Direct 1:1 synchronization with smooth Lenis
        invalidateOnRefresh: true,
        onToggle: (self) => {
          isVisibleRef.current = self.isActive;
        },
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress));
          const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1))));

          const prevFrame = targetFrameRef.current;
          const direction = frameIndex >= prevFrame ? 1 : -1;
          scrollDirectionRef.current = direction;
          targetFrameRef.current = frameIndex;

          // Prioritize directional lookahead window
          prioritizeWindow(frameIndex, direction);

          // Fast phase detection without unnecessary React re-renders
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
  }, [prioritizeWindow]);

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
