import VideoModal from "../../db/models/video";

const initiateVideoUpload = async (body: any) => {
  return await VideoModal.create(body);
};

const video = {
  initiateVideoUpload,
};

export default video;
