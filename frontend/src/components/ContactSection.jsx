import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Send, CheckCircle2, ExternalLink, Clock, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { submitBooking } from '../services/bookingApi';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: siteConfig.services[0].title,
    vehicle: '',
    preferredDate: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedBooking, setSavedBooking] = useState(null);
  const [whatsappData, setWhatsappData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await submitBooking({
        fullName: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        carBrandModel: formData.vehicle.trim() || 'To be specified',
        selectedService: formData.service,
        problemDescription: formData.notes.trim() || 'General consultation request',
        preferredBookingDate: formData.preferredDate || 'Earliest available atelier slot',
      });

      // Successful database save
      setSavedBooking(response.booking);
      setWhatsappData(response.whatsapp);
      setIsSubmitted(true);

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
    <section
      id="contact"
      className="scroll-mt-24 sm:scroll-mt-32 relative py-24 sm:py-36 bg-white text-black overflow-hidden border-t border-black/10 w-full"
    >
      <div className="absolute inset-0 bg-grain-dark opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: EVOKE GARAGE Branding */}
        <div className="mb-16 sm:mb-24 border-b border-black/10 pb-8 sm:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1px] bg-black" />
              <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#888888] font-bold">
                03 // ATELIER CONSULTATION & LOCATION
              </span>
            </div>

            <h2 className="text-[clamp(1.85rem,5.5vw,4.5rem)] font-heading font-black tracking-tight uppercase leading-[1.05] sm:leading-[0.96] text-black">
              ORDINARY ENDS HERE. <br className="hidden sm:inline" />
              <span className="text-[#888888]">CONNECT WITH EVOKE.</span>
            </h2>
          </div>

          {/* Official EVOKE GARAGE Emblem Badge - Minimalist Black & White Card */}
          <div className="flex items-center gap-4 p-4 sm:p-5 rounded-none bg-[#FAFAFA] border border-black/15 self-start md:self-auto shadow-sm">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-black/5 ring-1 ring-black/10 flex-shrink-0 overflow-hidden">
              <img
                src={siteConfig.brand.logoCircle}
                alt="EVOKE GARAGE Official Emblem"
                className="w-full h-full object-contain rounded-full"
                width="64"
                height="64"
              />
            </div>
            <div>
              <span className="text-sm sm:text-base font-heading font-black uppercase text-black tracking-widest block">
                {siteConfig.brand.name}
              </span>
              <span className="text-xs sm:text-sm font-tech text-[#888888] tracking-wider uppercase block font-semibold mt-0.5">
                OTTAPALAM // PALAKKAD // KERALA
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Official Business Details */}
          <div className="lg:col-span-5 space-y-8 sm:space-y-10">
            
            {/* Atelier Info Card */}
            <div className="space-y-6 sm:space-y-7">
              <div>
                <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.22em] text-[#888888] block font-bold">
                  BRAND ATELIER
                </span>
                <h3 className="text-2xl sm:text-4xl font-heading font-black uppercase text-black mt-1">
                  EVOKE GARAGE
                </h3>
                <p className="mt-2.5 text-sm sm:text-base text-zinc-700 font-normal leading-relaxed">
                  High-precision automotive craft. Hand-finished paint restoration, structural bodywork, climate calibration, and CAN-bus telemetry.
                </p>
              </div>

              {/* Physical Location */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-black/10">
                <div className="p-2.5 rounded-none bg-black text-white flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] block mb-1 font-bold">
                    ATELIER ADDRESS
                  </span>
                  <p className="text-sm sm:text-base text-black font-bold">
                    {siteConfig.contact.formattedAddress}
                  </p>
                  <a
                    href={siteConfig.contact.coordinates.googleMapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs sm:text-sm font-tech text-zinc-700 hover:text-black uppercase tracking-wider transition-colors font-bold"
                  >
                    <span>OPEN ON GOOGLE MAPS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Verified Phone Contact */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-black/10">
                <div className="p-2.5 rounded-none bg-black text-white flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] block mb-1 font-bold">
                    DIRECT TELEPHONE
                  </span>
                  <a
                    href={siteConfig.contact.phoneCallUrl}
                    className="text-lg sm:text-2xl font-heading font-black text-black hover:text-zinc-600 transition-colors tracking-wide block"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                  <span className="text-xs sm:text-sm font-tech text-[#888888] uppercase tracking-widest block mt-0.5 font-medium">
                    TAP TO CALL OTTAPALAM WORKSHOP
                  </span>
                </div>
              </div>

              {/* Atelier Operating Hours */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-black/10">
                <div className="p-2.5 rounded-none bg-black text-white flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] block mb-1 font-bold">
                    WORKSHOP HOURS
                  </span>
                  <p className="text-sm sm:text-base text-zinc-800">
                    {siteConfig.contact.workingHours.days}: <span className="font-semibold text-black">{siteConfig.contact.workingHours.hours}</span>
                  </p>
                  <p className="text-xs sm:text-sm font-tech text-[#888888] mt-0.5">
                    {siteConfig.contact.workingHours.note}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout Banner */}
            <div className="p-5 rounded-none bg-[#FAFAFA] border border-black/15 flex items-center justify-between gap-4">
              <div>
                <span className="text-sm sm:text-base font-heading font-black uppercase text-black block">
                  FAST WHATSAPP DESPATCH
                </span>
                <span className="text-xs sm:text-sm font-tech text-zinc-600 block mt-0.5">
                  Instant response for estimates and photos
                </span>
              </div>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(siteConfig.contact.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-forge-on-white !min-h-[44px] !py-2.5 !px-5 text-xs sm:text-sm font-bold flex-shrink-0"
              >
                <span>OPEN CHAT</span>
              </a>
            </div>

          </div>

          {/* Right Column: Interactive Consultation Booking Form - Minimal Black and White Styling */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-none bg-[#FAFAFA] border border-black/15 shadow-[0_15px_40px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span className="text-xs sm:text-sm font-tech uppercase tracking-[0.22em] text-black font-bold">
                    ATELIER BOOKING CONSULTATION
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-tech text-[#888888] uppercase font-semibold">
                  OTTAPALAM ATELIER
                </span>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-black uppercase text-black">
                    INQUIRY REGISTERED
                  </h3>
                  <p className="text-sm text-zinc-600 max-w-md mx-auto">
                    Your consultation request has been saved in the EVOKE GARAGE database and opened in WhatsApp. Our master technicians will connect with you promptly.
                  </p>

                  {savedBooking?.id && (
                    <div className="inline-block px-4 py-2 bg-black/5 border border-black/15 text-xs font-tech tracking-wider text-zinc-800">
                      BOOKING REF: <span className="font-bold text-black">#EVK-{savedBooking.id.slice(-6).toUpperCase()}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {whatsappData?.url && (
                      <button
                        onClick={() => window.open(whatsappData.url, '_blank')}
                        className="btn-forge-on-white text-xs !min-h-[44px] !px-6 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>OPEN WHATSAPP AGAIN</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: '',
                          phone: '',
                          service: siteConfig.services[0].title,
                          vehicle: '',
                          preferredDate: '',
                          notes: '',
                        });
                      }}
                      className="btn-forge-outline-on-white text-xs !min-h-[44px] !px-6 cursor-pointer"
                    >
                      <span>SEND ANOTHER REQUEST</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm font-tech flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] mb-2 font-bold">
                        YOUR NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-white border border-black/20 text-black font-tech text-sm sm:text-base placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] mb-2 font-bold">
                        PHONE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 bg-white border border-black/20 text-black font-tech text-sm sm:text-base placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors rounded-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] mb-2 font-bold">
                        REQUIRED SERVICE *
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-black/20 text-black font-tech text-sm sm:text-base focus:outline-none focus:border-black transition-colors rounded-none cursor-pointer"
                      >
                        {siteConfig.services.map((s) => (
                          <option key={s.id} value={s.title} className="bg-white text-black">
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] mb-2 font-bold">
                        VEHICLE MAKE / MODEL
                      </label>
                      <input
                        type="text"
                        value={formData.vehicle}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        placeholder="e.g. Porsche 911 / BMW M3 / Swift"
                        className="w-full px-4 py-3 bg-white border border-black/20 text-black font-tech text-sm sm:text-base placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] mb-2 font-bold">
                      PREFERRED BOOKING DATE
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-black/20 text-black font-tech text-sm sm:text-base focus:outline-none focus:border-black transition-colors rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-tech uppercase tracking-[0.2em] text-[#888888] mb-2 font-bold">
                      SPECIFICATIONS / NOTES
                    </label>
                    <textarea
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Describe the issue, panel damage, or custom paintwork requirements..."
                      className="w-full px-4 py-3 bg-white border border-black/20 text-black font-tech text-sm sm:text-base placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors resize-none rounded-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`btn-forge-on-white w-full cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm font-bold tracking-wider !min-h-[50px] transition-opacity ${
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
                          <Send className="w-4 h-4" />
                          <span>DISPATCH CONSULTATION VIA WHATSAPP</span>
                        </>
                      )}
                    </button>
                    <span className="block text-center text-xs sm:text-sm font-tech text-[#888888] uppercase tracking-wider mt-3 font-medium">
                      Direct connection with our Ottapalam master workshop technicians
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
