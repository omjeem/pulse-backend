import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import services from "../../services";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import Constants from "../../config/constants";
import { emitToRoom } from "../../socket";
const EVENTS = Constants.EVENTS;

const initiateDownload = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const { tenantId, originalFilename, mimeType, size, totalChunks } =
      req.body;

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
    emitToRoom(tenantId, EVENTS.initateDownload, {
      message: "Initiation Start",
    });
    return successResponse(
      res,
      "Video download initiate successfully",
      videoInit
    );
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const uploadInChunk = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const file = req.file;
    const { videoId, chunkIndex, totalChunks, tenantId } = body;
    const targetPath = `${videoId}::${chunkIndex}`;

    fs.rename(file?.path!, `${file?.destination}/${targetPath}`, (err) => {
      if (err) {
        console.log("Error in rename", err);
      }
    });

    emitToRoom(tenantId, EVENTS.chunkUpload, {
      chunkIndex,
      videoId,
      totalChunks,
      percentage: (
        ((parseInt(chunkIndex) + 1) / parseInt(totalChunks)) *
        100
      ).toFixed(2),
    });

    // console.log({ body, file });

    return successResponse(res, "Chunk uoloaded successfully", null);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const completeUpload = async (req: Request, res: Response) => {
  try {
    const { videoId, tenantId } = req.body;
    if (!videoId) {
      return res.status(400).json({ ok: false });
    }
    emitToRoom(tenantId, EVENTS.clubbingStart, { videoId });

    const parts = (await fsp.readdir(Constants.TEMP_DIR))
      .filter((f) => f.startsWith(`${videoId}::`))
      .sort((a, b) => {
        const ai = Number(a.split("::").pop());
        const bi = Number(b.split("::").pop());
        return ai - bi;
      });

    if (!parts.length) {
      return res.status(400).json({ ok: false, message: "No chunks found" });
    }

    const finalPath = path.join(
      Constants.FINAL_DIR,
      `${videoId}-${Date.now()}-random.mp4`
    );

    const writeStream = fs.createWriteStream(finalPath);

    for (const part of parts) {
      const partPath = path.join(Constants.TEMP_DIR, part);
      await new Promise<void>((resolve, reject) => {
        const rs = fs.createReadStream(partPath);
        rs.on("error", reject);
        rs.on("end", resolve);
        rs.pipe(writeStream, { end: false });
      });
    }

    await new Promise<void>((resolve, reject) => {
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
      writeStream.end();
    });

    await Promise.all(
      parts.map((p) => fsp.unlink(path.join(Constants.TEMP_DIR, p)))
    );

    const stats = await fsp.stat(finalPath);
    // console.log({ stats, finalPath });
    emitToRoom(tenantId, EVENTS.clubbingComplete, { videoId, finalPath });
    await services.video.updateVideodata(videoId, { filePath: finalPath });

    return successResponse(res, "Video Clubbed Successfully", {
      filePath: finalPath,
      size: stats.size,
    });
  } catch (err: any) {
    console.error(err);
    return errorResponse(res, err.message);
  }
};

const framesAnalysis = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const files: any = req.files;
    const { videoId, tenantId } = body;
    const framesPath = files?.map((f: any) => f.path);
    emitToRoom(tenantId, EVENTS.frameAnalysis, {
      videoId,
      totalFrames: framesPath.length,
    });
    const framesModeration = await services.moderation.frameModeration(
      framesPath,
      videoId,
      tenantId
    );
    emitToRoom(tenantId, EVENTS.frameAnalysisComplete, {
      framesModeration,
      videoId,
    });
    const { flagged } = framesModeration;
    console.log({ flagged });
    if (framesModeration.reason) {
      const update = await services.video.updateVideodata(videoId, {
        flags: [framesModeration.reason],
      });
      console.log({ update });
    }
    console.log({ framesModeration });
    return res.json({
      message: "ok",
      framesModeration,
    });
  } catch (error: any) {
    console.log("Error in frame analysis", error);
    return errorResponse(res, error.message);
  }
};

const getAllVideoInfoOfTenant = async (req: Request, res: Response) => {
  try {
    const { tenantId }: any = req.params;
    const videos = await services.video.getAllVideos(tenantId);
    return successResponse(
      res,
      "All Videos of Tenant Fetched Successfully",
      videos
    );
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

const video = {
  initiateDownload,
  uploadInChunk,
  completeUpload,
  framesAnalysis,
  getAllVideoInfoOfTenant,
};

export default video;
