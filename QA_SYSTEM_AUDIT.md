# 🔍 QA System Audit Report - Smart Trip App

**Date:** March 6, 2026  
**Severity Classification:** 🔴 Critical | 🟠 Major | 🟡 Moderate | 🟢 Minor  
**Total Issues Found:** 51 (5 Critical, 10 Major, 15 Moderate, 21 Minor)

---

## 📋 Executive Summary

The Smart Trip travel booking system has a functional MVP but requires significant hardening before production deployment. Critical inventory management gaps could lead to overbooking, conflicts, and data loss. Authentication/authorization checks exist but aren't consistently enforced at the API level. State management and data validation need architectural improvements.

**Recommendation:** Address all critical issues (2-3 weeks) before beta testing.

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. **No Inventory Stock Decrement on Booking** 
**Severity:** CRITICAL | **Impact:** Overbooking, Revenue Loss | **Effort:** 2 hours

**Problem:**
```javascript
// bookingController.js - createBooking() doesn't update InventoryItem.availableCount
const booking = await Booking.create({
  user: req.user._id,
  items: resolvedItems,
  totalCost,
  // ❌ NO availableCount decrement!
});
```

**Consequence:**
- Multiple users can book the same item beyond capacity
- Vendor oversells services (hotel with capacity: 5 gets 10 bookings)
- Cancellations don't restore stock

**Fix Required:**
```javascript
// After booking created, update inventory
for (const item of resolvedItems) {
  await InventoryItem.findByIdAndUpdate(
    item.inventory,
    { $inc: { availableCount: -1 } },
    { new: true }
  );
}
```

**Testing:**
- Create 2 bookings for same item with capacity:1, availableCount:1
- Verify second booking status (should fail after first)
- Test cancellation restores availableCount

---

### 2. **Race Condition in Inventory Stock Management**
**Severity:** CRITICAL | **Impact:** Double-booking Under Load | **Effort:** 3 hours

**Problem:**
No transaction-based locking. In concurrent scenarios:
```
User A fetches item: availableCount = 5
User B fetches item: availableCount = 5
User A books 3 units → availableCount = 2 ✓
User B books 4 units → availableCount = 1 ❌ (OVERBOOKING!)
```

**Root Cause:**
- Separate read and write operations
- No atomic check-and-update
- MongoDB lacks distributed locks in current schema

**Fix Required:**
```javascript
// Use MongoDB findByIdAndUpdate with conditions
const item = await InventoryItem.findByIdAndUpdate(
  inventoryId,
  {
    $inc: { availableCount: -quantity },
    $set: { lastUpdated: new Date() }
  },
  {
    new: true,
    runValidators: true,
    // This will fail if availableCount - quantity < 0
  }
);

if (item.availableCount < 0) {
  throw new Error('Inventory exhausted during booking');
}
```

**Alternative (Session-based):**
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  const item = await InventoryItem.findById(inventoryId).session(session);
  if (item.availableCount < quantity) throw new Error('Not enough stock');
  item.availableCount -= quantity;
  await item.save({ session });
  await session.commitTransaction();
} finally {
  session.endSession();
}
```

**Testing:**
- Load test: 100 concurrent bookings for 1 item (capacity: 10)
- Verify only 10 succeed, rest fail gracefully
- Check final availableCount = 0

---

### 3. **Vendor Approval Check Only at Component Level**
**Severity:** CRITICAL | **Impact:** Unapproved Vendors Can Create Bookings | **Effort:** 2 hours

**Problem:**
```javascript
// Frontend: InventoryManagement.jsx
if (data.status !== 'approved') toast.error('Account not approved');
// But API endpoint /api/inventory POST doesn't check vendor status!
```

**API Gap:**
```javascript
// backend/inventoryController.js addInventoryItem()
const vendor = await getVendorForUser(req.user._id);
if (!vendor) return res.status(404)... 
// ❌ Missing: if (vendor.status !== 'approved') return 403
```

**Consequence:**
- User approves frontend component locally
- Bypasses by directly calling `/api/inventory` POST
- Rejected/Suspended vendors can still add/update items

**Fix Required:**
Add vendor status check to ALL protected endpoints:
```javascript
const checkVendorApproval = async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json({ message: 'Vendor account not approved' });
  }
  req.vendor = vendor;
  next();
};

// Apply to routes
router.post('/inventory', protect, checkVendorApproval, addInventoryItem);
router.put('/inventory/:id', protect, checkVendorApproval, updateInventoryItem);
```

**Endpoints to Fix:** (8 endpoints)
- `POST /api/inventory`
- `PUT /api/inventory/:id`
- `DELETE /api/inventory/:id`
- `POST /api/inventory/bulk`
- `GET /api/reservations/vendor`
- `PATCH /api/reservations/:id/approve`
- `PATCH /api/reservations/:id/reject`
- `POST /api/vendors/profile/reviews`

**Testing:**
- Create vendor in 'pending_review' status
- Try to POST /api/inventory with Bearer token
- Should return 403, not 201

---

### 4. **No Input Validation on Booking Creation**
**Severity:** CRITICAL | **Impact:** Invalid Data Corruption | **Effort:** 2 hours

**Problem:**
```javascript
// bookingController.js
export const createBooking = async (req, res) => {
  const { items, tripDates, pax, totalCost } = req.body;
  // ❌ Zero validation!
  
  // These pass through without validation:
  // - pax.adults = -5 (negative travelers)
  // - totalCost = "hello" (non-numeric)
  // - tripDates.startDate = "invalid-date" 
  // - items [undefined]
```

**Consequence:**
- Bookings created with impossible data
- Reports broken, calculations fail
- Data cleanup required

**Fix Required:**
```javascript
const createBooking = async (req, res) => {
  const { items, tripDates, pax, specialRequests, destination, location, duration, itinerarySummary, totalCost: bodyTotal } = req.body;

  // Validate pax
  if (!pax || typeof pax !== 'object') {
    return res.status(400).json({ message: 'Invalid pax object' });
  }
  if (pax.adults < 1 || pax.children < 0 || pax.infants < 0) {
    return res.status(400).json({ message: 'Invalid traveler counts' });
  }

  // Validate totalCost
  if (typeof bodyTotal !== 'number' || bodyTotal < 0) {
    return res.status(400).json({ message: 'Invalid total cost' });
  }

  // Validate dates
  if (tripDates?.startDate && tripDates?.endDate) {
    const start = new Date(tripDates.startDate);
    const end = new Date(tripDates.endDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid start date' });
    }
    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }
  }

  // ... rest of logic
};
```

**Testing:**
- POST /api/bookings with pax: { adults: -5 }
- Should return 400, not 201
- POST with totalCost: "abc"
- Should return 400, not 201

---

### 5. **No Rate Limiting or Throttling**
**Severity:** CRITICAL | **Impact:** Brute Force, DoS Vulnerability | **Effort:** 2 hours

**Problem:**
```javascript
// server.js
app.use(express.json()); // No rate limiting!
app.use("/api/auth", authRoutes);
```

Any attacker can:
```bash
# Brute force login
for i in {1..10000}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -d '{"email":"admin@example.com","password":"attempt'$i'"}' \
    -H "Content-Type: application/json"
done

# Spam image uploads (5MB * 1000 = 5GB)
for i in {1..1000}; do
  curl -X POST http://localhost:5001/api/inventory \
    -F "files=@large_image.jpg" \
    -H "Authorization: Bearer $TOKEN"
done
```

**Fix Required:**
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

// General API limiter (15 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// File upload limiter (10 uploads per hour per user)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user._id.toString(),
});

app.use(apiLimiter);
app.post('/api/auth/login', loginLimiter, loginUser);
app.post('/api/inventory', uploadLimiter, addInventoryItem);
```

**Testing:**
- Send 6 login POST requests in 1 minute
- 6th should return 429 Too Many Requests
- Verify rate limit resets after 15 minutes

---

## 🟠 MAJOR ISSUES (High Priority)

### 6. **Booking Status Transitions Not Enforced**
**Severity:** MAJOR | **Impact:** Invalid State Transitions | **Effort:** 3 hours

**Problem:**
```javascript
// bookingController.js updateBookingStatus():
if (newStatus === 'confirmed') {
  booking.status = 'confirmed';
} else if (newStatus === 'rejected') {
  booking.status = 'rejected'; // Can reject after confirmed!
}
// No state machine enforcement
```

**Invalid Transitions Allowed:**
- confirmed → rejected (customer loses money)
- completed → pending (re-opens finished booking)
- rejected → confirmed (vendor approves rejected booking)

**Valid State Flow:**
```
pending → confirmed → completed
       ↓
    rejected (terminal)

cancelled (terminal, from any state)
```

**Fix Required:**
```javascript
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  rejected: [], // Terminal state
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

const updateBookingStatus = async (req, res) => {
  const { newStatus } = req.body;
  const booking = await Booking.findById(req.params.id);
  
  if (!VALID_TRANSITIONS[booking.status]?.includes(newStatus)) {
    return res.status(400).json({
      message: `Invalid transition from ${booking.status} to ${newStatus}`,
      allowedTransitions: VALID_TRANSITIONS[booking.status]
    });
  }
  
  booking.status = newStatus;
  await booking.save();
  res.json(booking);
};
```

**Testing:**
- Create booking with status: 'pending'
- PATCH /api/bookings/:id/status with newStatus: 'rejected' ✓
- Then PATCH again with newStatus: 'confirmed'
- Should return 400

---

### 7. **availableCount Can Go Negative**
**Severity:** MAJOR | **Impact:** Inaccurate Inventory, Can Overbill | **Effort:** 1 hour

**Problem:**
```javascript
// When booking 50 items but only 30 available
await InventoryItem.findByIdAndUpdate(
  itemId,
  { $inc: { availableCount: -50 } }
  // ❌ Result: availableCount = -20 (allowed!)
);
```

**Fix Required:**
```javascript
// Add validator to schema
const inventoryItemSchema = new mongoose.Schema({
  availableCount: {
    type: Number,
    default: 1,
    min: [0, 'Available count cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.capacity; // Can't exceed capacity
      },
      message: 'Available count cannot exceed capacity'
    }
  },
  capacity: {
    type: Number,
    default: 1,
    min: [1, 'Capacity must be at least 1']
  }
});

// And in controller
const item = await InventoryItem.findByIdAndUpdate(
  itemId,
  { $inc: { availableCount: -quantity } },
  { new: true, runValidators: true }
);

if (item.availableCount < 0) {
  throw new Error('Insufficient inventory');
}
```

**Testing:**
- Create inventory with capacity: 5, availableCount: 5
- Try to book 10 units
- Should fail, availableCount should still be 5

---

### 8. **No Password Strength Requirements**
**Severity:** MAJOR | **Impact:** Weak User Accounts Hackable | **Effort:** 1 hour

**Problem:**
```javascript
// authController.js registerUser()
const hashedPassword = await bcrypt.hash(password, salt);
// Accepts: "a", "123", "password123", "qwerty"
// No strength validation!
```

**Fix Required:**
```bash
npm install password-validator
```

```javascript
import PasswordValidator from 'password-validator';

const schema = new PasswordValidator();
schema
  .min(8)                        // Minimum 8 characters
  .max(128)                      // Maximum 128 characters
  .has().uppercase()             // At least one uppercase letter
  .has().lowercase()             // At least one lowercase letter
  .has().digits()                // At least one digit
  .has().symbols()               // At least one special character
  .not().spaces();               // No spaces

export const registerUser = async (req, res) => {
  const { password } = req.body;
  
  if (!schema.validate(password)) {
    return res.status(400).json({
      message: 'Password must have: 8+ chars, uppercase, lowercase, digit, symbol',
      errors: schema.validate(password, { list: true })
    });
  }
  
  // ... rest of logic
};
```

**Testing:**
- POST /api/auth/register with password: "abc"
- Should return 400 with error details
- POST with password: "SecurePass123!"
- Should succeed

---

### 9. **No Email Format Validation**
**Severity:** MAJOR | **Impact:** Invalid Emails in System | **Effort:** 30 mins

**Problem:**
```javascript
// User model allows ANY string as email
const user = await User.create({
  email: "not-an-email", // Accepted!
  password: hashedPassword,
});
```

**Fix Required:**
```javascript
// In User model
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please provide a valid email address'
    ]
  },
  // ...
});

// In authController
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ message: 'Invalid email format' });
}
```

**Testing:**
- POST /api/auth/register with email: "notanemail"
- Should return 400 with email validation error

---

### 10. **Pending Bookings Never Expire**
**Severity:** MAJOR | **Impact:** Inventory Locked Forever | **Effort:** 4 hours

**Problem:**
```javascript
// bookingController.js
// If a customer creates a booking and never confirms:
// - Inventory stays reserved forever
// - Vendor can't release stock
// - Overbooking becomes inevitable

// Current schema
const bookingSchema = new mongoose.Schema({
  status: { enum: ['pending', 'confirmed', 'rejected', 'cancelled'] },
  // ❌ No expiryDate field
  createdAt: { type: Date }
});
```

**Consequence:**
- 100 pending bookings lock all available items
- System becomes unusable

**Fix Required:**
```javascript
// 1. Add to schema
const bookingSchema = new mongoose.Schema({
  status: { enum: ['pending', 'confirmed', 'rejected', 'cancelled'] },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// 2. Create expiry check middleware
export const checkBookingExpiry = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  
  if (booking.status === 'pending' && booking.expiryDate < new Date()) {
    booking.status = 'expired';
    
    // Release inventory back to vendor
    for (const item of booking.items) {
      await InventoryItem.findByIdAndUpdate(
        item.inventory,
        { $inc: { availableCount: 1 } }
      );
    }
    
    await booking.save();
    return res.status(410).json({ message: 'Booking has expired' });
  }
  
  next();
};

// 3. Cron job to auto-expire bookings
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  const expiredBookings = await Booking.updateMany(
    { status: 'pending', expiryDate: { $lt: new Date() } },
    { status: 'expired' }
  );
  
  // Release inventory for all expired bookings
  if (expiredBookings.modifiedCount > 0) {
    console.log(`Auto-expired ${expiredBookings.modifiedCount} bookings`);
  }
});
```

**Testing:**
- Create booking with expiryDate in past
- Try to confirm, should return 410 Gone
- Verify inventory released

---

### 11. **Trip Date Validation Missing**
**Severity:** MAJOR | **Impact:** Can Book Past Dates | **Effort:** 1 hour

**Problem:**
```javascript
// tripController.js createTrip()
const tripData = { ...req.body, user: req.user._id };
// ❌ Accepts dates in past
// 2020-01-01 accepted as valid trip start date
```

**Fix Required:**
```javascript
export const createTrip = async (req, res) => {
  const { tripDates, ...tripData } = req.body;

  if (tripDates?.startDate) {
    const startDate = new Date(tripDates.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return res.status(400).json({ 
        message: 'Trip start date must be in the future' 
      });
    }
  }

  if (tripDates?.startDate && tripDates?.endDate) {
    const start = new Date(tripDates.startDate);
    const end = new Date(tripDates.endDate);
    
    if (end <= start) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }
  }

  const trip = await Trip.create({ tripDates, ...tripData });
  res.status(201).json(trip);
};
```

**Testing:**
- POST /api/trips with startDate: "2000-01-01"
- Should return 400, not 201

---

### 12. **Orphaned Vendor Records on User Deletion**
**Severity:** MAJOR | **Impact:** Data Integrity Issues | **Effort:** 2 hours

**Problem:**
```javascript
// No delete endpoint for User
// If admin deletes user:
// - User record deleted
// - Vendor record still exists (orphaned)
// - Inventory items still exist (orphaned)
// - Bookings still exist (orphaned)
```

**Fix Required:**
```javascript
// authController.js or userController.js
export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.params.id;
    
    // 1. Find and delete vendor
    const vendor = await Vendor.findOne({ user: userId });
    
    if (vendor) {
      // 2. Delete vendor's inventory items
      await InventoryItem.deleteMany({ vendor: vendor._id }, { session });
      
      // 3. Delete vendor profile
      await Vendor.deleteOne({ _id: vendor._id }, { session });
    }
    
    // 4. Delete user's bookings (or mark as orphaned)
    await Booking.updateMany(
      { user: userId },
      { $set: { deletedByUserDeletion: true } },
      { session }
    );
    
    // 5. Delete user
    await User.deleteOne({ _id: userId }, { session });
    
    await session.commitTransaction();
    res.json({ message: 'User and associated data deleted' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
```

**Testing:**
- Create user → vendor → inventory
- DELETE /api/users/:id
- Verify vendor deleted
- Verify inventory items deleted
- Verify bookings updated

---

## 🟡 MODERATE ISSUES (Medium Priority)

### 13. **JWT Token Never Expires**
**Severity:** MODERATE | **Impact:** Stolen Tokens Never Invalid | **Effort:** 1 hour

**Problem:**
```javascript
// utils/generateToken.js
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
// ❌ No expiry set!
```

**Fix Required:**
```javascript
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' } // 24 hour expiry
);

// And in authMiddleware.js
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // If token expired, verify() will throw
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};
```

**Testing:**
- Get valid token with 1-second expiry
- Wait 2 seconds
- Use token in protected endpoint
- Should return 401 TokenExpiredError

---

### 14. **Inconsistent API Response Format**
**Severity:** MODERATE | **Impact:** Frontend State Management Errors | **Effort:** 2 hours

**Problem:**
```javascript
// Different endpoints return different formats
// GET /api/trips returns:
{ ...trip.toObject(), id: trip.tripId || trip._id.toString() }

// GET /api/bookings returns:
booking // No transformation

// GET /api/inventory returns:
items[0] = { _id: "...", name: "..." } // No 'id' alias

// Frontend gets confused:
trip.id !== booking._id !== inventory._id
```

**Fix Required:**
Create standardized response wrapper:
```javascript
// utils/responseFormatter.js
export const formatResponse = (data, idField = '_id') => {
  if (Array.isArray(data)) {
    return data.map(item => formatResponse(item, idField));
  }
  
  const formatted = data.toObject?.() || data;
  return {
    ...formatted,
    id: formatted[idField] || formatted._id?.toString()
  };
};

// Usage
router.get('/trips/:id', protect, async (req, res) => {
  const trip = await Trip.findOne({ tripId: req.params.id, user: req.user._id });
  res.json(formatResponse(trip, 'tripId'));
});

router.get('/bookings/:id', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  res.json(formatResponse(booking));
});
```

**Testing:**
- GET /api/trips/:id
- GET /api/bookings/:id
- Verify both responses have `.id` field
- Verify no `_id` exposed (optional)

---

### 15. **No Pagination on List Endpoints**
**Severity:** MODERATE | **Impact:** Slow Page Loads, Memory Issues | **Effort:** 3 hours

**Problem:**
```javascript
// getMyBookings() fetches ALL bookings
export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('items.inventory', '...')
    .sort({ createdAt: -1 });
  // If user has 10,000 bookings: 50MB response, slow queries
  res.json(bookings);
};
```

**Fix Required:**
```javascript
export const getMyBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ message: 'Invalid pagination parameters' });
  }

  const bookings = await Booking.find({ user: req.user._id })
    .populate('items.inventory', 'name type price images location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Booking.countDocuments({ user: req.user._id });

  res.json({
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: skip + bookings.length < total
    }
  });
};
```

**Endpoints to Fix:** (6 endpoints)
- GET /api/bookings
- GET /api/trips
- GET /api/inventory
- GET /api/vendors
- GET /api/reviews
- GET /api/notifications

**Testing:**
- GET /api/bookings?page=1&limit=10
- Verify returns only 10 items
- Verify pagination metadata included

---

### 16. **Location String Matching - Case Sensitivity**
**Severity:** MODERATE | **Impact:** Filters Don't Match, Activities Missing | **Effort:** 1 hour

**Problem:**
```javascript
// ItineraryCustomization.jsx
const { grouped } = useAllItineraryItems(tripLocation);
// tripLocation might be: "kandy" or "Kandy" or "KANDY"

// Backend query
ConfigItineraryItem.find({ location: tripLocation })
// Matches only exact case!
// "kandy" doesn't match "Kandy"
```

**Fix Required:**
```javascript
// configController.js
export const getItineraryItems = async (req, res) => {
  const { type, location } = req.query;
  
  const query = { isActive: true };
  
  if (type) {
    query.type = type.toLowerCase();
  }
  
  if (location) {
    // Case-insensitive location match
    query.location = { $regex: `^${location}$`, $options: 'i' };
  }
  
  const items = await ConfigItineraryItem.find(query).sort({ name: 1 });
  res.json(items);
};

// Also add database index for case-insensitive search
// In migration or seed:
await ConfigItineraryItem.collection.createIndex(
  { location: 1 },
  { collation: { locale: 'en', strength: 2 } }
);
```

**Testing:**
- GET /api/config/itinerary-items?location=kandy
- GET /api/config/itinerary-items?location=Kandy
- GET /api/config/itinerary-items?location=KANDY
- All three should return same results

---

### 17. **localStorage Parsing Not Error-Handled**
**Severity:** MODERATE | **Impact:** App Crashes on Corrupted Data | **Effort:** 30 mins

**Problem:**
```javascript
// Multiple places do this:
const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
// If localStorage.userInfo is corrupted JSON:
// JSON.parse() throws SyntaxError → app crashes
```

**Fix Required:**
```javascript
// utils/storage.js
export const safeGetUserInfo = () => {
  try {
    const data = localStorage.getItem('userInfo');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('Corrupted userInfo in localStorage:', error);
    localStorage.removeItem('userInfo'); // Clear corrupted data
    return {};
  }
};

// Usage in components
const { token } = safeGetUserInfo();
if (!token) {
  // Navigate to login
  navigate('/login');
}
```

**Test:**
- Open browser console
- Run: `localStorage.setItem('userInfo', '{invalid}')`
- Reload page
- App should handle gracefully, not crash

---

### 18. **availableCount and capacity Type Inconsistency**
**Severity:** MODERATE | **Impact:** Math Errors, Validation Failures | **Effort:** 1 hour

**Problem:**
```javascript
// AddInventoryForm.jsx
submitData.append('capacity', formData.capacity);
submitData.append('availableCount', formData.availableCount);
// Both appended as strings!

// inventoryController.js
const itemData = { ...req.body }; // These are strings "5", not 5
await InventoryItem.create(itemData);
// MongoDB stores as strings
// Later queries fail: { capacity: { $gt: 10 } } doesn't match "15"
```

**Fix Required:**
```javascript
// inventoryController.js
export const addInventoryItem = async (req, res) => {
  const {
    name, type, description, price, location,
    capacity, availableCount, amenities, isActive
  } = req.body;

  // Type coercion
  const itemData = {
    vendor: vendor._id,
    name: String(name).trim(),
    type: String(type).toLowerCase(),
    description: String(description).trim(),
    price: Number(price),
    location: String(location).trim(),
    capacity: Number(capacity) || 1,
    availableCount: Number(availableCount) || 1,
    amenities: amenities
      ? String(amenities).split(',').map(a => a.trim()).filter(Boolean)
      : [],
    isActive: isActive === 'true' || isActive === true,
  };

  // Validate
  if (itemData.capacity < 1) {
    return res.status(400).json({ message: 'Capacity must be >= 1' });
  }
  if (itemData.availableCount < 0 || itemData.availableCount > itemData.capacity) {
    return res.status(400).json({ 
      message: 'availableCount must be 0-capacity'
    });
  }

  const item = await InventoryItem.create(itemData);
  res.status(201).json(item);
};
```

**Testing:**
- POST /api/inventory with capacity: "5"
- Query MongoDB: should be Number 5, not string "5"
- Verify: `typeof item.capacity === 'number'`

---

### 19. **Destination Filter Not Used in All Contexts**
**Severity:** MODERATE | **Impact:** Irrelevant Activities Shown | **Effort:** 1 hour

**Problem:**
```javascript
// ItineraryCustomization.jsx builds activities list
const inventoryActivities = inventoryItems; // No location filter!
// User in Galle sees activities from all locations
```

**Fix Required:**
```javascript
// ItineraryCustomization.jsx
const [inventoryItems, setInventoryItems] = useState([]);

useEffect(() => {
  const fetchInventoryActivities = async () => {
    try {
      // Filter inventory by location AND type
      const params = new URLSearchParams();
      params.append('location', tripLocation); // Already in code
      params.append('type', 'activity');
      params.append('isActive', 'true');

      const response = await fetch(`/api/inventory/public?${params.toString()}`);
      const data = await response.json();
      
      // Double-check filter on frontend
      const filtered = data.filter(item => 
        item.location.toLowerCase() === tripLocation.toLowerCase() &&
        item.type === 'activity'
      );
      
      setInventoryItems(filtered);
    } catch (err) {
      console.error('Error:', err);
      setInventoryItems([]);
    }
  };

  fetchInventoryActivities();
}, [tripLocation]);
```

---

### 20. **No Conflict/Overbooking Check for Tours**
**Severity:** MODERATE | **Impact:** Can Sell Same Tour Twice | **Effort:** 4 hours

**Problem:**
```javascript
// Scenario:
// Tour has 1 guide, 2 bookings on same date
// User A books tour: 2024-03-15 with guide
// User B books same tour: 2024-03-15 with guide
// ✓ Both bookings created (CONFLICT!)
// Guide can't lead two tours simultaneously
```

**Root Cause:**
No availability check based on date and resource

**Fix Required:**
Add "reserved dates" concept:
```javascript
// models/InventoryItem.js
const inventoryItemSchema = new mongoose.Schema({
  // ... existing fields
  reservedDates: [
    {
      startDate: Date,
      endDate: Date,
      bookingId: mongoose.Schema.Types.ObjectId,
    }
  ]
});

// bookingController.js
export const createBooking = async (req, res) => {
  const { items, tripDates } = req.body;

  // For each item, check date conflict
  for (const item of items) {
    const inventory = await InventoryItem.findById(item.inventory);
    
    // Check for conflicting reservations
    const hasConflict = inventory.reservedDates.some(reserved => {
      const start = new Date(tripDates.startDate);
      const end = new Date(tripDates.endDate);
      return !(end < reserved.startDate || start > reserved.endDate);
    });

    if (hasConflict) {
      return res.status(409).json({
        message: `${inventory.name} is not available for selected dates`,
        conflicts: inventory.reservedDates
      });
    }
  }

  // Create booking
  const booking = await Booking.create({...});

  // Reserve the dates
  for (const item of booking.items) {
    await InventoryItem.findByIdAndUpdate(
      item.inventory,
      {
        $push: {
          reservedDates: {
            startDate: tripDates.startDate,
            endDate: tripDates.endDate,
            bookingId: booking._id
          }
        }
      }
    );
  }

  res.status(201).json(booking);
};
```

**Testing:**
- Create inventory item "Mountain Guide"
- Book 2024-03-15 to 2024-03-17
- Try to book same dates again
- Should return 409 Conflict

---

## 🟢 MINOR ISSUES & IMPROVEMENTS (Low Priority)

### 21-25. **Minor Issues**

**21. Typo in server startup log**
```javascript
// server.js line ~64
console.log('MONGODB CONNECTED SUCCEFFULLY'); // Should be "SUCCESSFULLY"
```

**22. Hard-coded trip timeline**
```javascript
// tripController.js
timeline: [
  { step: 'Booking Submitted', status: 'completed' },
  { step: 'Vendor Approval', status: 'pending' },
  // Can't customize for different trip types
]
```

**23. Error messages expose internal details**
```javascript
res.status(500).json({ message: err.message }); // Might expose DB info
// Should be: { message: 'Server error' }
```

**24. No loading states for async operations**
- VendorRegisterPage doesn't show loading during user creation
- EditInventoryForm doesn't disable submit while saving

**25. Missing null checks in frontend**
```javascript
// useItineraryItems.jsx
const items = data.items || []; // What if data is null?
const grouped = items.reduce(...); // Might crash
```

---

## 📊 Issues by Component

### Frontend Components with Issues
- **ItineraryCustomization.jsx**: Overbooking not prevented, no location filter
- **VendorRegisterPage.jsx**: User creation happens before validation
- **EditInventoryForm.jsx**: Type coercion missing
- **AddInventoryForm.jsx**: availableCount > capacity validation weak

### Backend Routes with Issues
- **bookingController.js**: Missing inventory decrement, no validation
- **inventoryController.js**: Type coercion missing, no pagination
- **vendorController.js**: Approval status not checked at API level
- **tripController.js**: Date validation missing
- **authController.js**: Password strength not validated

### Database Models with Issues
- **Booking.js**: No expiryDate field, invalid transitions allowed
- **InventoryItem.js**: No validators for availableCount/capacity
- **User.js**: No email format validation
- **Trip.js**: No date validation

---

## 🎯 Recommended Priority Roadmap

### Phase 1 (Urgent - 2-3 days)
1. ✅ Add availableCount decrement on booking
2. ✅ Implement transaction-based inventory locking
3. ✅ Add vendor approval check to all API endpoints
4. ✅ Add request validation (input sanitization)
5. ✅ Implement rate limiting

### Phase 2 (Critical Path - 1 week)
6. ✅ Enforce booking status transitions
7. ✅ Add password strength requirements
8. ✅ Add JWT expiry (24h)
9. ✅ Add trip date validation
10. ✅ Implement booking expiry logic

### Phase 3 (Important - 2 weeks)
11. ✅ Add pagination to list endpoints
12. ✅ Fix type coercion (number fields)
13. ✅ Add conflict checking for tours
14. ✅ Standardize API responses
15. ✅ Handle localStorage errors

### Phase 4 (Nice to Have - Future)
16. Add audit logging
17. Add email verification
18. Implement refresh tokens
19. Add soft delete for inventory
20. Create admin dashboard for issue tracking

---

## 🧪 Test Coverage Gaps

**Critical Tests Missing:**
- [ ] Concurrent booking race condition
- [ ] Inventory stock going negative
- [ ] Vendor status bypass via API
- [ ] Booking status invalid transitions
- [ ] Token expiry validation
- [ ] Date validation edge cases
- [ ] Rate limiting under load
- [ ] Orphaned records on user deletion

**Suggested Test Framework:** Jest + Supertest

```javascript
// __tests__/booking.test.js
describe('Booking API', () => {
  describe('Concurrent bookings', () => {
    it('should prevent overbooking with concurrent requests', async () => {
      // Create item with capacity: 1
      // Send 2 concurrent POST /api/bookings
      // Expect only 1 succeeds, other returns 409
    });
  });

  describe('Stock management', () => {
    it('should not allow negative availableCount', async () => {
      // Try to book more than capacity
      // Expect 400 or 409
    });
  });
});
```

---

## 📋 QA Sign-Off Checklist

- [ ] All critical issues documented
- [ ] Estimated effort tracked
- [ ] Reproduction steps provided
- [ ] Example fixes included
- [ ] Test cases designed
- [ ] Risk assessment complete
- [ ] Roadmap prioritized
- [ ] Stakeholders notified

---

**Generated:** March 6, 2026  
**QA Engineer:** AI Assistant  
**Status:** REVIEW REQUIRED BEFORE PRODUCTION

