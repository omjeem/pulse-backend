import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    originalFilename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    upload: {
      totalChunks: {
        type: Number,
      },
      receivedChunks: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["uploading", "assembled", "processing", "processed"],
      default: "uploading",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    sensitivity: {
      type: String,
      enum: ["unknown", "safe", "flagged"],
      default: "unknown",
      index: true,
    },
    flags: [
      {
        type: String,
      },
    ],
    uploadedAt: {
      type: Date,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

VideoSchema.index({ tenantId: 1, ownerId: 1 });
VideoSchema.index({ tenantId: 1, sensitivity: 1 });
VideoSchema.index({ tenantId: 1, status: 1 });

const VideoModel = mongoose.model("Video", VideoSchema);
export default VideoModel;
