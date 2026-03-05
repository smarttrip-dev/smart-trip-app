import express from 'express';
import {
  getSavedTrips,
  saveTrip,
  removeSavedTrip,
  removeMultipleSavedTrips,
} from '../controllers/savedTripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSavedTrips)
  .post(protect, saveTrip)
  .delete(protect, removeMultipleSavedTrips);

router.delete('/:id', protect, removeSavedTrip);

export default router;
