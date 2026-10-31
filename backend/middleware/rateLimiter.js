import rateLimit from 'express-rate-limit';

/**
 * Basic Rate Limiter for Booking Submissions
 * Prevents automated spam and abuse while allowing legitimate bookings
 */
export const bookingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // Limit each IP to 15 booking requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many booking requests from this IP address. Please wait 15 minutes before submitting again.',
  },
});

/**
 * General API limiter for all endpoints
 */
export const generalApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
});

