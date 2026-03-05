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
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending',
      required: true,
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

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
