import { Booking } from '../models/Booking.js';

/**
 * Helper to construct pre-filled, URL-encoded WhatsApp message
 */
export const generateWhatsAppPayload = (booking, businessNumber) => {
  const number = (businessNumber || process.env.WHATSAPP_NUMBER || '911234567890').replace(/[^0-9]/g, '');
  const refCode = (booking._id || booking.id || 'NEW').toString().slice(-6).toUpperCase();

  const message = [
    '*EVOKE GARAGE — ATELIER CONSULTATION REQUEST*',
    `• Booking Ref: #EVK-${refCode}`,
    `• Client Name: ${booking.fullName}`,
    `• Phone Number: ${booking.phoneNumber}`,
    `• Required Discipline: ${booking.selectedService}`,
    `• Vehicle: ${booking.carBrandModel || 'To be specified'}`,
    `• Preferred Date: ${booking.preferredBookingDate || 'Earliest available'}`,
    `• Description / Notes: ${booking.problemDescription || 'Standard vehicle inspection'}`,
    '• Atelier Location: Ottapalam, Palakkad, Kerala',
    '• Status: Registered in Atelier Database (Pending Dispatch)',
  ].join('\n');

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return {
    number,
    message,
    url,
  };
};

/**
 * @desc    Create a new booking and return formatted WhatsApp payload
 * @route   POST /api/bookings
 * @access  Public
 */
export const createBooking = async (req, res, next) => {
  try {
    const bookingData = req.validatedBooking;

    // 1. Attempt to persist to MongoDB Atlas
    const booking = await Booking.create(bookingData);

    // 2. Generate WhatsApp URL using configured business number
    const whatsapp = generateWhatsAppPayload(booking, process.env.WHATSAPP_NUMBER);

    // 3. Return successful response with saved booking and pre-filled WhatsApp link
    return res.status(201).json({
      success: true,
      message: 'Booking successfully registered in EVOKE GARAGE database.',
      booking: {
        id: booking._id,
        fullName: booking.fullName,
        phoneNumber: booking.phoneNumber,
        carBrandModel: booking.carBrandModel,
        selectedService: booking.selectedService,
        problemDescription: booking.problemDescription,
        preferredBookingDate: booking.preferredBookingDate,
        bookingCreationDate: booking.bookingCreationDate,
        status: booking.status,
      },
      whatsapp,
    });
  } catch (error) {
    // If database save fails, forward to errorHandler to return genuine error response
    console.error('❌ [CREATE BOOKING DATABASE ERROR]:', error.message);
    next(error);
  }
};

/**
 * @desc    Healthcheck / Get API info
 * @route   GET /api/bookings/health
 * @access  Public
 */
export const checkHealth = async (req, res) => {
  res.status(200).json({
    success: true,
    service: 'EVOKE GARAGE Atelier Booking API',
    status: 'Operational',
    timestamp: new Date().toISOString(),
  });
};

