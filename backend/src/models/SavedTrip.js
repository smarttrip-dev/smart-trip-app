import mongoose from 'mongoose';

const savedTripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: { type: String, required: true },
    location: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
    duration: { type: String },
    thumbnail: { type: String, default: '#667eea' },
    highlights: [{ type: String }],
    accommodationType: { type: String },
    travelers: { type: String },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const SavedTrip = mongoose.model('SavedTrip', savedTripSchema);

export default SavedTrip;
