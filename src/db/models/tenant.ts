import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const TenantModel = mongoose.model("Tenant", TenantSchema);
export default TenantModel;
