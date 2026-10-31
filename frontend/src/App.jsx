import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLenisAndGSAP } from './hooks/useLenisAndGSAP';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CarShowcase from './components/CarShowcase';
import About from './components/About';
import ServicesShowcase from './components/ServicesShowcase';
import BmwDriftAnimation from './components/BmwDriftAnimation';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ServiceModal from './components/ServiceModal';
import WhatsAppButton from './components/WhatsAppButton';
import AdminPanel from './components/AdminPanel';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

// Helper to extract product ID from /products/:id or #products/:id
const parseProductIdFromUrl = () => {
  if (typeof window === 'undefined') return null;
  const pathMatch = window.location.pathname.match(/^\/products\/([^/?#]+)/);
  if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]);

  const hashMatch = window.location.hash.match(/^#\/?products\/([^/?#]+)/);
  if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]);

  const params = new URLSearchParams(window.location.search);
  const qProd = params.get('product') || params.get('id');
  if (qProd) return qProd;

  return null;
};

export default function App() {
  // Path-based routing for secure isolated Admin Panel & separate Products Page
  const [isAdminRoute, setIsAdminRoute] = useState(
    typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin'))
  );

  const [isProductsRoute, setIsProductsRoute] = useState(
    typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/products') || window.location.hash.startsWith('#products'))
  );

  const [selectedProductId, setSelectedProductId] = useState(() => parseProductIdFromUrl());

  // Activate Lenis Smooth Scroll synced with GSAP ScrollTrigger (only on public site)
  useLenisAndGSAP();

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const handleRouteChange = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin');
      setIsAdminRoute(isAdm);

      const isProd =
        window.location.pathname.startsWith('/products') ||
        window.location.hash.startsWith('#products');
      setIsProductsRoute(isProd);

      setSelectedProductId(parseProductIdFromUrl());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const handleOpenBooking = (service = null) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const handleNavigateProducts = () => {
    window.history.pushState({}, '', '/products');
    setIsProductsRoute(true);
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectProduct = (productId) => {
    window.history.pushState({}, '', `/products/${productId}`);
    setSelectedProductId(productId);
    setIsProductsRoute(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToProducts = () => {
    window.history.pushState({}, '', '/products');
    setSelectedProductId(null);
    setIsProductsRoute(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateHome = () => {
    window.history.pushState({}, '', '/');
    setIsProductsRoute(false);
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // ==========================================================================
  // ROUTE 1: PROTECTED ADMINISTRATIVE ATELIER CONSOLE (/admin)
  // Completely isolated from the public customer experience
  // ==========================================================================
  if (isAdminRoute) {
    return <AdminPanel onExitToWebsite={handleExitAdmin} />;
  }

  // ==========================================================================
  // ROUTE 2: DEDICATED PRODUCTS CATALOGUE & PRODUCT DETAILS PAGES (/products)
  // ==========================================================================
  if (isProductsRoute) {
    if (selectedProductId) {
      return (
        <>
          <ProductDetailsPage
            productId={selectedProductId}
            onBackToProducts={handleBackToProducts}
            onOpenBooking={(service) => handleOpenBooking(service)}
          />
          <ServiceModal
            isOpen={isModalOpen}
            onClose={handleCloseBooking}
            initialService={selectedService}
          />
        </>
      );
    }

    return (
      <>
        <ProductsPage
          onBackHome={handleNavigateHome}
          onSelectProduct={handleSelectProduct}
          onOpenBooking={(service) => handleOpenBooking(service)}
        />
        <ServiceModal
          isOpen={isModalOpen}
          onClose={handleCloseBooking}
          initialService={selectedService}
        />
      </>
    );
  }

  // ==========================================================================
  // ROUTE 2: PUBLIC CUSTOMER WEBSITE (/)
  // ==========================================================================
  return (
    <div className="relative min-h-screen bg-[#070707] text-zinc-100 selection:bg-white selection:text-black">
      {/* Cinematic Automotive Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Global Scroll Progress Bar - Monochrome White */}
      <div
        id="scroll-progress-bar"
        className="fixed top-0 left-0 right-0 h-[2px] bg-white z-50 pointer-events-none transform origin-left shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Minimalist Forge-Style Navigation */}
      <Navbar onOpenBooking={() => handleOpenBooking()} />

      <main className="relative">
        {/* Continuous BMW Drift Trajectory across Three Pillars & Core Disciplines */}
        <BmwDriftAnimation />

        {/* A. FULL-SCREEN CINEMATIC HERO */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onNavigateProducts={handleNavigateProducts}
        />

        {/* B. IMMERSIVE CAR SHOWCASE (Scroll-Controlled Video Progression) */}
        <CarShowcase />

        {/* C. ANIMATED BRAND SECTION (Atelier Manifesto & Precision Craft) */}
        <About />

        {/* D. FOUR AUTOMOTIVE SERVICE SECTIONS (Master Disciplines) */}
        <ServicesShowcase onSelectService={(service) => handleOpenBooking(service)} />

        {/* E. CONTACT SECTION (Consultation & Location) */}
        <ContactSection />
      </main>

      {/* Luxury Footer */}
      <Footer onOpenBooking={() => handleOpenBooking()} />

      {/* Service Consultation Dialog */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseBooking}
        initialService={selectedService}
      />

      {/* Floating Direct WhatsApp Button */}
      <WhatsAppButton onOpenBooking={() => handleOpenBooking()} />
    </div>
  );
}
