import mongoose from 'mongoose';

const configWorkflowSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['completed', 'current', 'pending'], required: true },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create unique index for order
configWorkflowSchema.index({ order: 1 }, { unique: true });

const ConfigWorkflow = mongoose.model('ConfigWorkflow', configWorkflowSchema);
export default ConfigWorkflow;
