import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ShieldCheck, Wrench, Cpu, Loader2 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { openProductEnquiryWhatsApp, getSinglePublicProduct } from '../services/productApi';

export default function ProductDetailsPage({
  productId,
  product: initialProduct,
  onBackToProducts,
  onOpenBooking,
}) {
  const [product, setProduct] = useState(() => {
    if (initialProduct) return initialProduct;
    if (productId) {
      return SAMPLE_PRODUCTS.find((p) => p.id === productId || p._id === productId) || null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!product && Boolean(productId));
  const [activeImage, setActiveImage] = useState(product?.image || '');

  // Fetch or sync product details when productId changes or upon direct page refresh
  useEffect(() => {
    let isMounted = true;

    async function resolveProduct() {
      if (!productId && !initialProduct) {
        setIsLoading(false);
        return;
      }

      // 1. Instant match in sample products
      const sampleMatch = SAMPLE_PRODUCTS.find(
        (p) => p.id === productId || p._id === productId
      );

      if (sampleMatch && isMounted) {
        setProduct(sampleMatch);
        setActiveImage(sampleMatch.image);
        setIsLoading(false);
      }

      // 2. Fetch from backend API if available
      if (productId) {
        try {
          const liveItem = await getSinglePublicProduct(productId);
          if (isMounted && liveItem) {
            const formatted = {
              id: liveItem._id || liveItem.id,
              name: liveItem.name,
              category: liveItem.category,
              partNumber: liveItem.partNumber,
              description: liveItem.description,
              compatibility: liveItem.compatibility,
              stockStatus: liveItem.stockStatus,
              specifications: liveItem.specifications || (liveItem.compatibility ? [`Compatibility: ${liveItem.compatibility}`] : []),
              price: typeof liveItem.price === 'number' ? `₹${liveItem.price.toLocaleString('en-IN')}` : liveItem.price,
              image: liveItem.image || '/images/showcase-1.jpg',
              gallery: [liveItem.image || '/images/showcase-1.jpg'],
            };
            setProduct(formatted);
            setActiveImage(formatted.image);
            setIsLoading(false);
          }
        } catch {
          // If backend is offline or product not found in API, retain sampleMatch
          if (isMounted) setIsLoading(false);
        }
      }
    }

    resolveProduct();
    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      isMounted = false;
    };
  }, [productId, initialProduct]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
        <p className="text-xs font-tech tracking-widest uppercase text-zinc-600">
          LOADING ATELIER COMPONENT TELEMETRY...
        </p>
      </div>
    );
  }

  // Not found fallback
  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight uppercase mb-4 text-black">
          PRODUCT NOT FOUND
        </h2>
        <p className="text-zinc-600 max-w-md mb-8">
          The requested automotive component could not be located or may have been retired from the active atelier catalogue.
        </p>
        <button
          onClick={onBackToProducts}
          className="px-6 py-3 bg-black text-white hover:bg-zinc-800 font-tech font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO PRODUCTS</span>
        </button>
      </div>
    );
  }

  // Gallery array: include main image + any additional gallery views
  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : product.image
      ? [product.image]
      : [];

  // Determine price display: price or "Contact for Price" if unconfirmed
  const formatPrice = () => {
    if (product.price === null || product.price === undefined || product.price === '' || product.price === 0) {
      return 'Contact for Price';
    }
    if (typeof product.price === 'string') {
      return product.price.trim() || 'Contact for Price';
    }
    if (typeof product.price === 'number') {
      return `₹${product.price.toLocaleString('en-IN')}`;
    }
    return 'Contact for Price';
  };

  const priceDisplay = formatPrice();

  // Availability status only when actual stock information exists
  const hasStockInfo = Boolean(product.stockStatus && product.stockStatus.trim());

  const getStockBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('in stock')) {
      return 'bg-emerald-50 border-emerald-500/40 text-emerald-700';
    }
    if (s.includes('pre-order') || s.includes('preorder')) {
      return 'bg-amber-50 border-amber-500/40 text-amber-800';
    }
    if (s.includes('out of stock')) {
      return 'bg-zinc-100 border-zinc-400 text-zinc-600';
    }
    return 'bg-zinc-100 border-black/20 text-black';
  };

  const handleWhatsAppClick = () => {
    openProductEnquiryWhatsApp(product);
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR (CLEAR BACK TO PRODUCTS & BRAND IDENTITY)           */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Back to Products Button */}
          <button
            onClick={onBackToProducts}
            className="!min-h-[40px] sm:!min-h-[46px] px-3.5 sm:px-6 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider flex items-center gap-2 bg-black text-white hover:bg-zinc-800 border border-black transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
            aria-label="Back to Products"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>BACK TO PRODUCTS</span>
          </button>

          {/* Atelier Brand Tag */}
          <div className="hidden sm:flex items-center gap-3 text-right">
            <div>
              <span className="font-heading font-black tracking-tight text-black text-sm block">
                EVOKE GARAGE
              </span>
              <span className="text-[10px] font-tech text-[#666666] tracking-widest uppercase block">
                PERFORMANCE ATELIER · OTTAPALAM
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 p-1 overflow-hidden">
              <img
                src={siteConfig.brand.logoCircle}
                alt="EVOKE GARAGE"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN PRODUCT DETAILS CONTENT                                           */}
      {/* ========================================================================= */}
      <main className="pt-24 sm:pt-36 pb-24 sm:pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center flex-wrap gap-2 text-xs font-tech text-[#666666] uppercase tracking-widest mb-8 sm:mb-10">
            <button
              onClick={onBackToProducts}
              className="hover:text-black transition-colors cursor-pointer"
            >
              PRODUCTS
            </button>
            <span>/</span>
            {product.category && (
              <>
                <span className="text-zinc-500">{product.category}</span>
                <span>/</span>
              </>
            )}
            <span className="text-black font-bold truncate max-w-[240px] sm:max-w-md">
              {product.name}
            </span>
          </nav>

          {/* Product Presentation Layout: Left Image Showcase / Right Specifications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* ------------------------------------------------------------------- */}
            {/* A. PRODUCT IMAGERY / GALLERY SHOWCASE (LEFT - 7 COLS)              */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Primary Large Image */}
              <div className="relative w-full h-[320px] sm:h-[460px] md:h-[520px] bg-zinc-100 border border-black/10 overflow-hidden shadow-lg">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-500 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Stock Status Badge Overlay (Only when actual stock info exists) */}
                {hasStockInfo && (
                  <div
                    className={`absolute top-4 left-4 px-3.5 py-1.5 border text-xs font-tech uppercase tracking-wider backdrop-blur-md font-bold flex items-center gap-2 shadow-sm ${getStockBadgeStyle(
                      product.stockStatus
                    )}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span>{product.stockStatus}</span>
                  </div>
                )}

                {/* Atelier Emblem Watermark */}
                <div className="absolute bottom-4 right-4 text-[10px] font-tech uppercase tracking-[0.2em] text-black/40 pointer-events-none font-bold">
                  EVOKE GARAGE // GENUINE
                </div>
              </div>

              {/* Optional Additional Images Gallery Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 border transition-all cursor-pointer overflow-hidden shadow-sm ${
                        activeImage === imgUrl
                          ? 'border-black ring-2 ring-black/20 scale-102'
                          : 'border-black/15 hover:border-black/40 opacity-75 hover:opacity-100'
                      }`}
                      aria-label={`View product image ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* B. PRODUCT DETAILS & WHATSAPP ACTION (RIGHT - 5 COLS)               */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              
              {/* Category & Part Number Header */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {product.category && (
                  <span className="px-3 py-1 bg-black/5 border border-black/15 text-xs font-tech uppercase tracking-wider text-zinc-800 font-semibold">
                    {product.category}
                  </span>
                )}
                {product.partNumber && (
                  <span className="text-xs font-tech text-[#666666] tracking-widest uppercase">
                    SKU: {product.partNumber}
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black uppercase text-black tracking-tight leading-[1.1] mb-5">
                {product.name}
              </h1>

              {/* Price Block (Price or "Contact for Price" if unconfirmed) */}
              <div className="p-5 bg-zinc-50 border border-black/10 mb-6 shadow-sm">
                <span className="text-xs font-tech uppercase tracking-wider text-[#666666] block mb-1 font-bold">
                  ATELIER PRICING / VALUATION
                </span>
                <div className="text-2xl sm:text-3xl font-tech font-bold text-black tracking-tight">
                  {priceDisplay}
                </div>
                <p className="mt-1 text-[11px] font-tech text-zinc-500 uppercase tracking-wider">
                  Pricing includes workshop inspection and fitment verification at Ottapalam cleanroom.
                </p>
              </div>

              {/* Full Product Description */}
              <div className="mb-7">
                <h3 className="text-xs font-tech uppercase tracking-[0.2em] text-[#666666] mb-2 font-bold">
                  PRODUCT OVERVIEW
                </h3>
                <p className="text-zinc-700 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line">
                  {product.description || 'Full technical overview for this performance component is available directly from our workshop technicians upon inquiry.'}
                </p>
              </div>

              {/* Specifications & Compatibility Details (Only if available) */}
              {(product.compatibility || (Array.isArray(product.specifications) && product.specifications.length > 0)) && (
                <div className="mb-8 space-y-4 pt-5 border-t border-black/10">
                  
                  {/* Vehicle Compatibility */}
                  {product.compatibility && (
                    <div className="p-4 bg-zinc-50 border border-black/10 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-tech uppercase tracking-wider text-black font-bold mb-1.5">
                        <Wrench className="w-3.5 h-3.5 text-zinc-600" />
                        <span>VEHICLE COMPATIBILITY</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-700 font-tech">
                        {product.compatibility}
                      </p>
                    </div>
                  )}

                  {/* Technical Specifications */}
                  {Array.isArray(product.specifications) && product.specifications.length > 0 && (
                    <div>
                      <h4 className="text-xs font-tech uppercase tracking-[0.2em] text-[#666666] mb-3 font-bold flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-black" />
                        <span>ENGINEERING SPECIFICATIONS</span>
                      </h4>
                      <ul className="space-y-2">
                        {product.specifications.map((spec, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 font-sans"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Prominent WhatsApp Enquiry Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full min-h-[52px] bg-black text-white hover:bg-zinc-800 border border-black font-tech font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.01]"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span>ENQUIRE VIA WHATSAPP</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-center text-[11px] font-tech text-[#666666] uppercase tracking-wider pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>DIRECT DISPATCH CONSULTATION WITH OTTAPALAM ATELIER</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. WORKSHOP ASSISTANCE & RETURN BANNER                                */}
          {/* ===================================================================== */}
          <div className="mt-20 sm:mt-28 p-8 sm:p-10 bg-zinc-50 border border-black/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs font-tech uppercase tracking-[0.25em] text-[#666666] block mb-1.5 font-bold">
                EVOKE GARAGE — BESPOKE FABRICATION & FITMENT
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-black uppercase text-black tracking-tight">
                REQUIRE CUSTOM INSTALLATION OR CHASSIS TUNING?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-xl">
                Our atelier technicians provide professional fitment, alignment, and diagnostic testing for all supplied hardware.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => onOpenBooking?.(product.name)}
                className="min-h-[46px] px-6 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider bg-black text-white hover:bg-zinc-800 border border-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <span>BOOK FITMENT APPOINTMENT</span>
              </button>

              <button
                onClick={onBackToProducts}
                className="min-h-[46px] px-6 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-100 border border-black/20 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO PRODUCTS</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-black/10 py-8 bg-[#F8F8F8] text-[#666666] text-xs font-tech uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} EVOKE GARAGE. ALL RIGHTS RESERVED. OTTAPALAM, PALAKKAD, KERALA.
          </div>
          <button
            onClick={onBackToProducts}
            className="hover:text-black transition-colors cursor-pointer underline underline-offset-4"
          >
            RETURN TO PRODUCTS CATALOGUE
          </button>
        </div>
      </footer>
    </div>
  );
}
