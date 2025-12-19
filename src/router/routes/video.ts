import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import controllers from "../../controller";
import { upload } from "../../config/multer";

const videoRouter = express.Router();
videoRouter.use(authMiddleware);

videoRouter.post("/init", controllers.video.initiateDownload);

videoRouter.post(
  "/upload/chunk",
  upload.single("file"),
  controllers.video.uploadInChunk
);

videoRouter.post("/upload/complete", controllers.video.completeUpload);

export default videoRouter;
