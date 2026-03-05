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
import { protect } from '../middleware/authMiddleware.js';
import { uploadMultipleImages, handleUploadError } from '../middleware/imageUpload.js';

const router = express.Router();

// Public route - must be before protected routes
router.get('/public', getPublicActivities);

router.route('/')
    .get(protect, getInventoryItems)
    .post(protect, uploadMultipleImages, handleUploadError, addInventoryItem);

// Bulk upload endpoint — must be before /:id to avoid route clash
router.post('/bulk', protect, bulkAddInventoryItems);

router.route('/:id')
    .put(protect, uploadMultipleImages, handleUploadError, updateInventoryItem)
    .delete(protect, deleteInventoryItem);

// Remove image from item
router.put('/:id/remove-image', protect, removeImageFromItem);

export default router;
