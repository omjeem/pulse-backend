import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import path from "path";

const ffprobePath =
  typeof ffprobeStatic === "string"
    ? ffprobeStatic
    : ffprobeStatic.path;

function run(cmd: string, args: string[]) {
  return new Promise<{ code: number; stderr: string }>((resolve, reject) => {
    const p = spawn(cmd, args);
    let stderr = "";

    p.stderr.on("data", d => (stderr += d.toString()));
    p.on("error", reject);
    p.on("close", code => resolve({ code: code ?? -1, stderr }));
  });
}

export async function normalizeMp4Video(inputPath: string): Promise<string> {
  const outputPath = inputPath.replace(/\.mp4$/, "") + ".final.mp4";
  console.log({ outputPath, inputPath });

  const transcode = await run(ffmpegPath!, [
    "-y",
    "-analyzeduration", "2147483647",
    "-probesize", "2147483647",
    "-fflags", "+genpts+igndts",
    "-err_detect", "ignore_err",
    "-i", inputPath,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-map", "0",
    outputPath
  ]);

  if (transcode.code !== 0) {
    console.log("First transcode attempt failed, trying with more lenient settings...");
    
    const retryTranscode = await run(ffmpegPath!, [
      "-y",
      "-analyzeduration", "2147483647",
      "-probesize", "2147483647",
      "-fflags", "+genpts+igndts",
      "-err_detect", "ignore_err",
      "-i", inputPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-avoid_negative_ts", "make_zero",
      "-vsync", "cfr",
      outputPath
    ]);

    if (retryTranscode.code !== 0) {
      throw new Error("Transcode failed after retry:\n" + retryTranscode.stderr);
    }
  }
  console.log({outputPath})
  return outputPath;
}