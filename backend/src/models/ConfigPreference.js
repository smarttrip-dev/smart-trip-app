import mongoose from 'mongoose';

const configPreferenceSchema = new mongoose.Schema(
  {
    category: { 
      type: String, 
      enum: ['travelStyle', 'accommodationType', 'mealPlan', 'activityInterest', 'travelInterest', 'language', 'dietaryRestriction', 'accessibility'],
      required: true 
    },
    value: { type: String, required: true },
    label: { type: String }, // Display name
    icon: { type: String }, // For UI
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create unique index for category + value combination
configPreferenceSchema.index({ category: 1, value: 1 }, { unique: true });

const ConfigPreference = mongoose.model('ConfigPreference', configPreferenceSchema);
export default ConfigPreference;
