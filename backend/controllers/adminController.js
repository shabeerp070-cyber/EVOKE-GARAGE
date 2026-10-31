import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Booking } from '../models/Booking.js';

/**
 * Generate signed JWT Token for Admin
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'evoke_garage_atelier_master_jwt_secret_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Authenticate admin & return token
 * @route   POST /api/admin/login
 * @access  Public (Admin login only)
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both admin username/email and password.',
      });
    }

    const query = usernameOrEmail.includes('@')
      ? { email: usernameOrEmail.toLowerCase().trim() }
      : { username: usernameOrEmail.toLowerCase().trim() };

    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: 'Admin authorization granted.',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current admin profile
 * @route   GET /api/admin/me
 * @access  Private (Admin only)
 */
export const getAdminProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

/**
 * @desc    Get all customer bookings for admin view
 * @route   GET /api/admin/bookings
 * @access  Private (Admin only)
 */
export const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Pending, Confirmed, Completed, Cancelled)
 * @route   PATCH /api/admin/bookings/:id/status
 * @access  Private (Admin only)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete booking from database
 * @route   DELETE /api/admin/bookings/:id
 * @access  Private (Admin only)
 */
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking record successfully deleted.',
    });
  } catch (error) {
    next(error);
  }
};

