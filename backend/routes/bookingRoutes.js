import express from 'express';
import { createBooking, checkHealth } from '../controllers/bookingController.js';
import { validateBookingData } from '../middleware/validator.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/bookings - Rate limited & strictly validated
router.post('/', bookingRateLimiter, validateBookingData, createBooking);

// GET /api/bookings/health - Service health check
router.get('/health', checkHealth);

export default router;

