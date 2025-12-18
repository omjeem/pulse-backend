import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import controllers from "../../controller";

const videoRouter = express.Router();
videoRouter.use(authMiddleware)

videoRouter.post("/init", controllers.video.initiateDownload)

export default videoRouter;
