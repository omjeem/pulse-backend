import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../config/response";
import services from "../../services";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import Constants from "../../config/constants";

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
    const { videoId, chunkIndex } = body;
    const targetPath = `${videoId}::${chunkIndex}`;

    fs.rename(file?.path!, `${file?.destination}/${targetPath}`, (err) => {
      if (err) {
        console.log("Error in rename", err);
      }
    });

    console.log({ body, file });

    return successResponse(res, "Chunk uoloaded successfully", null);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const completeUpload = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ ok: false });
    }

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

    // await Promise.all(
    //   parts.map((p) => fsp.unlink(path.join(Constants.TEMP_DIR, p)))
    // );

    const stats = await fsp.stat(finalPath);
    console.log({ stats, finalPath });

    return res.json({
      ok: true,
      filePath: finalPath,
      size: stats.size,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false });
  }
};

const framesAnalysis = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const files: any = req.files;
    const { videoId } = body;
    const framesPath = files?.map((f: any) => f.path);
    const framesModeration = await services.moderation.frameModeration(
      framesPath
    );
    console.dir({ framesModeration }, { depth: null });
    return res.json({
      message: "ok",
      framesModeration,
    });
  } catch (error: any) {
    console.log("Error in frame analysis", error);
    return errorResponse(res, error.message);
  }
};

const video = {
  initiateDownload,
  uploadInChunk,
  completeUpload,
  framesAnalysis,
};

export default video;
