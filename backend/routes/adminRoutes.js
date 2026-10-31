import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  getAdminBookings,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/adminController.js';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protectAdmin } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================
router.post('/login', adminLogin);
router.get('/me', protectAdmin, getAdminProfile);

// ============================================================================
// ADMIN PRODUCT MANAGEMENT (CRUD + Image Upload)
// ============================================================================
router.get('/products', protectAdmin, getAdminProducts);
router.post('/products', protectAdmin, upload.single('image'), createProduct);
router.put('/products/:id', protectAdmin, upload.single('image'), updateProduct);
router.delete('/products/:id', protectAdmin, deleteProduct);

// ============================================================================
// ADMIN CUSTOMER BOOKINGS MANAGEMENT
// ============================================================================
router.get('/bookings', protectAdmin, getAdminBookings);
router.patch('/bookings/:id/status', protectAdmin, updateBookingStatus);
router.delete('/bookings/:id', protectAdmin, deleteBooking);

export default router;

