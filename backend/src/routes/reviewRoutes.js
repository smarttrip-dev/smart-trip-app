import express from 'express';
import { submitReview, getVendorReviews, replyToReview, deleteReply } from '../controllers/reviewController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer: submit a review
router.post('/', protect, submitReview);

// Vendor: get all reviews for their services + stats
router.get('/vendor', protect, vendorOnly, getVendorReviews);

// Vendor: reply to a review
router.post('/:id/reply', protect, vendorOnly, replyToReview);

// Vendor: remove their reply
router.delete('/:id/reply', protect, vendorOnly, deleteReply);

export default router;
