import mongoose from 'mongoose';

const configItineraryItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hotel', 'transport', 'activity', 'meal', 'service', 'room_upgrade'],
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Cultural', 'Adventure', 'Nature', 'Food', 'Shopping', 'Transport', 'Accommodation', 'Guide', 'Insurance', 'Room']
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String // e.g. "2 hours", "3.5 hours", "per day"
    },
    location: {
      type: String // city/location where available
    },
    // Hotel-specific fields
    rating: {
      type: Number, // 4.0 - 5.0
      min: 0,
      max: 5
    },
    amenities: {
      type: [String] // ['WiFi', 'Pool', 'Breakfast']
    },
    // Transport-specific fields
    comfort: {
      type: String,
      enum: ['Basic', 'Medium', 'High', 'Luxury']
    },
    // Activity-specific fields
    available: {
      type: Boolean,
      default: true
    },
    // Add-on specific fields
    frequency: {
      type: String,
      enum: ['per_day', 'per_person', 'one_time', 'per_room'],
      default: 'one_time'
    },
    // Common fields
    description: {
      type: String
    },
    icon: {
      type: String // e.g. 'user', 'camera', 'plane', 'shield'
    },
    image: {
      type: String // color code or URL
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index for efficient filtering
configItineraryItemSchema.index({ type: 1, category: 1 });
configItineraryItemSchema.index({ location: 1, type: 1 });
configItineraryItemSchema.index({ name: 1 });

const ConfigItineraryItem = mongoose.model('ConfigItineraryItem', configItineraryItemSchema);

export default ConfigItineraryItem;
