import express from 'express';
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getAllVendors,
  updateVendorStatus,
  getVendorReviews,
  getMyVendorReviews,
} from '../controllers/vendorController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateVendorInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Vendor self-service
router.post('/register', protect, validateVendorInput, registerVendor);
router.route('/profile')
  .get(protect, getVendorProfile)
  .put(protect, validateVendorInput, updateVendorProfile);

// Vendor reviews
router.get('/profile/reviews', protect, getMyVendorReviews);
router.get('/:id/reviews', getVendorReviews);

// Admin routes
router.get('/', protect, getAllVendors);
router.patch('/:id/status', protect, adminOnly, updateVendorStatus);

export default router;
