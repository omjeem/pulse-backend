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
    const { tenantId }: any = req.params;
    console.log({userId, tenantId})
    const { originalFilename, mimeType, size, totalChunks } = req.body;

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
    console.log(req.body);
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

    const tenantDir = path.join(Constants.FINAL_DIR, tenantId);

    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const finalPath = path.join(tenantDir, `${videoId}.mp4`);

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

const streamVideo = async (req: Request, res: Response) => {
  try {
    const { tenantId, videoId }: any = req.params;

    console.log(req.body);
    const isVideoExists = await services.video.getVideoInfo({
      tenantId,
      _id: videoId,
    });

    if (!isVideoExists || isVideoExists.length === 0 || !isVideoExists[0]) {
      throw new Error("Video not found");
    }
    const videoData = isVideoExists[0];

    const videoPath = path.join(
      process.cwd(),
      "dist_uploads/videos",
      `${tenantId}/${videoId}.mp4`
    );
    console.log({ videoPath });
    if (!fs.existsSync(videoPath)) {
      throw new Error("File not found on disk");
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (!range) {
      return res.status(416).send("Range header required");
    }

    console.log({ range });
    const parts = range.replace(/bytes=/, "").split("-");
    if (!Array.isArray(parts) || parts.length !== 2) {
      throw new Error("Invalid range defined");
    }
    console.log({ parts });
    const start = parseInt(String(parts[0]), 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;

    const file = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": videoData.mimeType || "video/mp4",
    });

    file.pipe(res);
  } catch (error: any) {
    return res.status(400).end();
  }
};

const video = {
  initiateDownload,
  uploadInChunk,
  completeUpload,
  framesAnalysis,
  getAllVideoInfoOfTenant,
  streamVideo,
};

export default video;
