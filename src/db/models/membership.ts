import mongoose, { Types } from "mongoose";

const MembershipSchema = new mongoose.Schema({

  tenantId: { type: Types.ObjectId, required: true, index: true, ref: "Tenant" },
  userId: { type: Types.ObjectId, required: true, index: true, ref: "User" },

  role: {
    type: String,
    enum: ["owner", "admin", "editor", "viewer"],
    required: true,
  },

  teams: [{ type: Types.ObjectId, ref: 'Team' }], 

  status: {
    type: String,
    enum: ["active", "invited", "suspended"],
    default: "active",
  },

  createdAt: { type: Date, default: Date.now },
  invitedBy: { type: String }, 
});

MembershipSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

const MembershipModal = mongoose.model("Membership", MembershipSchema);
export default MembershipModal;
