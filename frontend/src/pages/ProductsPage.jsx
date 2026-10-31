import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { getPublicProducts } from '../services/productApi';

export default function ProductsPage({ onBackHome, onOpenBooking, onSelectProduct }) {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);

  // Attempt to sync with live backend products if available; fallback seamlessly to sample products
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveProducts() {
      try {
        const liveItems = await getPublicProducts();
        if (isMounted && Array.isArray(liveItems) && liveItems.length > 0) {
          const formatted = liveItems.map((item) => ({
            id: item._id || item.id,
            name: item.name,
            category: item.category,
            partNumber: item.partNumber,
            description: item.description,
            compatibility: item.compatibility,
            stockStatus: item.stockStatus,
            specifications: item.specifications || (item.compatibility ? [`Fitment: ${item.compatibility}`] : []),
            price: typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : item.price,
            image: item.image || '/images/showcase-1.jpg',
            gallery: [item.image || '/images/showcase-1.jpg'],
          }));
          setProducts(formatted);
        }
      } catch {
        // Retain SAMPLE_PRODUCTS if backend is offline or empty
      }
    }

    fetchLiveProducts();
    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR (BACK TO HOME & BRAND IDENTITY)                     */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            onClick={onBackHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
            aria-label="Return to EVOKE GARAGE home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/5 border border-black/10 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={siteConfig.brand.logoCircle}
                alt="EVOKE GARAGE"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <span className="font-heading font-black tracking-tight text-black text-sm sm:text-base block group-hover:text-zinc-600 transition-colors">
                EVOKE GARAGE
              </span>
              <span className="text-[9px] sm:text-[10px] font-tech text-[#666666] tracking-widest uppercase block">
                AUTOMOTIVE ATELIER
              </span>
            </div>
          </button>

          {/* Back to Home Button */}
          <button
            onClick={onBackHome}
            className="!min-h-[40px] sm:!min-h-[46px] px-3.5 sm:px-6 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider flex items-center gap-2 bg-black text-white hover:bg-zinc-800 border border-black transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>BACK TO HOME</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PAGE HERO & HEADER                                                     */}
      {/* ========================================================================= */}
      <main className="pt-24 sm:pt-36 pb-20 sm:pb-32 relative">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-tech text-[#666666] uppercase tracking-widest mb-4 sm:mb-6">
            <button
              onClick={onBackHome}
              className="hover:text-black transition-colors cursor-pointer"
            >
              HOME
            </button>
            <span>/</span>
            <span className="text-black font-bold">PERFORMANCE COMPONENTS</span>
          </div>

          {/* Section Heading & Subtitle */}
          <div className="mb-8 sm:mb-14 border-b border-black/10 pb-6 sm:pb-10">
            <div className="flex items-center gap-2.5 mb-2.5 sm:mb-4">
              <span className="w-5 sm:w-8 h-[1px] bg-black" />
              <span className="text-[11px] sm:text-sm font-tech uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#666666] font-bold">
                EVOKE GARAGE // HARDWARE ATELIER
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight uppercase leading-[1.05] sm:leading-[0.96] text-black">
              PERFORMANCE COMPONENTS
            </h1>

            <p className="mt-2 sm:mt-4 text-zinc-700 text-xs sm:text-base lg:text-lg font-normal max-w-2xl leading-relaxed">
              Explore our automotive products and genuine components.
            </p>

            <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-3 py-1 bg-black/5 border border-black/10 text-[10px] sm:text-xs font-tech uppercase tracking-wider text-zinc-700">
              <Sparkles className="w-3 h-3 text-black" />
              <span>TAP ANY COMPONENT FOR DETAILED SPECIFICATIONS & DIRECT ENQUIRY</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. CLEAN 2-COLUMN MOBILE PRODUCT GRID (EXACTLY 2 PER ROW ON MOBILE)       */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct?.(product.id || product._id)}
                className="group bg-white hover:bg-zinc-50/80 border border-black/10 hover:border-black/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] cursor-pointer select-none active:scale-[0.98]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProduct?.(product.id || product._id);
                  }
                }}
              >
                {/* 1. Large Product Image with Consistent Aspect Ratio */}
                <div className="relative w-full aspect-square sm:aspect-[4/3] bg-zinc-100 overflow-hidden border-b border-black/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                  {/* 5. Optional Availability Label (ONLY if actual stock data exists) */}
                  {product.stockStatus && product.stockStatus.trim() && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-white/95 backdrop-blur-md border border-black/15 text-[9px] sm:text-[11px] font-tech uppercase tracking-wider text-black font-bold flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{product.stockStatus}</span>
                    </div>
                  )}

                  {/* Subtle tap/hover indicator badge */}
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 p-1 sm:px-2 sm:py-1 bg-white/90 backdrop-blur-sm border border-black/15 text-[9px] sm:text-[10px] font-tech text-black uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shadow-sm">
                    <span className="hidden sm:inline">VIEW</span>
                    <ArrowUpRight className="w-3 h-3 text-black" />
                  </div>
                </div>

                {/* Content Group: Name, Description, Price */}
                <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Label (if available) */}
                    {product.category && (
                      <span className="text-[9px] sm:text-[11px] font-tech text-[#666666] uppercase tracking-wider block mb-1 font-semibold truncate">
                        {product.category}
                      </span>
                    )}

                    {/* 2. Product Name - Easy to read on mobile */}
                    <h3 className="text-xs sm:text-sm md:text-base font-heading font-black tracking-tight text-black uppercase leading-snug line-clamp-2 group-hover:text-zinc-700 transition-colors">
                      {product.name}
                    </h3>

                    {/* 3. Short Description */}
                    <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-zinc-600 line-clamp-2 leading-relaxed font-sans">
                      {product.description}
                    </p>
                  </div>

                  {/* 4. Price or "Contact for Price" */}
                  <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-black/10 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] sm:text-[10px] font-tech uppercase tracking-wider text-[#777777] block font-bold leading-none mb-0.5">
                        VALUATION
                      </span>
                      <span className="text-xs sm:text-sm md:text-base font-tech font-bold text-black tracking-tight">
                        {product.price || 'Contact for Price'}
                      </span>
                    </div>

                    <div className="text-[9px] sm:text-xs font-tech text-zinc-500 group-hover:text-black uppercase tracking-wider flex items-center gap-0.5 transition-colors">
                      <span className="hidden xs:inline">DETAILS</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 4. RETURN TO ATELIER CALL-TO-ACTION                                       */}
          {/* ========================================================================= */}
          <div className="mt-16 sm:mt-24 p-6 sm:p-10 bg-zinc-50 border border-black/10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 shadow-sm">
            <div>
              <span className="text-[10px] sm:text-xs font-tech uppercase tracking-[0.2em] text-[#666666] block mb-1 font-bold">
                EVOKE GARAGE — OTTAPALAM ATELIER
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-black uppercase text-black tracking-tight">
                LOOKING FOR BESPOKE FITMENT OR WORKSHOP SERVICES?
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 max-w-xl">
                Consult with our master technicians for paintwork, dent repairs, cooling overhauls, or electronic diagnostics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => onOpenBooking?.()}
                className="min-h-[44px] px-5 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider bg-black text-white hover:bg-zinc-800 border border-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <span>BOOK WORKSHOP SERVICE</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={onBackHome}
                className="min-h-[44px] px-5 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-100 border border-black/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO HOME</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. MINIMAL LUXURY FOOTER                                                  */}
      {/* ========================================================================= */}
      <footer className="border-t border-black/10 py-8 bg-[#F8F8F8] text-[#666666] text-[10px] sm:text-xs font-tech uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} EVOKE GARAGE. ALL RIGHTS RESERVED. OTTAPALAM, PALAKKAD, KERALA.
          </div>
          <button
            onClick={onBackHome}
            className="hover:text-black transition-colors cursor-pointer underline underline-offset-4"
          >
            RETURN TO MAIN SHOWCASE
          </button>
        </div>
      </footer>
    </div>
  );
}
