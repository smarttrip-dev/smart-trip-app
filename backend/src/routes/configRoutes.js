import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCities, createCity, updateCity, deleteCity,
  getProvinces, createProvince, updateProvince, deleteProvince,
  getServices, createService, updateService, deleteService,
  getDestinations, createDestination, updateDestination, deleteDestination, uploadDestinationImage,
  getPreferences, getPreferencesByCategory, createPreference, updatePreference, deletePreference,
  getBanks, createBank, updateBank, deleteBank,
  getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow,
  getItineraryItems, getItineraryItemsByType, createItineraryItem, updateItineraryItem, deleteItineraryItem,
} from '../controllers/configController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for destination images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images/destinations');
    console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const router = express.Router();

// ========== ADMIN: Protected Routes (require admin role) ==========
const adminOnly = (req, res, next) => {
  protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

// Cities
router.get('/cities', getCities);
router.post('/cities', adminOnly, createCity);
router.put('/cities/:id', adminOnly, updateCity);
router.delete('/cities/:id', adminOnly, deleteCity);

// Provinces
router.get('/provinces', getProvinces);
router.post('/provinces', adminOnly, createProvince);
router.put('/provinces/:id', adminOnly, updateProvince);
router.delete('/provinces/:id', adminOnly, deleteProvince);

// Services
router.get('/services', getServices);
router.post('/services', adminOnly, createService);
router.put('/services/:id', adminOnly, updateService);
router.delete('/services/:id', adminOnly, deleteService);

// Destinations
router.get('/destinations', getDestinations);
router.post('/destinations/upload-image', adminOnly, upload.single('image'), uploadDestinationImage);
router.post('/destinations', adminOnly, createDestination);
router.put('/destinations/:id', adminOnly, updateDestination);
router.delete('/destinations/:id', adminOnly, deleteDestination);

// Preferences
router.get('/preferences', getPreferences);
router.get('/preferences/:category', getPreferencesByCategory);
router.post('/preferences', adminOnly, createPreference);
router.put('/preferences/:id', adminOnly, updatePreference);
router.delete('/preferences/:id', adminOnly, deletePreference);

// Banks
router.get('/banks', getBanks);
router.post('/banks', adminOnly, createBank);
router.put('/banks/:id', adminOnly, updateBank);
router.delete('/banks/:id', adminOnly, deleteBank);

// Workflows
router.get('/workflows', getWorkflows);
router.post('/workflows', adminOnly, createWorkflow);
router.put('/workflows/:id', adminOnly, updateWorkflow);
router.delete('/workflows/:id', adminOnly, deleteWorkflow);

// Itinerary Items
router.get('/itinerary-items', getItineraryItems);
router.get('/itinerary-items/type/:type', getItineraryItemsByType);
router.post('/itinerary-items', adminOnly, createItineraryItem);
router.put('/itinerary-items/:id', adminOnly, updateItineraryItem);
router.delete('/itinerary-items/:id', adminOnly, deleteItineraryItem);

export default router;
