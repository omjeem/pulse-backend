import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String },
    isActive: { type: Boolean, default: true },
    profile: {
      avatarUrl: String,
      bio: String,
    },
    lastLoginAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model("User", UserSchema);
export default UserModal;
