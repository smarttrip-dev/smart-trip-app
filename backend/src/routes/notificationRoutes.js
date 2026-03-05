import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/',            protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/read-all',  protect, markAllRead);
router.patch('/:id/read',  protect, markAsRead);
router.delete('/:id',      protect, deleteNotification);

export default router;
