import mongoose from 'mongoose';

const configCitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    province: { type: String, required: true },
    region: { type: String }, // e.g., "Hill Country", "Coastal", "Cultural"
    isActive: { type: Boolean, default: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    description: { type: String }, // Short description for UI
  },
  { timestamps: true }
);

const ConfigCity = mongoose.model('ConfigCity', configCitySchema);
export default ConfigCity;
