import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Gauge, Flame, Disc3, ArrowDown } from 'lucide-react';
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

export default function CarShowcase() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const ambientVideoRef = useRef(null);
  const glowRef = useRef(null);
  const videoProxy = useRef({ time: 0 });
  const currentPhaseRef = useRef(0);
  const scrollTriggerInstance = useRef(null);

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(12.192);

  // Initialize and attach video
  useEffect(() => {
    const video = videoRef.current;
    const ambient = ambientVideoRef.current;
    if (!video) return;

    // Explicitly guarantee DOM property muted & playsInline for autoplay policy
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (ambient) {
      ambient.muted = true;
      ambient.defaultMuted = true;
      ambient.playsInline = true;
    }

    const handleLoadedMetadata = () => {
      const dur = video.duration && !isNaN(video.duration) && video.duration > 0 ? video.duration : 12.192;
      setVideoDuration(dur);
      video.currentTime = 0.1;
      if (ambient) ambient.currentTime = 0.1;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    const tickleInitialFrame = () => {
      if (video.currentTime === 0) video.currentTime = 0.1;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => video.pause()).catch(() => {});
      }
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
      tickleInitialFrame();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', tickleInitialFrame, { once: true });
    }

    if (video.readyState === 0) {
      video.load();
    }
    if (ambient && ambient.readyState === 0) {
      ambient.load();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', tickleInitialFrame);
    };
  }, []);

  // GSAP ScrollTrigger timeline pinning full screen
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const ambient = ambientVideoRef.current;
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
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const dur = videoDuration || 12.192;
          const targetTime = Math.min(progress * dur, dur - 0.02);

          // Smooth video seek tween
          gsap.to(videoProxy.current, {
            time: targetTime,
            duration: 0.18,
            ease: 'power1.out',
            overwrite: 'auto',
            onUpdate: () => {
              if (video && video.readyState >= 2) {
                video.currentTime = videoProxy.current.time;
              }
              if (ambient && ambient.readyState >= 2) {
                ambient.currentTime = videoProxy.current.time;
              }
            }
          });

          // Determine current phase from targetTime
          let phase = 0;
          if (targetTime >= 8.5) phase = 3;
          else if (targetTime >= 6.5) phase = 2;
          else if (targetTime >= 4.5) phase = 1;
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

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, container);

    return () => {
      ctx.revert();
    };
  }, [videoDuration]);

  // Jump to specific phase on step click
  const handleJumpToPhase = useCallback((index) => {
    if (!scrollTriggerInstance.current) return;
    const dur = videoDuration || 12.192;
    const targetTime = SHOWCASE_PHASES[index].startTime + 0.1;
    const targetProgress = Math.min(Math.max(targetTime / dur, 0), 1);

    const st = scrollTriggerInstance.current;
    const targetScrollY = st.start + (st.end - st.start) * targetProgress;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }, [videoDuration]);

  const activePhase = SHOWCASE_PHASES[activePhaseIndex];

  return (
    <section
      ref={containerRef}
      id="showcase"
      className="relative w-full h-screen overflow-hidden bg-black text-white select-none flex items-center justify-center"
    >
      {/* ========================================================================= */}
      {/* 1. SYNCHRONIZED AMBIENT BACKDROP LIGHT LAYER                              */}
      {/* ========================================================================= */}
      <video
        ref={ambientVideoRef}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        className="absolute inset-0 w-full h-full object-cover filter blur-[90px] opacity-20 scale-110 pointer-events-none z-0"
      >
        <source src="/videos/evoke-car-cinematic.mp4" type="video/mp4" />
      </video>

      {/* Atmospheric dynamic subtle monochrome glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          background: activePhase.glowStyle
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 2. THE MAIN CAR VIDEO (DOMINATING, FULL-HEIGHT, SEAMLESS DARK BLENDING)   */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          poster="/images/hero-video-poster.jpg"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="relative h-full max-h-[86vh] sm:max-h-[92vh] w-auto max-w-full object-contain pointer-events-none select-none"
        >
          <source src="/videos/evoke-car-cinematic.mp4" type="video/mp4" />
        </video>

        {/* Soft edge blending gradients to dissolve video boundaries into pure black */}
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

