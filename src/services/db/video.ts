import { Types } from "mongoose";
import VideoModal from "../../db/models/video";

const initiateVideoUpload = async (body: any) => {
  return await VideoModal.create(body);
};

const getAllVideos = async (tenantId: Types.ObjectId) => {
  return await VideoModal.find({ tenantId })
    .populate({
      path: "ownerId",
      select: "_id name email",
    })
    .select("_id upload originalFilename mimeType storageProvider size flags");
};

const updateVideodata = async (videoId: Types.ObjectId, body: any) => {
  return await VideoModal.updateOne({ _id: videoId }, body);
};

const video = {
  initiateVideoUpload,
  getAllVideos,
  updateVideodata
};

export default video;
