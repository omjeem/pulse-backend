import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

TenantSchema.index({ slug: 1 }, { unique: true });

const TenantModel = mongoose.model("Tenant", TenantSchema);
export default TenantModel;
