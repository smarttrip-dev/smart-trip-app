import express from 'express';
import {
    getInventoryItems,
    addInventoryItem,
    bulkAddInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getInventoryItems)
    .post(protect, addInventoryItem);

// Bulk upload endpoint — must be before /:id to avoid route clash
router.post('/bulk', protect, bulkAddInventoryItems);

router.route('/:id')
    .put(protect, updateInventoryItem)
    .delete(protect, deleteInventoryItem);

export default router;
