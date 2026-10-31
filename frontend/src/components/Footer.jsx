import React from 'react';
import { ArrowUp, ArrowUpRight, Phone, MapPin } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Footer({ onOpenBooking }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black text-white pt-16 sm:pt-24 pb-10 sm:pb-12 border-t border-white/10 select-none overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-12 pb-12 sm:pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-white/10 ring-1 ring-white/20 flex-shrink-0">
                <img
                  src={siteConfig.brand.logoCircle}
                  alt="EVOKE GARAGE Emblem"
                  className="w-full h-full object-contain rounded-full"
                  width="56"
                  height="56"
                />
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl tracking-[0.18em] sm:tracking-[0.2em] text-white uppercase">
                  {siteConfig.brand.name}
                </h3>
                <span className="text-xs sm:text-sm font-tech text-[#888888] tracking-[0.22em] uppercase block mt-1 font-semibold">
                  OTTAPALAM • PALAKKAD • KERALA
                </span>
              </div>
            </div>

            <p className="text-zinc-300 text-sm sm:text-base max-w-md font-normal leading-relaxed">
              PRECISION IN EVERY DETAIL. Delivering high-end automotive care, down-draft painting, dent bodywork, climate systems, and electrical diagnostics.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onOpenBooking?.()}
                className="btn-forge-primary !min-h-[48px] !py-2.5 !px-6 text-xs sm:text-sm font-bold tracking-wider cursor-pointer justify-center"
              >
                <span>BOOK APPOINTMENT</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="btn-forge-outline !min-h-[48px] !py-2.5 !px-6 text-xs sm:text-sm font-bold tracking-wider cursor-pointer justify-center"
              >
                <span>CALL: {siteConfig.contact.phone}</span>
              </a>
            </div>
          </div>

          {/* Services Links */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-tech uppercase tracking-[0.25em] text-[#888888] font-bold">
              CORE DISCIPLINES
            </h4>
            <ul className="space-y-2 text-sm sm:text-base font-tech text-zinc-300">
              {siteConfig.services.map((service) => (
                <li key={service.id}>
                  <a
                    href={`#${service.id}`}
                    className="hover:text-white transition-colors flex items-center justify-between group py-1.5 active:text-white"
                  >
                    <span>{service.index} — {service.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Coordinates */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-tech uppercase tracking-[0.25em] text-[#888888] font-bold">
              ATELIER ADDRESS
            </h4>
            <div className="space-y-3 text-sm sm:text-base font-tech text-zinc-300">
              <div>
                <span className="text-[#888888] block text-xs uppercase font-bold tracking-wider mb-0.5">Garage</span>
                <span className="text-white font-medium">{siteConfig.contact.locationName}</span>
              </div>
              <div>
                <span className="text-[#888888] block text-xs uppercase font-bold tracking-wider mb-0.5">Location</span>
                <span className="text-zinc-200">{siteConfig.contact.formattedAddress}</span>
              </div>
              <div>
                <span className="text-[#888888] block text-xs uppercase font-bold tracking-wider mb-0.5">Direct Phone</span>
                <a href={`tel:${siteConfig.contact.phone}`} className="text-white hover:underline py-0.5 inline-block font-semibold">
                  {siteConfig.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-tech text-[#888888] text-center sm:text-left">
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            © {new Date().getFullYear()} {siteConfig.brand.name}. {siteConfig.contact.town}, {siteConfig.contact.state}, India. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-white bg-black border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer uppercase tracking-widest text-xs sm:text-sm font-bold py-2.5 px-4 rounded-none"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
