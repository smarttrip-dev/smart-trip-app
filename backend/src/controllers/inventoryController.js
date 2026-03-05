import InventoryItem from '../models/InventoryItem.js';
import Vendor from '../models/Vendor.js';
import { getImageURL } from '../middleware/imageUpload.js';

// Helper: get vendor doc for the current user
const getVendorForUser = (userId) => Vendor.findOne({ user: userId });

// @desc    Get all inventory items for the logged-in vendor
// @route   GET /api/inventory
// @access  Private (vendor)
export const getInventoryItems = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    const items = await InventoryItem.find({ vendor: vendor._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new inventory item
// @route   POST /api/inventory
// @access  Private (vendor)
export const addInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    
    // Handle image upload if present
    const images = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        images.push(getImageURL(file.filename));
      });
    }

    const itemData = {
      ...req.body,
      vendor: vendor._id,
    };

    if (images.length > 0) {
      itemData.images = images;
    }

    const item = await InventoryItem.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add item', error: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private (vendor)
export const updateInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    
    const updateData = { ...req.body };

    // Handle image upload if present
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = [];
      req.files.forEach(file => {
        newImages.push(getImageURL(file.filename));
      });

      // If body contains 'replaceImages' flag, replace all images, otherwise append
      if (req.body.replaceImages === 'true' || req.body.replaceImages === true) {
        updateData.images = newImages;
      } else {
        // Append new images to existing ones
        const existingItem = await InventoryItem.findOne({ _id: req.params.id, vendor: vendor._id });
        if (existingItem && existingItem.images) {
          updateData.images = [...existingItem.images, ...newImages];
        } else {
          updateData.images = newImages;
        }
      }
    }

    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk add inventory items from CSV upload
// @route   POST /api/inventory/bulk
// @access  Private (vendor)
export const bulkAddInventoryItems = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const rows = req.body.items;
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ message: 'No items provided' });

    const VALID_TYPES = ['accommodation', 'transport', 'activity', 'meal', 'package', 'other'];
    const errors = [];
    const valid  = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // +2 to account for header row
      const rowErrors = [];

      if (!row.name || String(row.name).trim() === '')
        rowErrors.push({ row: rowNum, column: 'name', type: 'Missing Required', message: 'name is required', fix: 'Enter a service name' });

      const price = Number(row.price);
      if (isNaN(price) || price < 0)
        rowErrors.push({ row: rowNum, column: 'price', type: 'Invalid Format', message: 'price must be a positive number', fix: 'Enter a numeric value e.g. 15000' });

      const type = String(row.type || '').toLowerCase().trim();
      if (!VALID_TYPES.includes(type))
        rowErrors.push({ row: rowNum, column: 'type', type: 'Invalid Value', message: `type must be one of: ${VALID_TYPES.join(', ')}`, fix: 'Use one of the allowed type values' });

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        valid.push({
          vendor:         vendor._id,
          name:           String(row.name).trim(),
          type:           type,
          description:    String(row.description || '').trim(),
          price:          price,
          capacity:       Number(row.capacity)       || 1,
          availableCount: Number(row.availableCount) || Number(row.capacity) || 1,
          location:       String(row.location || '').trim(),
          amenities:      row.amenities
                            ? String(row.amenities).split(',').map(a => a.trim()).filter(Boolean)
                            : [],
          isActive:       true,
        });
      }
    });

    if (errors.length > 0 && valid.length === 0)
      return res.status(400).json({ message: 'All rows have errors', errors, totalRows: rows.length, successRows: 0, errorRows: errors.length });

    let inserted = [];
    if (valid.length > 0) {
      inserted = await InventoryItem.insertMany(valid);
    }

    res.status(201).json({
      message: `${inserted.length} items added successfully`,
      totalRows:   rows.length,
      successRows: inserted.length,
      errorRows:   rows.length - inserted.length,
      errors,
      items: inserted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (vendor)
export const deleteInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, vendor: vendor._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove an image from an inventory item
// @route   PUT /api/inventory/:id/remove-image
// @access  Private (vendor)
export const removeImageFromItem = async (req, res) => {
  try {
    const vendor = await getVendorForUser(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image URL is required' });

    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      { $pull: { images: imageUrl } },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get public activities/inventory items (no auth required)
// @route   GET /api/inventory/public
// @access  Public
export const getPublicActivities = async (req, res) => {
  try {
    const { location, type, maxPrice } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (location) {
      // Case-insensitive location search
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) {
        filter.price = { $lte: price };
      }
    }
    
    // Get items with vendor info
    const items = await InventoryItem.find(filter)
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
