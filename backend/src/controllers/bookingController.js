import Booking from '../models/Booking.js';
import InventoryItem from '../models/InventoryItem.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// GET /api/bookings  — current user's bookings
export const getMyBookings = async (req, res) => {
  try {
    console.log('📥 GET /api/bookings - User:', req.user._id);
    const bookings = await Booking.find({ user: req.user._id })
      .populate('items.inventory', 'name type price images location')
      .sort({ createdAt: -1 });
    console.log(`✅ Found ${bookings.length} bookings for user ${req.user._id}`);
    
    // Debug: Log status breakdown
    const statusBreakdown = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Bookings by status:', statusBreakdown);
    
    res.json(bookings);
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      'items.inventory',
      'name type price images location description'
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings  — create a booking (inventory-based OR itinerary-based)
export const createBooking = async (req, res) => {
  try {
    console.log('📥 Received booking request:', JSON.stringify(req.body, null, 2));
    
    // Safety check: ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const {
      items, tripDates, pax, specialRequests,
      destination, location, duration, itinerarySummary, totalCost: bodyTotal,
    } = req.body;

    // ──────────────────────────────────────────────────────────────────────
    // INPUT VALIDATION
    // ──────────────────────────────────────────────────────────────────────
    
    // Validate pax
    if (pax) {
      const { adults = 1, children = 0, infants = 0 } = pax;
      if (!Number.isInteger(adults) || adults < 1) {
        return res.status(400).json({ message: 'adults must be an integer >= 1' });
      }
      if (!Number.isInteger(children) || children < 0) {
        return res.status(400).json({ message: 'children must be a non-negative integer' });
      }
      if (!Number.isInteger(infants) || infants < 0) {
        return res.status(400).json({ message: 'infants must be a non-negative integer' });
      }
    }

    // Validate trip dates
    if (tripDates?.startDate) {
      const startDate = new Date(tripDates.startDate);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid startDate format' });
      }
    }
    if (tripDates?.endDate) {
      const endDate = new Date(tripDates.endDate);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format' });
      }
      if (tripDates.startDate) {
        const start = new Date(tripDates.startDate);
        if (endDate <= start) {
          return res.status(400).json({ message: 'endDate must be after startDate' });
        }
      }
    }

    // Validate totalCost
    if (typeof bodyTotal !== 'number' || bodyTotal < 0) {
      return res.status(400).json({ message: 'totalCost must be a non-negative number' });
    }

    // ── Itinerary-based booking (no items) ────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      if (!bodyTotal)
        return res.status(400).json({ message: 'totalCost is required for itinerary bookings' });

      const booking = await Booking.create({
        user: req.user._id,
        items: [],
        destination: destination || '',
        location: location || '',
        duration: duration || '',
        itinerarySummary: itinerarySummary || [],
        totalCost: bodyTotal,
        tripDates: tripDates || {},
        pax: pax || { adults: 1, children: 0, infants: 0 },
        specialRequests: specialRequests || '',
      });

      console.log(`✅ Itinerary booking created: ${booking._id} for user: ${req.user._id}, status: ${booking.status}`);

      // ⭐ NOTIFY ADMINS about new itinerary booking
      try {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await createNotification({
            userId: admin._id,
            type: 'info',
            title: 'New Custom Trip Booking',
            message: `New custom trip booking (ID: #${booking._id.toString().slice(-6)}) for ${destination || location} from ${req.user.name}. Please assign vendors.`,
            bookingId: booking._id,
          });
        }
        console.log(`📧 Notified ${admins.length} admin(s) about itinerary booking`);
      } catch (notifyErr) {
        console.error('Failed to notify admins:', notifyErr.message);
      }

      // Notify user
      await createNotification({
        userId: req.user._id,
        type: 'success',
        title: 'Trip Request Submitted',
        message: `Your custom trip request has been submitted. Our team will contact you within 24 hours to confirm details.`,
        bookingId: booking._id,
      });

      return res.status(201).json(booking);
    }

    // ── Inventory-based booking ──────────────────────────────────────────
    let totalCost = 0;
    const resolvedItems = [];
    const vendorMap = new Map(); // Map vendorId -> array of inventory item names

    for (const item of items) {
      let inv;
      try {
        inv = await InventoryItem.findById(item.inventory).populate('vendor');
      } catch (castErr) {
        console.warn(`Skipping invalid inventory ID: ${item.inventory}`);
        continue; // skip fake/malformed IDs
      }
      if (!inv) {
        console.warn(`Inventory item not found, skipping: ${item.inventory}`);
        continue; // skip missing items instead of failing the whole booking
      }
      
      // ⭐ CHECK AVAILABILITY — treat undefined/null availableCount as unlimited
      if (inv.availableCount !== undefined && inv.availableCount !== null && inv.availableCount < 1) {
        return res.status(409).json({ 
          message: `${inv.name} is currently unavailable (0 in stock)`,
          unavailableItem: inv._id
        });
      }
      
      const price = item.priceAtBooking ?? inv.price;
      totalCost += price;
      resolvedItems.push({ inventory: inv._id, priceAtBooking: price });
      
      // Track vendor for this item
      if (inv.vendor) {
        const vendorKey = inv.vendor._id.toString();
        if (!vendorMap.has(vendorKey)) {
          vendorMap.set(vendorKey, {
            vendor: inv.vendor,
            items: []
          });
        }
        vendorMap.get(vendorKey).items.push(inv.name);
      }
    }

    // If none of the items resolved (all fake/fallback), treat as itinerary booking
    if (resolvedItems.length === 0) {
      const booking = await Booking.create({
        user: req.user._id,
        items: [],
        destination: destination || '',
        location: location || '',
        duration: duration || '',
        itinerarySummary: itinerarySummary || [],
        totalCost: bodyTotal,
        tripDates: tripDates || {},
        pax: pax || { adults: 1, children: 0, infants: 0 },
        specialRequests: specialRequests || '',
      });
      console.log(`✅ Itinerary booking created (no valid inventory): ${booking._id}`);
      return res.status(201).json(booking);
    }

    // Assign primary vendor (first vendor in the list, or null if none)
    const primaryVendorId = vendorMap.size > 0 ? Array.from(vendorMap.keys())[0] : null;

    const booking = await Booking.create({
      user: req.user._id,
      items: resolvedItems,
      totalCost,
      tripDates: tripDates || {},
      pax: pax || { adults: 1, children: 0, infants: 0 },
      specialRequests: specialRequests || '',
      vendor: primaryVendorId, // Assign primary vendor
    });
    
    console.log(`✅ Inventory booking created: ${booking._id} for user: ${req.user._id}, status: ${booking.status}, items: ${resolvedItems.length}`);

    // ⭐ DECREMENT INVENTORY — only decrement if availableCount is tracked (>= 0)
    for (const item of booking.items) {
      await InventoryItem.findOneAndUpdate(
        { _id: item.inventory, availableCount: { $gte: 1 } },
        { $inc: { availableCount: -1 } }
      );
      // If no document matched (count was 0 or field missing), that's OK —
      // items without availableCount tracking are treated as unlimited
    }

    // ⭐ NOTIFY ALL VENDORS (CRITICAL FIX #11: Vendor notifications)
    console.log(`📧 Notifying ${vendorMap.size} vendor(s) about booking #${booking._id}`);
    for (const [vendorIdStr, vendorData] of vendorMap.entries()) {
      try {
        const { vendor, items: vendorItems } = vendorData;
        
        if (vendor && vendor.user) {
          const itemsList = vendorItems.join(', ');
          await createNotification({
            userId: vendor.user,
            type: 'info',
            title: 'New Booking Request',
            message: `You have a new booking request (ID: #${booking._id.toString().slice(-6)}) from ${req.user.name}. Items: ${itemsList}. Please review and respond within 24 hours.`,
            bookingId: booking._id,
          });
          console.log(`✅ Notified vendor: ${vendor.businessName}`);
        }
      } catch (notifyErr) {
        console.error(`❌ Failed to notify vendor ${vendorIdStr}:`, notifyErr.message);
      }
    }

    // Notify user about successful booking submission
    await createNotification({
      userId: req.user._id,
      type: 'success',
      title: 'Booking Submitted',
      message: `Your booking request has been submitted successfully. You will receive confirmation from the vendor(s) within 24-48 hours.`,
      bookingId: booking._id,
    });

    console.log('✅ Booking created successfully:', booking._id);
    res.status(201).json(booking);
  } catch (err) {
    console.error('❌ Booking creation error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      details: err.toString()
    });
  }
};

// PUT /api/bookings/:id  — user updates their own pending booking
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'Only pending bookings can be modified' });

    const {
      destination, location, duration, itinerarySummary,
      totalCost, tripDates, pax, specialRequests,
    } = req.body;

    if (destination !== undefined)       booking.destination       = destination;
    if (location !== undefined)          booking.location          = location;
    if (duration !== undefined)          booking.duration          = duration;
    if (itinerarySummary !== undefined)  booking.itinerarySummary  = itinerarySummary;
    if (totalCost !== undefined)         booking.totalCost         = totalCost;
    if (tripDates !== undefined)         booking.tripDates         = tripDates;
    if (pax !== undefined)               booking.pax               = pax;
    if (specialRequests !== undefined)   booking.specialRequests   = specialRequests;

    const updated = await booking.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/cancel  — user cancels own booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('items.inventory');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    if (['cancelled', 'rejected'].includes(booking.status))
      return res.status(400).json({ message: 'Booking already closed' });

    const previousStatus = booking.status;
    booking.status = 'cancelled';
    await booking.save();

    // ⭐ RESTORE INVENTORY (CRITICAL FIX #12: Restore inventory on cancellation)
    if (booking.items && booking.items.length > 0) {
      console.log(`🔄 Restoring inventory for ${booking.items.length} items...`);
      for (const item of booking.items) {
        try {
          await InventoryItem.findByIdAndUpdate(
            item.inventory._id || item.inventory,
            { $inc: { availableCount: 1 } },
            { new: true, runValidators: true }
          );
          console.log(`✅ Restored inventory: ${item.inventory.name || item.inventory}`);
        } catch (restoreErr) {
          console.error(`❌ Failed to restore inventory ${item.inventory}:`, restoreErr.message);
        }
      }
    }

    // ⭐ NOTIFY VENDOR(S) about cancellation
    if (booking.vendor) {
      try {
        const vendor = await Vendor.findById(booking.vendor).populate('user');
        if (vendor && vendor.user) {
          await createNotification({
            userId: vendor.user._id,
            type: 'warning',
            title: 'Booking Cancelled',
            message: `Booking #${booking._id.toString().slice(-6)} has been cancelled by the customer.`,
            bookingId: booking._id,
          });
        }
      } catch (notifyErr) {
        console.error('Failed to notify vendor about cancellation:', notifyErr.message);
      }
    }

    res.json(booking);
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/status  — admin/vendor updates status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id).populate('items.inventory');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const prevStatus = booking.status;
    
    // ⭐ MAJOR FIX #6: Validate status transitions (state machine)
    if (status && status !== prevStatus) {
      const validTransitions = {
        pending: ['confirmed', 'rejected', 'cancelled', 'expired'],
        confirmed: ['rejected', 'cancelled', 'expired'],
        rejected: [],
        cancelled: [],
        expired: ['cancelled'],
      };

      if (!validTransitions[prevStatus] || !validTransitions[prevStatus].includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${prevStatus} to ${status}`,
          currentStatus: prevStatus,
          allowedStatuses: validTransitions[prevStatus] || [],
        });
      }

      booking.status = status;
    }

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();

    // ⭐ RESTORE INVENTORY for rejected/cancelled/expired bookings (CRITICAL FIX #13)
    if (status && ['rejected', 'cancelled', 'expired'].includes(status) && prevStatus !== status) {
      if (booking.items && booking.items.length > 0) {
        console.log(`🔄 Restoring inventory for ${status} booking #${booking._id}...`);
        for (const item of booking.items) {
          try {
            await InventoryItem.findByIdAndUpdate(
              item.inventory._id || item.inventory,
              { $inc: { availableCount: 1 } },
              { new: true, runValidators: true }
            );
            console.log(`✅ Restored inventory: ${item.inventory.name || item.inventory}`);
          } catch (restoreErr) {
            console.error(`❌ Failed to restore inventory ${item.inventory}:`, restoreErr.message);
          }
        }
      }
    }

    // Notify user on admin status changes
    const destination = booking.destination || 'your trip';
    if (status && status !== prevStatus) {
      if (status === 'confirmed') {
        await createNotification({
          userId: booking.user,
          type: 'booking_confirmed',
          title: '🎉 Booking Confirmed!',
          message: `Your booking for "${destination}" has been confirmed. You can now proceed to payment.`,
          bookingId: booking._id,
        });
        await createNotification({
          userId: booking.user,
          type: 'payment_due',
          title: '💳 Payment Required',
          message: `Please complete your payment of LKR ${booking.totalCost.toLocaleString()} for "${destination}" to secure your booking.`,
          bookingId: booking._id,
        });
      } else if (status === 'rejected') {
        await createNotification({
          userId: booking.user,
          type: 'booking_rejected',
          title: '❌ Booking Not Confirmed',
          message: `Unfortunately, your booking for "${destination}" could not be confirmed. The reserved items have been released.`,
          bookingId: booking._id,
        });
      } else if (status === 'expired') {
        await createNotification({
          userId: booking.user,
          type: 'booking_expired',
          title: '⏰ Booking Expired',
          message: `Your booking for "${destination}" has expired and is no longer available.`,
          bookingId: booking._id,
        });
      }
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/assign-vendor  — admin assigns a vendor to a booking
export const assignVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
      booking.vendor = vendor._id;

      // Notify the vendor
      try {
        await createNotification({
          userId: vendor.user,
          type: 'info',
          title: 'New Booking Assigned',
          message: `A booking for "${booking.destination || booking.location}" has been assigned to you by admin.`,
          bookingId: booking._id,
        });
      } catch (e) { /* non-critical */ }
    } else {
      booking.vendor = null; // unassign
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/all  — admin: all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('items.inventory', 'name type price')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/vendor  — vendor: only their bookings
export const getVendorBookings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const inventoryItems = await InventoryItem.find({ vendor: vendor._id }).select('_id');
    const inventoryIds = inventoryItems.map(i => i._id);

    // Match bookings that either:
    // 1. Contain this vendor's inventory items, OR
    // 2. Were directly assigned to this vendor (itinerary bookings)
    const bookings = await Booking.find({
      $or: [
        { 'items.inventory': { $in: inventoryIds } },
        { vendor: vendor._id }
      ]
    })
      .populate('user', 'name email phone')
      .populate('items.inventory', 'name type price')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/vendor-action  — vendor approves or rejects their booking
export const vendorBookingAction = async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'confirmed' | 'rejected'
    if (!['confirmed', 'rejected'].includes(action))
      return res.status(400).json({ message: 'action must be confirmed or rejected' });

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const inventoryItems = await InventoryItem.find({ vendor: vendor._id }).select('_id');
    const inventoryIds = inventoryItems.map(i => i._id.toString());

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify this booking belongs to this vendor — either via inventory items OR direct assignment
    const belongsByItems = booking.items.some(item => inventoryIds.includes(item.inventory?.toString()));
    const belongsByAssignment = booking.vendor?.toString() === vendor._id.toString();
    if (!belongsByItems && !belongsByAssignment)
      return res.status(403).json({ message: 'Not authorised to update this booking' });

    if (booking.status !== 'pending')
      return res.status(400).json({ message: `Booking is already ${booking.status}` });

    booking.status = action;
    if (notes) booking.vendorNotes = notes;
    await booking.save();

    // Notify the user
    const destination = booking.destination || 'your trip';
    if (action === 'confirmed') {
      await createNotification({
        userId: booking.user,
        type: 'booking_confirmed',
        title: '🎉 Booking Confirmed!',
        message: `Your booking for "${destination}" has been confirmed by the vendor. You can now proceed to payment.`,
        bookingId: booking._id,
      });
      await createNotification({
        userId: booking.user,
        type: 'payment_due',
        title: '💳 Payment Required',
        message: `Please complete your payment of LKR ${booking.totalCost.toLocaleString()} for "${destination}" to secure your booking.`,
        bookingId: booking._id,
      });
    } else if (action === 'rejected') {
      await createNotification({
        userId: booking.user,
        type: 'booking_rejected',
        title: '❌ Booking Not Confirmed',
        message: `Unfortunately, your booking for "${destination}" could not be confirmed by the vendor.${notes ? ` Reason: ${notes}` : ''} Please contact support or try a different date.`,
        bookingId: booking._id,
      });
    }

    const updated = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('items.inventory', 'name type price');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/pay  — user pays for a confirmed booking
export const payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorised' });
    if (booking.status !== 'confirmed')
      return res.status(400).json({ message: 'Booking must be confirmed before payment' });
    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Booking is already paid' });

    booking.paymentStatus = 'paid';
    await booking.save();

    // Get user info for notification
    const user = await booking.populate('user', 'name email');
    const destination = booking.destination || 'your trip';

    // Notify user of successful payment
    await createNotification({
      userId: booking.user,
      type: 'payment_received',
      title: '✅ Payment Successful!',
      message: `Your payment of LKR ${booking.totalCost.toLocaleString()} for "${destination}" has been received. Your trip is now fully booked!`,
      bookingId: booking._id,
    });

    // Notify vendor(s) about payment received
    let vendorIds = [];
    
    // Add explicit vendor if set (for itinerary bookings)
    if (booking.vendor) {
      vendorIds.push(booking.vendor.toString());
    }
    
    // Add vendors from inventory items
    if (booking.items && booking.items.length > 0) {
      const inventoryIds = booking.items.map(item => item.inventory).filter(id => id);
      const inventories = await InventoryItem.find({ _id: { $in: inventoryIds } })
        .select('vendor')
        .lean();
      const itemVendorIds = inventories.map(inv => inv.vendor.toString());
      vendorIds = [...new Set([...vendorIds, ...itemVendorIds])]; // Remove duplicates
    }

    // Send notification to each vendor
    for (const vendorId of vendorIds) {
      const vendor = await Vendor.findById(vendorId).select('user');
      if (vendor) {
        await createNotification({
          userId: vendor.user,
          type: 'payment_received',
          title: '💰 Payment Received',
          message: `Payment of LKR ${booking.totalCost.toLocaleString()} from ${user.user?.name || 'Customer'} for booking "${destination}" has been successfully received.`,
          bookingId: booking._id,
        });
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
