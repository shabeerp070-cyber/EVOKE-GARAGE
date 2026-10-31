import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles, Camera } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

gsap.registerPlugin(ScrollTrigger);

export default function WorkshopGallery() {
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const categories = ['All', 'Car Painting', 'Denting & Body Repair', 'Electrical Work', 'Car A/C Work', 'Restoration'];

  const filteredItems = activeCategory === 'All'
    ? siteConfig.gallery
    : siteConfig.gallery.filter((item) => item.category === activeCategory);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation & lock scroll for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, filteredItems.length]);

  // Staggered reveal animation on gallery grid
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      if (gridRef.current && gridRef.current.children.length > 0) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 35, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, [activeCategory]);

  return (
    <section
      ref={containerRef}
      id="gallery"
      className="relative py-24 sm:py-36 bg-[#070707] text-white overflow-hidden border-t border-hairline"
    >
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 border-b border-hairline pb-6 sm:pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1px] bg-red-600" />
              <span className="text-[10px] sm:text-xs font-tech uppercase tracking-[0.25em] sm:tracking-[0.3em] text-zinc-400">
                04 // ATELIER ARCHIVE
              </span>
            </div>

            <h2 className="text-[clamp(1.5rem,5vw,4.5rem)] font-heading font-black tracking-tight uppercase leading-[1.05] sm:leading-[0.98]">
              CRAFT IN MOTION. <br className="hidden sm:inline" />
              <span className="text-zinc-500">WORKSHOP ARCHIVE.</span>
            </h2>
          </div>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-sm font-light leading-relaxed">
            A visual documentation of high-precision panel prep, down-draft spray applications, diagnostics, and automotive care in Ottapalam.
          </p>
        </div>

        {/* Touch-Friendly Horizontally Scrollable Filter Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-3 touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-tech tracking-wider uppercase transition-all duration-300 cursor-pointer whitespace-nowrap active:scale-95 ${
                activeCategory === cat
                  ? 'bg-white text-black font-bold border border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative h-[320px] sm:h-[380px] rounded-xl overflow-hidden bg-[#121212] border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.8)]"
            >
              {/* Image with smooth zoom on hover */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-125 transition-transform duration-700 ease-out group-hover:scale-108 group-hover:brightness-95"
                loading="lazy"
                decoding="async"
              />

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 opacity-80 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

              {/* Viewfinder reticle corners on hover */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-tech uppercase tracking-[0.2em] text-zinc-300">
                  {item.category}
                </span>
              </div>

              {/* Hover Fullscreen Icon */}
              <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Bottom Metadata */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <span className="text-[10px] font-tech text-red-500 tracking-widest uppercase block mb-1">
                  ATELIER ARCHIVE // {item.category.toUpperCase()}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-fadeIn"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation controls */}
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
          >
            <img
              src={filteredItems[lightboxIndex]?.image}
              alt={filteredItems[lightboxIndex]?.title}
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)]"
            />

            {/* Bottom Caption */}
            <div className="mt-4 text-center">
              <span className="text-[10px] font-tech uppercase tracking-[0.25em] text-red-500 block mb-1">
                {filteredItems[lightboxIndex]?.category} • {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <h3 className="text-lg sm:text-xl font-heading font-black text-white uppercase tracking-wide">
                {filteredItems[lightboxIndex]?.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1 max-w-xl mx-auto">
                {filteredItems[lightboxIndex]?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
