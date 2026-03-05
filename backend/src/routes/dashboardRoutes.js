import express from 'express';
import { getDashboardData, getVendorDashboardData, getAdminDashboardData } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// User dashboard
router.get('/', getDashboardData);

// Vendor dashboard
router.get('/vendor', getVendorDashboardData);

// Admin dashboard
router.get('/admin', adminOnly, getAdminDashboardData);

export default router;
