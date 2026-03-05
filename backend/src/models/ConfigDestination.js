import mongoose from 'mongoose';

const configDestinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    tag: { type: String, enum: ['Cultural', 'Coastal', 'Hill Country', 'Heritage', 'Wildlife', 'Nature', 'Beach', 'City', 'Other'], required: true },
    emoji: { type: String },
    description: { type: String },
    defaultDays: { type: Number, default: 3 },
    defaultPrice: { type: Number, default: 50000 },
    region: { type: String }, // City or region
    attractions: [{ type: String }], // Key attractions
    image: { type: String }, // Featured image URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ConfigDestination = mongoose.model('ConfigDestination', configDestinationSchema);
export default ConfigDestination;
