import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import controllers from "../../controller";
import { upload } from "../../config/multer";
import { adminOwnerMiddleware } from "../../middlewares/adminOwnerMiddleware";

const videoRouter = express.Router();

videoRouter.get("/stream/:tenantId/:videoId", controllers.video.streamVideo);

videoRouter.get(
  "/:tenantId",
  authMiddleware,
  controllers.video.getAllVideoInfoOfTenant
);

videoRouter.post(
  `/init/:tenantId`,
  authMiddleware,
  adminOwnerMiddleware,
  controllers.video.initiateDownload
);

videoRouter.post(
  "/upload/chunk",
  authMiddleware,
  upload.single("file"),
  controllers.video.uploadInChunk
);

videoRouter.post(
  "/upload/frames",
  authMiddleware,
  upload.array("frames"),
  controllers.video.framesAnalysis
);

videoRouter.post(
  "/upload/complete",
  authMiddleware,
  controllers.video.completeUpload
);

export default videoRouter;
