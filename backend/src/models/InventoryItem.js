import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['accommodation', 'transport', 'activity', 'meal', 'package', 'other'],
      required: true,
      default: 'other',
    },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, enum: ['LKR', 'USD', 'EUR'], default: 'LKR' },
    capacity: { type: Number, default: 1 },       // max units/seats/rooms available
    availableCount: {
      type: Number,
      default: 1,
      // ⭐ MAJOR FIX #7: Prevent negative availableCount
      validate: [
        {
          validator: function (value) {
            return value >= 0;
          },
          message: 'availableCount cannot be negative',
        },
        {
          validator: function (value) {
            // Only validate against capacity if capacity is set
            if (this.capacity === undefined || this.capacity === null) {
              return true;
            }
            return value <= this.capacity;
          },
          message: 'availableCount cannot exceed capacity',
        },
      ],
      min: [0, 'availableCount cannot be negative'],
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
