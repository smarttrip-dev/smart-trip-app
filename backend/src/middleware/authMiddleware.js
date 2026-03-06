import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js'; // ⭐ Import Vendor model

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

const vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') return next();
  return res.status(403).json({ message: 'Vendor access only' });
};

// ⭐ CRITICAL FIX #3: Vendor approval check
// Prevents unapproved vendors from accessing protected endpoints
const checkVendorApproval = async (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    try {
      const vendor = await Vendor.findOne({ user: req.user._id });
      if (!vendor) {
        return res.status(403).json({ 
          message: 'Vendor profile not found. Please complete vendor registration.' 
        });
      }
      if (vendor.status !== 'approved') {
        return res.status(403).json({ 
          message: `Vendor account status: ${vendor.status}. Please wait for admin approval.`,
          status: vendor.status
        });
      }
      req.vendor = vendor;
      return next();
    } catch (err) {
      return res.status(500).json({ 
        message: 'Server error checking vendor approval',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
  return res.status(403).json({ message: 'Vendor access only' });
};

export { protect, adminOnly, vendorOnly, checkVendorApproval };
