import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema({
  type: { type: String }, // transport, hotel, activity, meal, special
  name: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const itinerarySectionSchema = new mongoose.Schema({
  time: { type: String },
  items: [itineraryItemSchema]
}, { _id: false });

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number },
  date: { type: String },
  sections: [itinerarySectionSchema]
}, { _id: false });

const timelineStepSchema = new mongoose.Schema({
  step: { type: String },
  status: { type: String, enum: ['completed', 'current', 'pending'] },
  date: { type: String, default: null }
}, { _id: false });

const travelerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  type: { type: String, enum: ['Adult', 'Child'] }
}, { _id: false });

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripId: {
      type: String,
      unique: true,
    },
    destination: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    dates: {
      from: { type: String },
      to: { type: String },
    },
    totalCost: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    travelers: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
    },
    travelerDetails: [travelerSchema],
    bookingDate: { type: String },
    image: { type: String, default: '#667eea' },
    duration: { type: String },
    vendor: { type: String },
    specialRequests: { type: String, default: '' },
    reviewStatus: {
      type: String,
      enum: ['pending', 'completed', 'none'],
      default: 'none',
    },
    timeline: [timelineStepSchema],
    itinerary: [itineraryDaySchema],
  },
  { timestamps: true }
);

// Auto-generate tripId before saving if not provided
// ⭐ MAJOR FIX #11: Trip date validation
tripSchema.pre('save', async function (next) {
  if (!this.tripId) {
    const prefix = this.location
      ? this.location.substring(0, 3).toUpperCase()
      : 'TRP';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.tripId = `ST${year}-${prefix}-${random}`;
  }
  if (!this.bookingDate) {
    this.bookingDate = new Date().toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric'
    });
  }

  // ⭐ MAJOR FIX #11: Validate trip dates
  if (this.dates?.from && this.dates?.to) {
    const fromDate = new Date(this.dates.from);
    const toDate = new Date(this.dates.to);

    // Check if dates are valid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return next(new Error('Trip dates must be valid date strings (YYYY-MM-DD or ISO format)'));
    }

    // Check if end date is after start date
    if (toDate <= fromDate) {
      return next(new Error('Trip end date must be after start date'));
    }

    // Only check future date constraint for new trips (not seeded data)
    // In production, trips should be future-dated. In development, allow historical trips.
    if (process.env.NODE_ENV === 'production' && this.isNew) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (fromDate < today) {
        return next(new Error('Trip start date cannot be in the past'));
      }
    }
  }

  next();
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
