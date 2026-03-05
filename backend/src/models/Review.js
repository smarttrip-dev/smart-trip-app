import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // The booking this review is for (optional – customer may review after booking)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    // The specific inventory item being reviewed
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      default: null,
    },
    // The vendor who owns the service
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    // Customer who wrote the review
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 1–5 star rating
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Optional sub-ratings
    subRatings: {
      cleanliness:   { type: Number, min: 1, max: 5, default: null },
      valueForMoney: { type: Number, min: 1, max: 5, default: null },
      communication: { type: Number, min: 1, max: 5, default: null },
      accuracy:      { type: Number, min: 1, max: 5, default: null },
    },
    title:           { type: String, default: '' },
    body:            { type: String, required: true },
    recommend:       { type: Boolean, default: true },
    // Vendor reply
    vendorReply: {
      text:       { type: String, default: '' },
      repliedAt:  { type: Date, default: null },
    },
    isVisible:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent the same customer from reviewing the same booking twice
reviewSchema.index({ booking: 1, customer: 1 }, { unique: true, sparse: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
