import mongoose from 'mongoose';

const configBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String }, // Bank code or SWIFT code prefix
    country: { type: String, default: 'Sri Lanka' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ConfigBank = mongoose.model('ConfigBank', configBankSchema);
export default ConfigBank;
