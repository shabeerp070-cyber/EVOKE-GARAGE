import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame, Disc3, Eye, Gauge, Sparkles, ChevronDown } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export const CINEMATIC_PHASES = [
  {
    id: "front",
    number: "01",
    startTime: 0,
    endTime: 4.5,
    title: "FRONT ARCHITECTURE",
    subtitle: "AERODYNAMIC WIDEBODY & HONEYCOMB LIGHTING",
    kicker: "PHASE 01 // FRONT THREE-QUARTER",
    desc: "Sculpted aerodynamic nose, widebody front splitter, and atelier surface reflections under calibrated overhead honeycomb lighting.",
    accentColor: "border-white/40 text-white",
    glowStyle: "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(12,12,12,0) 70%)",
    icon: Eye,
    spec: "CARBON FIBRE SPLITTER // HIGH-CRI ILLUMINATION"
  },
  {
    id: "rear",
    number: "02",
    startTime: 4.5,
    endTime: 6.5,
    title: "REAR CONTOUR",
    subtitle: "SIGNATURE TAILLIGHTS & HIGH-DOWNFORCE GT WING",
    kicker: "PHASE 02 // REAR PROFILE",
    desc: "Iconic quad circular light signature, wide flared rear arches, and race-bred high-downforce GT carbon wing.",
    accentColor: "border-red-500/60 text-red-400",
    glowStyle: "radial-gradient(ellipse at center, rgba(239,68,68,0.14) 0%, rgba(12,12,12,0) 70%)",
    icon: Gauge,
    spec: "QUAD ILLUMINATED LIGHT SIGNATURE // GT DECKLID"
  },
  {
    id: "exhaust",
    number: "03",
    startTime: 6.5,
    endTime: 8.5,
    title: "EXHAUST IGNITION",
    subtitle: "HIGH-COMBUSTION BACKFIRE & TITANIUM RESONANCE",
    kicker: "PHASE 03 // PERFORMANCE EXHAUST",
    desc: "High-combustion anti-lag backfire, twin titanium tailpipe flame eruption, and tuned performance exhaust calibration.",
    accentColor: "border-amber-500/70 text-amber-400",
    glowStyle: "radial-gradient(ellipse at center, rgba(249,115,22,0.22) 0%, rgba(12,12,12,0) 70%)",
    icon: Flame,
    spec: "TITANIUM DUAL EXHAUST // ACTIVE COMBUSTION"
  },
  {
    id: "wheel",
    number: "04",
    startTime: 8.5,
    endTime: 12.192,
    title: "FORGED FITMENT",
    subtitle: "DEEP-DISH ALLOY & BOLTED WIDEBODY FLARE",
    kicker: "PHASE 04 // STANCE & FITMENT",
    desc: "Bespoke multi-piece deep-dish forged alloy wheel, aggressive negative offset, bolted widebody flare, and track-ready fitment.",
    accentColor: "border-zinc-300 text-zinc-100",
    glowStyle: "radial-gradient(ellipse at center, rgba(255,255,255,0.09) 0%, rgba(12,12,12,0) 70%)",
    icon: Disc3,
    spec: "DEEP-DISH FORGED ALLOY // BOLTED OVERFENDER"
  }
];

export default function CinematicCarScroll() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const mobileProgressBarRef = useRef(null);
  const timecodeRef = useRef(null);
  const glowRef = useRef(null);
  const videoProxy = useRef({ time: 0 });
  const currentPhaseRef = useRef(0);
  const scrollTriggerInstance = useRef(null);

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(12.192);

  // Initialize and attach video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const dur = video.duration && !isNaN(video.duration) && video.duration > 0 ? video.duration : 12.192;
      setVideoDuration(dur);
      video.currentTime = 0.05;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Set up GSAP ScrollTrigger timeline
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;

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
        scrub: 0.4, // Responsive and butter-smooth
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const dur = videoDuration || 12.192;
          const targetTime = Math.min(progress * dur, dur - 0.02);

          // Smoothly tween video playback time
          gsap.to(videoProxy.current, {
            time: targetTime,
            duration: 0.18,
            ease: 'power1.out',
            overwrite: 'auto',
            onUpdate: () => {
              if (video && video.readyState >= 2) {
                video.currentTime = videoProxy.current.time;
              }
            }
          });

          // Update progress bars directly in DOM for maximum 60/120fps smoothness
          const pct = (progress * 100).toFixed(1) + '%';
          if (progressBarRef.current) {
            progressBarRef.current.style.width = pct;
          }
          if (mobileProgressBarRef.current) {
            mobileProgressBarRef.current.style.width = pct;
          }

          // Update real-time timecode
          if (timecodeRef.current) {
            const currentFormatted = targetTime.toFixed(1).padStart(4, '0');
            const totalFormatted = dur.toFixed(1).padStart(4, '0');
            timecodeRef.current.textContent = `00:${currentFormatted}s / 00:${totalFormatted}s`;
          }

          // Determine current phase from targetTime
          let phase = 0;
          if (targetTime >= 8.5) phase = 3;
          else if (targetTime >= 6.5) phase = 2;
          else if (targetTime >= 4.5) phase = 1;
          else phase = 0;

          if (phase !== currentPhaseRef.current) {
            currentPhaseRef.current = phase;
            setActivePhaseIndex(phase);

            // Dynamically tint ambient glow for exhaust / rear phases
            if (glowRef.current) {
              glowRef.current.style.background = CINEMATIC_PHASES[phase].glowStyle;
            }
          }
        }
      });

      // Sort all triggers by DOM order so pinned heights propagate correctly to downstream sections
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
    const targetTime = CINEMATIC_PHASES[index].startTime + 0.1;
    const targetProgress = Math.min(Math.max(targetTime / dur, 0), 1);

    const st = scrollTriggerInstance.current;
    const targetScrollY = st.start + (st.end - st.start) * targetProgress;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }, [videoDuration]);

  const activePhase = CINEMATIC_PHASES[activePhaseIndex];
  const ActiveIcon = activePhase.icon;

  return (
    <section
      ref={containerRef}
      id="cinematic-motion"
      className="relative w-full h-screen overflow-hidden bg-[#070707] text-[#F2F1ED] select-none border-t border-hairline flex flex-col justify-between p-4 sm:p-6 lg:p-8"
    >
      {/* Dynamic Atmospheric Backdrop Glow that reflects car lighting */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          background: activePhase.glowStyle
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-25 pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* TOP STATUS BAR (Minimal Forge-Style Header) */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.08]">
        {/* Brand & Kicker */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div>
            <span className="text-[10px] sm:text-xs font-tech tracking-[0.25em] text-white uppercase font-bold">
              {siteConfig.brand.name}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-zinc-500 font-tech uppercase tracking-[0.2em] ml-2 pl-2 border-l border-zinc-800">
              CINEMATIC MOTION SEQUENCE
            </span>
          </div>
        </div>

        {/* Timecode & Mode Indicator */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[9px] font-tech uppercase tracking-[0.22em] text-zinc-400">
              SCENE:
            </span>
            <span className="text-[10px] font-tech text-white uppercase tracking-[0.18em]">
              {activePhase.title}
            </span>
          </div>

          <div
            ref={timecodeRef}
            className="font-tech text-[10px] sm:text-xs tracking-[0.15em] text-zinc-400 tabular-nums px-2 py-0.5 rounded bg-black/40 border border-white/5"
          >
            00:00.0s / 00:12.2s
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-tech text-zinc-500 uppercase tracking-[0.2em]">
            <span>OTTAPALAM ATELIER</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CINEMATIC STAGE: CENTER VIDEO WITH FLANKING EDITORIAL TELEMETRY */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 py-3 sm:py-5 min-h-0">
        
        {/* ----------------------------------------------------------------------- */}
        {/* DESKTOP LEFT FLANK: EDITORIAL TYPOGRAPHY & MANIFESTO */}
        {/* ----------------------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col justify-center flex-1 max-w-sm xl:max-w-md text-left select-none pr-4">
          {/* Kicker Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] w-max mb-5">
            <Sparkles className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-tech tracking-[0.25em] uppercase text-zinc-300">
              SCROLL CHOREOGRAPHY
            </span>
          </div>

          {/* Oversized Headline Requested by User */}
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-heading font-black uppercase tracking-tight leading-[0.95] text-white">
            BUILT ON PASSION.
            <br />
            <span className="text-zinc-500">PERFECTED BY PRECISION.</span>
          </h2>

          {/* Editorial Context */}
          <p className="mt-5 text-sm xl:text-base text-zinc-400 font-light leading-relaxed">
            Experience the physical presence of high-performance automotive craft. As you scroll, every curve, light reflection, combustion pulse, and forged contour unfolds in synchronized motion.
          </p>

          {/* Dynamic Active Phase Highlight Card */}
          <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ActiveIcon className="w-4 h-4 text-white" />
                <span className="text-[10px] font-tech uppercase tracking-[0.25em] text-zinc-300 font-bold">
                  {activePhase.kicker}
                </span>
              </div>
              <span className="text-[10px] font-tech text-zinc-500 uppercase">
                {activePhase.number} / 04
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activePhase.desc}
            </p>
            <div className="mt-3 pt-2 border-t border-white/[0.04] text-[9px] font-tech uppercase tracking-[0.18em] text-zinc-500 flex items-center justify-between">
              <span>{activePhase.spec}</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER: THE 9:16 CINEMATIC VIDEO PORTAL */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative flex items-center justify-center flex-shrink-0 h-full max-h-[68vh] sm:max-h-[74vh] lg:max-h-[78vh] xl:max-h-[82vh]">
          
          {/* Viewfinder Outer Housing with Ambient Rim Glow */}
          <div className="relative h-full aspect-[9/16] rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.7)] group">
            
            {/* Inner Video Container */}
            <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-black">
              
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src="/videos/evoke-car-cinematic.mp4"
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                className="w-full h-full object-cover object-center select-none pointer-events-none transform-gpu"
              />

              {/* Subtle Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none z-10" />

              {/* Viewfinder Reticle Corners */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-white/40 pointer-events-none z-20" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/40 pointer-events-none z-20" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-white/40 pointer-events-none z-20" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-white/40 pointer-events-none z-20" />

              {/* Viewfinder Top HUD Overlay inside video */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between text-[9px] font-tech text-white/70 uppercase tracking-[0.2em] pointer-events-none z-20">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>REC // 4K 60P</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                  <span>EVOKE.STUDIO</span>
                </div>
              </div>

              {/* Viewfinder Mobile HUD Overlay inside video (Bottom) */}
              <div className="lg:hidden absolute bottom-4 inset-x-4 flex flex-col gap-2 z-20">
                <div className="p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-left">
                  <div className="flex items-center justify-between text-[9px] font-tech uppercase tracking-[0.22em] text-zinc-400 mb-1">
                    <span className="text-white font-bold">{activePhase.number} // {activePhase.title}</span>
                    <span className="text-red-400">TOUCH SCROLL</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-light leading-snug line-clamp-2">
                    {activePhase.desc}
                  </p>
                  <div className="mt-2 text-[9px] font-tech uppercase tracking-[0.18em] text-zinc-500">
                    {activePhase.spec}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* DESKTOP RIGHT FLANK: INTERACTIVE PHASE TIMELINE & TELEMETRY */}
        {/* ----------------------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col justify-center flex-1 max-w-sm xl:max-w-md select-none pl-4">
          
          {/* Timeline Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
            <span className="text-[10px] font-tech tracking-[0.25em] uppercase text-zinc-400 font-bold">
              TIMELINE CHOREOGRAPHY
            </span>
            <span className="text-[10px] font-tech text-zinc-500 uppercase tracking-[0.2em]">
              BIDIRECTIONAL SCRUB
            </span>
          </div>

          {/* Stepper Phases List */}
          <div className="space-y-3">
            {CINEMATIC_PHASES.map((phase, idx) => {
              const isActive = activePhaseIndex === idx;
              const PhaseIcon = phase.icon;

              return (
                <button
                  key={phase.id}
                  onClick={() => handleJumpToPhase(idx)}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 group cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.05] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                      : 'bg-transparent border-white/[0.05] hover:border-white/15 opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-tech font-bold tracking-widest ${
                          isActive ? 'text-white' : 'text-zinc-600'
                        }`}
                      >
                        {phase.number}
                      </span>
                      <div>
                        <h4
                          className={`text-xs font-heading font-bold tracking-wide uppercase transition-colors ${
                            isActive ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {phase.title}
                        </h4>
                        <span className="text-[9px] font-tech uppercase tracking-[0.18em] text-zinc-500 block mt-0.5">
                          {phase.startTime.toFixed(1)}s — {phase.endTime.toFixed(1)}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PhaseIcon
                        className={`w-3.5 h-3.5 transition-colors ${
                          isActive ? 'text-red-500' : 'text-zinc-600'
                        }`}
                      />
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          isActive ? 'bg-red-500 scale-125' : 'bg-zinc-700'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scrub Progress Bar Widget */}
          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between text-[9px] font-tech uppercase tracking-[0.2em] text-zinc-400 mb-2">
              <span>SCROLL TIMELINE PROGRESS</span>
              <span className="text-white">SYNCHRONIZED</span>
            </div>

            {/* Progress Track */}
            <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-white transition-[width] duration-75"
                style={{ width: '0%' }}
              />
            </div>

            <div className="flex items-center justify-between mt-2.5 text-[9px] font-tech text-zinc-500">
              <span>0.0s (FRONT)</span>
              <span>6.5s (EXHAUST)</span>
              <span>12.2s (WHEEL)</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM NAVIGATION & SCROLL HELPER */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full pt-3 sm:pt-4 border-t border-white/[0.08] flex items-center justify-between">
        {/* Left Kicker on Mobile */}
        <div className="text-[10px] sm:text-xs font-tech text-zinc-400 uppercase tracking-[0.2em]">
          <span className="text-white font-bold">EVOKE GARAGE</span> • OTTAPALAM
        </div>

        {/* Mobile Progress Bar (Visible only on mobile/tablet) */}
        <div className="lg:hidden flex-1 max-w-[140px] sm:max-w-[200px] mx-3">
          <div className="relative w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              ref={mobileProgressBarRef}
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-[width] duration-75"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        {/* Right Scroll Prompt */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-tech tracking-[0.2em] text-zinc-400 uppercase">
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 animate-bounce" />
        </div>
      </footer>

    </section>
  );
}
