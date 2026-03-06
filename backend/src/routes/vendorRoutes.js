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
import { protect, adminOnly, checkVendorApproval } from '../middleware/authMiddleware.js'; // ⭐ Added checkVendorApproval
import { validateVendorInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Vendor self-service
router.post('/register', protect, validateVendorInput, registerVendor);
// ⭐ CRITICAL FIX #3: Protect vendor profile operations with approval check
router.route('/profile')
  .get(protect, checkVendorApproval, getVendorProfile)
  .put(protect, checkVendorApproval, validateVendorInput, updateVendorProfile);

// Vendor reviews
router.get('/profile/reviews', protect, checkVendorApproval, getMyVendorReviews);
router.get('/:id/reviews', getVendorReviews);

// Admin routes
router.get('/', protect, adminOnly, getAllVendors);
router.patch('/:id/status', protect, adminOnly, updateVendorStatus);

export default router;
