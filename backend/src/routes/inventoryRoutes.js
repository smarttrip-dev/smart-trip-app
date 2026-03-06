import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    getInventoryItems,
    addInventoryItem,
    bulkAddInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    removeImageFromItem,
    getPublicActivities,
} from '../controllers/inventoryController.js';
import { protect, checkVendorApproval } from '../middleware/authMiddleware.js';
import { uploadMultipleImages, handleUploadError } from '../middleware/imageUpload.js';

const router = express.Router();

// Rate limit only write/upload operations, not reads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many uploads, please try again later.',
});

// Public route - must be before protected routes
router.get('/public', getPublicActivities);

// GET is unrestricted (no upload limiter); POST is rate-limited
router.route('/')
    .get(protect, getInventoryItems)
    .post(protect, checkVendorApproval, uploadLimiter, uploadMultipleImages, handleUploadError, addInventoryItem);

// Bulk upload endpoint — must be before /:id to avoid route clash
router.post('/bulk', protect, checkVendorApproval, uploadLimiter, bulkAddInventoryItems);

router.route('/:id')
    .put(protect, checkVendorApproval, uploadLimiter, uploadMultipleImages, handleUploadError, updateInventoryItem)
    .delete(protect, checkVendorApproval, deleteInventoryItem);

// Remove image from item
router.put('/:id/remove-image', protect, checkVendorApproval, uploadLimiter, removeImageFromItem);

export default router;
