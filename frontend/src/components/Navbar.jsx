import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Phone, MessageSquare } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Philosophy', href: '#about' },
    { name: 'Showcase', href: '#showcase' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-400 select-none ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 py-3 sm:py-4 shadow-xl shadow-black/80'
            : 'bg-gradient-to-b from-black via-black/80 to-transparent py-4 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center gap-3 sm:gap-3.5 group min-h-[44px]">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-white/10 ring-1 ring-white/20 group-hover:ring-white/60 transition-all flex-shrink-0">
              <img
                src={siteConfig.brand.logoCircle}
                alt="EVOKE GARAGE Official Emblem"
                className="w-full h-full object-contain rounded-full transition-transform duration-500 group-hover:scale-105"
                width="44"
                height="44"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-heading font-black tracking-[0.16em] sm:tracking-[0.22em] text-base sm:text-xl text-white uppercase leading-none whitespace-nowrap">
                {siteConfig.brand.name}
              </span>
              <span className="text-[9px] sm:text-xs font-tech text-zinc-300 tracking-[0.10em] sm:tracking-[0.2em] uppercase mt-1 font-semibold whitespace-nowrap">
                OTTAPALAM · PALAKKAD · KERALA
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links (Visible on lg: 1024px+) */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-xs xl:text-sm font-tech font-bold uppercase tracking-[0.22em] text-zinc-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="hover:text-white transition-colors relative py-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-tech uppercase tracking-widest text-[#888888] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>ATELIER OPEN // 09:00 - 19:00</span>
            </div>

            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-2 text-sm font-tech font-semibold tracking-widest text-zinc-300 hover:text-white transition-colors py-2"
              title="Click to Call EVOKE GARAGE"
            >
              <Phone className="w-4 h-4 text-[#888888]" />
              <span>{siteConfig.contact.phone}</span>
            </a>

            <button
              onClick={() => onOpenBooking?.()}
              className="px-6 py-2.5 min-h-[44px] bg-black text-white border border-white font-tech text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none hover:bg-white hover:text-black transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span>INQUIRE</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile & Tablet Header Controls (Visible below lg) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            <button
              onClick={() => onOpenBooking?.()}
              className="px-4 py-2 min-h-[42px] bg-black text-white border border-white font-tech text-xs sm:text-sm uppercase tracking-wider font-bold rounded-none hover:bg-white hover:text-black active:scale-95 transition-all duration-300 cursor-pointer"
            >
              INQUIRE
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center text-white bg-black border border-white/20 rounded-none hover:border-white focus:outline-none cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Refined Full-Screen Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 lg:hidden bg-black/98 backdrop-blur-2xl flex flex-col justify-between pt-24 pb-8 px-6 sm:px-8 overflow-y-auto text-white"
          >
            <div className="space-y-6">
              {/* Header Branding in Drawer */}
              <div className="border-b border-white/10 pb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full p-0.5 bg-white/10 ring-1 ring-white/20 flex-shrink-0">
                  <img
                    src={siteConfig.brand.logoCircle}
                    alt="EVOKE GARAGE"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-widest uppercase">
                    {siteConfig.brand.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-tech text-zinc-300 tracking-wider uppercase font-medium mt-0.5">
                    OTTAPALAM · PALAKKAD · KERALA
                  </p>
                </div>
              </div>

              {/* Navigation Links with Large Tap Targets */}
              <nav className="flex flex-col space-y-2 py-2">
                {navLinks.map((link, idx) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-wider text-white hover:text-zinc-300 py-3.5 px-2 flex items-center justify-between border-b border-white/10 active:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-3.5">
                      <span className="text-sm font-tech font-bold text-[#888888]">0{idx + 1}</span>
                      <span>{link.name}</span>
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-[#888888]" />
                  </a>
                ))}
              </nav>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="space-y-3 pt-6 border-t border-white/10 mt-4">
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="w-full min-h-[50px] py-3.5 px-4 bg-black border border-white/20 text-white font-tech text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 hover:bg-white hover:text-black transition-all duration-300"
              >
                <Phone className="w-4 h-4 text-[#888888]" />
                <span>Call: {siteConfig.contact.phone}</span>
              </a>

              <a
                href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(
                  siteConfig.contact.whatsappDefaultMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[50px] py-3.5 px-4 bg-black border border-white/30 text-white font-tech text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 hover:bg-white hover:text-black transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 text-[#888888]" />
                <span>WhatsApp Consultation</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking?.();
                }}
                className="w-full min-h-[50px] py-3.5 px-4 bg-black text-white border border-white font-tech text-sm uppercase tracking-widest font-bold flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              >
                <span>Book Vehicle Intake</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
