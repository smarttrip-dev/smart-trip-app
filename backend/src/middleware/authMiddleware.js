import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
const checkVendorApproval = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    if (!req.user.isApproved) {
      return res.status(403).json({ 
        message: 'Vendor account not approved. Please wait for admin approval.' 
      });
    }
    return next();
  }
  return res.status(403).json({ message: 'Vendor access only' });
};

export { protect, adminOnly, vendorOnly, checkVendorApproval };
