import Vendor from '../models/Vendor.js';
import User from '../models/User.js';

// @desc    Register a new vendor profile
// @route   POST /api/vendors/register
// @access  Private
export const registerVendor = async (req, res) => {
  try {
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor profile already exists for this user.' });
    }

    const vendor = new Vendor({ user: req.user._id, ...req.body });
    const created = await vendor.save();

    // Upgrade user role to vendor
    await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error registering vendor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get the current vendor's profile
// @route   GET /api/vendors/profile
// @access  Private
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update the current vendor's profile
// @route   PUT /api/vendors/profile
// @access  Private
export const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const updatable = [
      'businessName','businessType','registrationNumber','taxId','yearEstablished',
      'businessEmail','businessPhone','website','socialMedia','address',
      'primaryContact','services','otherServices','bankDetails',
    ];
    updatable.forEach(field => {
      if (req.body[field] !== undefined) vendor[field] = req.body[field];
    });

    const updated = await vendor.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all vendors (admin)
// @route   GET /api/vendors
// @access  Private (admin)
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update vendor status (admin approve/reject)
// @route   PATCH /api/vendors/:id/status
// @access  Private (admin)
export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending_review', 'approved', 'rejected', 'suspended'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${valid.join(', ')}` });
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
