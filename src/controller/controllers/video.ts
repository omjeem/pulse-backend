import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import services from "../../services";

const initiateDownload = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const { tenantId, originalFilename, mimeType, size, totalChunks } =  req.body;

    const videoObj = {
      tenantId,
      ownerId: userId,
      originalFilename,
      mimeType,
      size,
      upload: {
        totalChunks,
      },
      createdBy: userId,
      updatedBy: userId,
      visibility: "public",
    };

    const videoInit = await services.video.initiateVideoUpload(videoObj);
    
    return successResponse(
      res,
      "Video download initiate successfully",
      videoInit
    );
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const video = {
  initiateDownload,
};

export default video;
