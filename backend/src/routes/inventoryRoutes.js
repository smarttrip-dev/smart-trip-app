import express from 'express';
import {
    getInventoryItems,
    addInventoryItem,
    bulkAddInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    removeImageFromItem,
    getPublicActivities,
} from '../controllers/inventoryController.js';
import { protect, checkVendorApproval } from '../middleware/authMiddleware.js'; // ⭐ Added checkVendorApproval
import { uploadMultipleImages, handleUploadError } from '../middleware/imageUpload.js';

const router = express.Router();

// Public route - must be before protected routes
router.get('/public', getPublicActivities);

// ⭐ CRITICAL FIX #3: Protect vendor inventory operations with approval check
router.route('/')
    .get(protect, getInventoryItems)
    .post(protect, checkVendorApproval, uploadMultipleImages, handleUploadError, addInventoryItem);

// Bulk upload endpoint — must be before /:id to avoid route clash
router.post('/bulk', protect, checkVendorApproval, bulkAddInventoryItems);

router.route('/:id')
    .put(protect, checkVendorApproval, uploadMultipleImages, handleUploadError, updateInventoryItem)
    .delete(protect, checkVendorApproval, deleteInventoryItem);

// Remove image from item
router.put('/:id/remove-image', protect, checkVendorApproval, removeImageFromItem);

export default router;
