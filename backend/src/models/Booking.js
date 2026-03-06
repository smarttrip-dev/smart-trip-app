import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // inventory-based booking items (optional for itinerary bookings)
    items: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem',
        },
        priceAtBooking: {
          type: Number,
        },
      },
    ],
    // itinerary-based booking fields
    destination: { type: String, default: '' },
    location: { type: String, default: '' },
    duration: { type: String, default: '' },
    itinerarySummary: { type: mongoose.Schema.Types.Mixed, default: [] },
    totalCost: {
      type: Number,
      required: true,
    },
    tripDates: {
      startDate: { type: String },
      endDate: { type: String },
    },
    pax: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'expired'],
      default: 'pending',
      required: true,
    },
    // ⭐ MAJOR FIX #10: Booking expiry - 24h auto-expiry
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
    specialRequests: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    vendorNotes: {
      type: String,
      default: '',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
  },
  { timestamps: true }
);

// ⭐ MAJOR FIX #6: Booking status transitions (state machine)
// Prevent invalid status transitions
bookingSchema.pre('save', async function (next) {
  // Skip validation if status hasn't changed
  if (!this.isModified('status')) {
    return next();
  }

  // For new bookings, allow any status (default is 'pending')
  if (this.isNew) {
    return next();
  }

  // For existing bookings, validate state transitions
  try {
    const oldDoc = await this.constructor.findById(this._id);
    if (!oldDoc) {
      return next();
    }

    const oldStatus = oldDoc.status;
    const newStatus = this.status;

    // Valid state transitions
    const validTransitions = {
      pending: ['confirmed', 'rejected', 'cancelled', 'expired'],
      confirmed: ['rejected', 'cancelled', 'expired'],
      rejected: [],
      cancelled: [],
      expired: ['cancelled'],
    };

    // Check if transition is valid
    if (oldStatus !== newStatus) {
      if (!validTransitions[oldStatus] || !validTransitions[oldStatus].includes(newStatus)) {
        const err = new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
        return next(err);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ⭐ MAJOR FIX #10: Check if booking expired on query
// FIXED: Properly handle async operation and use correct syntax
bookingSchema.pre(/^find/, async function (next) {
  try {
    // Auto-expire pending bookings that are past expiryDate
    const now = new Date();
    await this.model.updateMany(
      {
        status: 'pending',
        expiryDate: { $lt: now },
      },
      {
        $set: { status: 'expired' },
      }
    );
    next();
  } catch (error) {
    next(error);
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
