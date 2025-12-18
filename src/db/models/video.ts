import mongoose, { Types } from 'mongoose';

const VideoSchema = new mongoose.Schema({
  tenantId: { type: Types.ObjectId, required: true, index: true, ref: 'Tenant' },
  ownerId: { type: Types.ObjectId, required: true, index: true, ref: 'User' },

  originalFilename: { type: String, required: true },
  mimeType: { type: String },
  filePath: { type: String }, 
  storageProvider: { type: String, default: 'local' }, 
  size: { type: Number },

  duration: { type: Number },
  width: Number,
  height: Number,
  thumbnails: [{ url: String, width: Number, height: Number }],

  upload: {
    totalChunks: { type: Number },
    receivedChunks: { type: Number, default: 0 }
  },

  visibility: { type: String, enum: ['private','team','tenant','public'], default: 'private', index: true },

  sharedWithUsers: [{
    userId: { type: Types.ObjectId },
    roleAllowed: { type: String, enum: ['viewer','editor'], default: 'viewer' }
  }],

  sharedWithTeams: [{ type: Types.ObjectId }], 

  status: { type: String, enum: ['uploading','assembled','processing','processed','failed'], default: 'uploading', index: true },
  progress: { type: Number, default: 0 },

  sensitivity: { type: String, enum: ['unknown','safe','flagged'], default: 'unknown', index: true },
  flags: [{ type: String }],
  moderationReport: { type: mongoose.Schema.Types.Mixed },

  createdBy: { type: String },
  updatedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date }, 
});

VideoSchema.index({ tenantId: 1, status: 1 });
VideoSchema.index({ tenantId: 1, sensitivity: 1 });
VideoSchema.index({ tenantId: 1, ownerId: 1, createdAt: -1 });

const VideoModal = mongoose.model('Video', VideoSchema);
export default VideoModal;
