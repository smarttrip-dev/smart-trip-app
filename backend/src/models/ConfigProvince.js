import mongoose from 'mongoose';

const configProvinceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ConfigProvince = mongoose.model('ConfigProvince', configProvinceSchema);
export default ConfigProvince;
