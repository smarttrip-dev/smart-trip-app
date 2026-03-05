import mongoose from 'mongoose';

const configServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['accommodation', 'transport', 'activity', 'meal', 'package', 'other'], required: true },
    description: { type: String },
    icon: { type: String }, // For UI display
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ConfigService = mongoose.model('ConfigService', configServiceSchema);
export default ConfigService;
