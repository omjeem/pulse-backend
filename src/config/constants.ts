import path from "path";

const Constants = {
  STATUS_CODES: {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
  },
  TEMP_DIR: path.resolve(process.cwd(), "dist_uploads/tmp"),
  FINAL_DIR: path.resolve(process.cwd(), "dist_uploads/videos"),
  EVENTS : {
    initateDownload : "video.initate.download",
    chunkUpload : "video.chunk.upload",
    clubbingStart : "video.clubbing.start",
    clubbingComplete : "video.clubbing.complete",
    frameAnalysis : "video.frames.analysis.start",
    frameAnalysisProgress : "video.frames.analysis.progress",
    frameAnalysisComplete : "video.frames.analysis.complete",
    joinRoom : "room.join"
  }
};

export default Constants;
