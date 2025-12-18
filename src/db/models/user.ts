import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, lowercase: true },
  password: { type: String },
  isActive: { type: Boolean, default: true },
  profile: {
    avatarUrl: String,
    bio: String,
  },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

UserSchema.index({ email: 1 }, { unique: true });

const UserModal = mongoose.model("User", UserSchema);
export default UserModal;
