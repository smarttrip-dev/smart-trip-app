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
bookingSchema.pre('save', function (next) {
  if (!this.isModified('status')) return next();

  const currentStatus = this.isNew ? 'pending' : this.constructor.schema.obj.status.default;
  const newStatus = this.status;

  // Valid state transitions
  const validTransitions = {
    pending: ['confirmed', 'rejected', 'cancelled', 'expired'],
    confirmed: ['rejected', 'cancelled', 'expired'], // confirmed can't go back to pending
    rejected: [], // rejected is final
    cancelled: [], // cancelled is final
    expired: ['cancelled'], // expired can be cancelled
  };

  // Get the old status if document exists in DB
  if (!this.isNew) {
    const oldStatus = this.constructor.findOne({ _id: this._id }).exec().then((doc) => {
      if (doc && doc.status !== newStatus) {
        if (!validTransitions[doc.status] || !validTransitions[doc.status].includes(newStatus)) {
          throw new Error(`Invalid status transition from ${doc.status} to ${newStatus}`);
        }
      }
    });
    return oldStatus.then(() => next()).catch(next);
  }

  next();
});

// ⭐ MAJOR FIX #10: Check if booking expired on query
bookingSchema.pre(/^find/, function (next) {
  // Auto-expire pending bookings that are past expiryDate
  const now = new Date();
  this.updateMany(
    {
      status: 'pending',
      expiryDate: { $lt: now },
    },
    {
      status: 'expired',
    }
  );
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
