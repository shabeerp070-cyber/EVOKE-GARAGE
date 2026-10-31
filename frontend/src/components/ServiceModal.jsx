import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageSquare, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { submitBooking } from '../services/bookingApi';

export default function ServiceModal({ isOpen, onClose, initialService }) {
  const [selectedService, setSelectedService] = useState(
    initialService?.title || siteConfig.services[0].title
  );
  const [vehicle, setVehicle] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedBooking, setSavedBooking] = useState(null);
  const [whatsappData, setWhatsappData] = useState(null);

  useEffect(() => {
    if (initialService?.title) {
      setSelectedService(initialService.title);
    }
  }, [initialService]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await submitBooking({
        fullName: clientName.trim(),
        phoneNumber: phone.trim(),
        carBrandModel: vehicle.trim() || 'To be specified',
        selectedService,
        problemDescription: notes.trim() || 'General consultation request',
        preferredBookingDate: preferredDate || 'Earliest available atelier slot',
      });

      // Successful database save
      setSavedBooking(response.booking);
      setWhatsappData(response.whatsapp);
      setIsSuccess(true);

      // Open WhatsApp with pre-filled message (customer presses Send manually)
      if (response.whatsapp?.url) {
        window.open(response.whatsapp.url, '_blank');
      }
    } catch (err) {
      // Database saving failed: Show genuine error and DO NOT open WhatsApp
      setErrorMessage(
        err.message || 'Failed to record booking in atelier database. Please verify your details and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-black border border-white/20 p-5 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] text-white rounded-none"
        >
          {/* Close button with 44px tap target */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-black hover:bg-white transition-colors cursor-pointer rounded-none bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6 pr-8">
            <div className="w-10 h-10 rounded-full bg-white/10 p-0.5 ring-1 ring-white/20 flex-shrink-0">
              <img
                src={siteConfig.brand.logoCircle}
                alt="Logo"
                className="w-full h-full object-contain rounded-full"
                width="40"
                height="40"
              />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-tech text-[#888888] uppercase tracking-widest block font-bold">
                EVOKE GARAGE • OTTAPALAM
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-black uppercase text-white mt-0.5">
                BOOK VEHICLE CONSULTATION
              </h3>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-6 sm:py-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-black" />
              </div>
              <h4 className="text-2xl font-heading font-black uppercase text-white">
                INQUIRY REGISTERED
              </h4>
              <p className="text-sm sm:text-base text-zinc-300 mt-2.5 max-w-sm font-normal leading-relaxed">
                Your consultation request has been saved in the EVOKE GARAGE database and opened in WhatsApp.
              </p>

              {savedBooking?.id && (
                <div className="mt-4 px-4 py-2 bg-white/5 border border-white/15 text-xs font-tech tracking-wider text-zinc-300">
                  BOOKING REF: <span className="text-white font-bold">#EVK-{savedBooking.id.slice(-6).toUpperCase()}</span>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {whatsappData?.url && (
                  <button
                    onClick={() => window.open(whatsappData.url, '_blank')}
                    className="btn-forge-primary !min-h-[46px] !py-2.5 !px-6 text-xs sm:text-sm font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-white group-hover:text-black" />
                    <span>Open WhatsApp Again</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 min-h-[46px] border border-white/20 text-white hover:bg-white/10 font-tech text-xs sm:text-sm uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm font-tech flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-tech uppercase tracking-widest text-[#888888] mb-1.5 font-bold">
                  Select Discipline *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-3 min-h-[48px] bg-[#0A0A0A] border border-white/20 text-white text-sm sm:text-base font-tech uppercase tracking-wider focus:outline-none focus:border-white cursor-pointer rounded-none"
                >
                  {siteConfig.services.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.index} — {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-tech uppercase tracking-widest text-[#888888] mb-1.5 font-bold">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[48px] bg-[#0A0A0A] border border-white/20 text-white text-sm sm:text-base font-tech placeholder:text-zinc-600 focus:outline-none focus:border-white rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-tech uppercase tracking-widest text-[#888888] mb-1.5 font-bold">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[48px] bg-[#0A0A0A] border border-white/20 text-white text-sm sm:text-base font-tech placeholder:text-zinc-600 focus:outline-none focus:border-white rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-tech uppercase tracking-widest text-[#888888] mb-1.5 font-bold">
                    Vehicle Brand & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Porsche 911 / BMW M3"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[48px] bg-[#0A0A0A] border border-white/20 text-white text-sm sm:text-base font-tech placeholder:text-zinc-600 focus:outline-none focus:border-white rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-tech uppercase tracking-widest text-[#888888] mb-1.5 font-bold">
                    Preferred Booking Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-3 min-h-[48px] bg-[#0A0A0A] border border-white/20 text-white text-sm sm:text-base font-tech focus:outline-none focus:border-white rounded-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-tech uppercase tracking-widest text-[#888888] mb-1.5 font-bold">
                  Problem Description / Goals
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your service needs: custom paintwork, dent repair, air conditioning, wiring..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/20 text-white text-sm sm:text-base font-tech placeholder:text-zinc-600 focus:outline-none focus:border-white resize-none rounded-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn-forge-primary w-full !min-h-[50px] !py-3.5 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 font-bold tracking-wider transition-opacity ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>RECORDING IN ATELIER DATABASE...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-white group-hover:text-black transition-colors" />
                      <span>DISPATCH CONSULTATION VIA WHATSAPP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
