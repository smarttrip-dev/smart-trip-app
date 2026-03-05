import express from 'express';
import { protect, adminOnly, vendorOnly } from '../middleware/authMiddleware.js';
import {
  getMyBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  payBooking,
  updateBookingStatus,
  getAllBookings,
  getVendorBookings,
  vendorBookingAction,
} from '../controllers/bookingController.js';

const router = express.Router();

// User routes
router.get('/', protect, getMyBookings);
router.post('/', protect, createBooking);

// Admin routes
router.get('/all', protect, adminOnly, getAllBookings);

// Vendor routes  (must come before /:id to avoid conflict)
router.get('/vendor', protect, vendorOnly, getVendorBookings);
router.patch('/:id/vendor-action', protect, vendorOnly, vendorBookingAction);

// Shared routes
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.patch('/:id/pay', protect, payBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, adminOnly, updateBookingStatus);

export default router;
