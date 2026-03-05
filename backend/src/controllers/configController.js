import ConfigCity from '../models/ConfigCity.js';
import ConfigProvince from '../models/ConfigProvince.js';
import ConfigService from '../models/ConfigService.js';
import ConfigDestination from '../models/ConfigDestination.js';
import ConfigPreference from '../models/ConfigPreference.js';
import ConfigBank from '../models/ConfigBank.js';
import ConfigWorkflow from '../models/ConfigWorkflow.js';
import ConfigItineraryItem from '../models/ConfigItineraryItem.js';
import InventoryItem from '../models/InventoryItem.js';

// Map InventoryItem type -> ConfigItineraryItem type
const INV_TYPE_MAP = {
  accommodation: 'hotel',
  transport:     'transport',
  activity:      'activity',
  meal:          'meal',
  package:       'service',
  other:         'service'
};

// Normalize an InventoryItem into a ConfigItineraryItem-shaped object
const normalizeInventoryItem = (inv) => ({
  _id:        inv._id,
  _source:    'inventory',
  type:       INV_TYPE_MAP[inv.type] || 'service',
  name:       inv.name,
  price:      inv.price,
  location:   inv.location || '',
  amenities:  inv.amenities || [],
  category:   inv.type === 'accommodation' ? 'Accommodation'
            : inv.type === 'transport'     ? 'Transport'
            : inv.type === 'activity'      ? 'Cultural'
            : inv.type === 'meal'          ? 'Food'
            : 'Service',
  duration:   inv.duration || '',
  comfort:    inv.comfort  || '',
  available:  inv.availableCount > 0,
  isActive:   inv.isActive,
  capacity:   inv.capacity,
  description: inv.description || ''
});

// ========== CITIES ==========
export const getCities = async (req, res) => {
  try {
    const cities = await ConfigCity.find({ isActive: true }).sort({ name: 1 });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cities', error: error.message });
  }
};

export const createCity = async (req, res) => {
  try {
    const { name, province, region, coordinates, description } = req.body;
    const city = await ConfigCity.create({ name, province, region, coordinates, description });
    res.status(201).json(city);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create city', error: error.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const city = await ConfigCity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update city', error: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const city = await ConfigCity.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json({ message: 'City deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete city', error: error.message });
  }
};

// ========== PROVINCES ==========
export const getProvinces = async (req, res) => {
  try {
    const provinces = await ConfigProvince.find({ isActive: true }).sort({ name: 1 });
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch provinces', error: error.message });
  }
};

export const createProvince = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const province = await ConfigProvince.create({ name, code, description });
    res.status(201).json(province);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create province', error: error.message });
  }
};

export const updateProvince = async (req, res) => {
  try {
    const province = await ConfigProvince.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!province) return res.status(404).json({ message: 'Province not found' });
    res.json(province);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update province', error: error.message });
  }
};

export const deleteProvince = async (req, res) => {
  try {
    const province = await ConfigProvince.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!province) return res.status(404).json({ message: 'Province not found' });
    res.json({ message: 'Province deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete province', error: error.message });
  }
};

// ========== SERVICES ==========
export const getServices = async (req, res) => {
  try {
    const services = await ConfigService.find({ isActive: true }).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, category, description, icon } = req.body;
    const service = await ConfigService.create({ name, category, description, icon });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create service', error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await ConfigService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update service', error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await ConfigService.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete service', error: error.message });
  }
};

// ========== DESTINATIONS ==========
export const getDestinations = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    let query = ConfigDestination.find({ isActive: true }).sort({ name: 1 });
    if (limit) {
      query = query.limit(limit);
    }
    const destinations = await query.exec();
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch destinations', error: error.message });
  }
};

export const createDestination = async (req, res) => {
  try {
    const { name, tag, emoji, description, defaultDays, defaultPrice, region, attractions, image } = req.body;
    const destination = await ConfigDestination.create({ name, tag, emoji, description, defaultDays, defaultPrice, region, attractions, image });
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create destination', error: error.message });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const destination = await ConfigDestination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    res.json(destination);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update destination', error: error.message });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const destination = await ConfigDestination.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    res.json({ message: 'Destination deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete destination', error: error.message });
  }
};

export const uploadDestinationImage = async (req, res) => {
  try {
    if (!req.file) {
      console.warn('No file received in upload request');
      return res.status(400).json({ message: 'No image file provided' });
    }
    console.log('File uploaded successfully:', {
      originalame: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
    const imagePath = `/images/destinations/${req.file.filename}`;
    console.log('Returning image path:', imagePath);
    res.json({ imagePath, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

// ========== PREFERENCES ==========
export const getPreferences = async (req, res) => {
  try {
    const preferences = await ConfigPreference.find({ isActive: true }).sort({ category: 1, value: 1 });
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch preferences', error: error.message });
  }
};

export const getPreferencesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const preferences = await ConfigPreference.find({ category, isActive: true }).sort({ value: 1 });
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch preferences', error: error.message });
  }
};

export const createPreference = async (req, res) => {
  try {
    const { category, value, label, icon } = req.body;
    const preference = await ConfigPreference.create({ category, value, label, icon });
    res.status(201).json(preference);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create preference', error: error.message });
  }
};

export const updatePreference = async (req, res) => {
  try {
    const preference = await ConfigPreference.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!preference) return res.status(404).json({ message: 'Preference not found' });
    res.json(preference);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update preference', error: error.message });
  }
};

export const deletePreference = async (req, res) => {
  try {
    const preference = await ConfigPreference.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!preference) return res.status(404).json({ message: 'Preference not found' });
    res.json({ message: 'Preference deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete preference', error: error.message });
  }
};

// ========== BANKS ==========
export const getBanks = async (req, res) => {
  try {
    const banks = await ConfigBank.find({ isActive: true }).sort({ name: 1 });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banks', error: error.message });
  }
};

export const createBank = async (req, res) => {
  try {
    const { name, code, country } = req.body;
    const bank = await ConfigBank.create({ name, code, country });
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create bank', error: error.message });
  }
};

export const updateBank = async (req, res) => {
  try {
    const bank = await ConfigBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    res.json(bank);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update bank', error: error.message });
  }
};

export const deleteBank = async (req, res) => {
  try {
    const bank = await ConfigBank.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    res.json({ message: 'Bank deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete bank', error: error.message });
  }
};

// ========== WORKFLOW ==========
export const getWorkflows = async (req, res) => {
  try {
    const workflows = await ConfigWorkflow.find({ isActive: true }).sort({ order: 1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workflows', error: error.message });
  }
};

export const createWorkflow = async (req, res) => {
  try {
    const { step, name, description, status, order } = req.body;
    const workflow = await ConfigWorkflow.create({ step, name, description, status, order });
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create workflow', error: error.message });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const workflow = await ConfigWorkflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update workflow', error: error.message });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await ConfigWorkflow.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json({ message: 'Workflow deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete workflow', error: error.message });
  }
};

// ========== ITINERARY ITEMS ==========
export const getItineraryItems = async (req, res) => {
  try {
    const { type, category, location } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = location;
    
    // Fetch from both collections in parallel
    const configFilter = { ...filter };
    // For inventory, map the requested type back to InventoryItem enum
    const reverseTypeMap = { hotel: 'accommodation', transport: 'transport', activity: 'activity', meal: 'meal', service: ['package','other'] };
    const invFilter = { isActive: true };
    if (type && reverseTypeMap[type]) {
      const mapped = reverseTypeMap[type];
      invFilter.type = Array.isArray(mapped) ? { $in: mapped } : mapped;
    }
    if (location) invFilter.location = new RegExp(location, 'i');

    const [configItems, inventoryItems] = await Promise.all([
      ConfigItineraryItem.find(configFilter).sort({ type: 1, price: 1 }),
      InventoryItem.find(invFilter).sort({ type: 1, price: 1 })
    ]);

    // Merge: config items first, then inventory items not already covered
    const configNames = new Set(configItems.map(i => i.name.toLowerCase()));
    const newFromInventory = inventoryItems
      .map(normalizeInventoryItem)
      .filter(i => !configNames.has(i.name.toLowerCase()));

    res.json([...configItems, ...newFromInventory]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch itinerary items', error: error.message });
  }
};

export const getItineraryItemsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const reverseTypeMap = { hotel: 'accommodation', transport: 'transport', activity: 'activity', meal: 'meal', service: ['package','other'] };
    const invTypeRaw = reverseTypeMap[type];
    const invFilter = { isActive: true, type: Array.isArray(invTypeRaw) ? { $in: invTypeRaw } : invTypeRaw };

    const [configItems, inventoryItems] = await Promise.all([
      ConfigItineraryItem.find({ type, isActive: true }).sort({ price: 1 }),
      invTypeRaw ? InventoryItem.find(invFilter).sort({ price: 1 }) : Promise.resolve([])
    ]);

    const configNames = new Set(configItems.map(i => i.name.toLowerCase()));
    const newFromInventory = inventoryItems
      .map(normalizeInventoryItem)
      .filter(i => !configNames.has(i.name.toLowerCase()));

    res.json([...configItems, ...newFromInventory]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch itinerary items', error: error.message });
  }
};

export const createItineraryItem = async (req, res) => {
  try {
    const item = await ConfigItineraryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create itinerary item', error: error.message });
  }
};

export const updateItineraryItem = async (req, res) => {
  try {
    const item = await ConfigItineraryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Itinerary item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update itinerary item', error: error.message });
  }
};

export const deleteItineraryItem = async (req, res) => {
  try {
    const item = await ConfigItineraryItem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: 'Itinerary item not found' });
    res.json({ message: 'Itinerary item deactivated' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete itinerary item', error: error.message });
  }
};
