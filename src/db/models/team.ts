import mongoose, { Types } from 'mongoose';

const TeamSchema = new mongoose.Schema({
  tenantId: { type: Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  memberIds: [{ type: Types.ObjectId }],
  createdAt: { type: Date, default: Date.now }
});

TeamSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const TeamModal = mongoose.model('Team', TeamSchema);
export default TeamModal;
