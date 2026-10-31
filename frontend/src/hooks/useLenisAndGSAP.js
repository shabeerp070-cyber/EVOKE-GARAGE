import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== 'undefined') {
  window.__ScrollTrigger = ScrollTrigger;
  window.__gsap = gsap;
}

export function useLenisAndGSAP() {
  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Initialize Lenis with device-appropriate settings
    const lenis = new Lenis({
      duration: isTouch ? 0.9 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // Let native touch momentum handle mobile smoothly
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    });

    // Synchronize Lenis with GSAP ScrollTrigger & update global progress bar
    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      const bar = document.getElementById('scroll-progress-bar');
      if (bar && e.limit > 0) {
        bar.style.transform = `scaleX(${(e.scroll / e.limit).toFixed(4)})`;
      }
    });

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(500, 33);

    // Refresh ScrollTrigger when layout or window orientation stabilizes
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);
}
